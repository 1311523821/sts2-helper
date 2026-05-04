# 前端架构修复报告

## 修复概览

本次修复完成了6个P0级前端架构问题，所有修改已通过 TypeScript 类型检查和 Vite 生产构建验证。

---

## 任务1：合并双主题Store ✅

**问题**：`settingsStore.ts` 和 `themeStore.ts` 存在职责重叠，两套主题管理逻辑并存。

**修改**：
- **删除** `src/stores/settingsStore.ts`（该文件未被任何其他文件引用，可安全删除）
- **重写** `src/stores/themeStore.ts` 为统一设置Store，包含：
  - `theme`（ThemeMode: 'light' | 'dark' | 'system'）
  - `language`（Language: 'zh-CN' | 'en'）
  - `fontSize`（FontSize: 'small' | 'medium' | 'large'）
  - `compactMode`（boolean）
  - `showAdvancedAnalysis`（boolean）
  - `autoSaveRecords`（boolean）
  - `dataRemoteUrl`（string）
- 使用 `zustand/middleware/persist` 替代手动 localStorage 管理
- 保留 `applyTheme()` 函数支持暗色主题切换
- 添加系统主题变化监听（system 模式下跟随系统设置）
- 导出 `useSettingsStore` 保持命名一致性

---

## 任务2：React.lazy 代码分割 ✅

**问题**：所有页面组件同步加载，首屏加载体积过大。

**修改**：
- **创建** `src/components/LoadingSpinner.tsx` — 带旋转动画的加载指示器
- **修改** `src/App.tsx`：
  - 使用 `lazy()` 按页面分割代码
  - 使用 `<Suspense fallback={<LoadingSpinner />}>` 包裹路由
- **修改** 所有6个页面组件，将 `export function` 改为 `export default function`：
  - `AnalyzePage.tsx`、`EncyclopediaPage.tsx`、`HomePage.tsx`
  - `LearnPage.tsx`、`SimulatorPage.tsx`、`StatsPage.tsx`

**构建产物验证**：
```
HomePage          → 5.01 kB (gzip: 2.21 kB)
EncyclopediaPage  → 9.56 kB (gzip: 3.19 kB)
LearnPage         → 10.34 kB (gzip: 2.83 kB)
SimulatorPage     → 6.82 kB (gzip: 2.61 kB)
StatsPage         → 12.05 kB (gzip: 3.19 kB)
AnalyzePage       → 13.95 kB (gzip: 4.38 kB)
```

---

## 任务3：消除 any 类型 ✅

**问题**：`AnalyzePage.tsx` 中子组件参数使用 `any` 类型。

**修改**：
- 为 `DeckManager` 定义 `DeckManagerProps` 接口（13个属性，全部类型化）
- 为 `RewardAnalyzer` 定义 `RewardAnalyzerProps` 接口（4个属性）
- 为 `DeckStats` 定义 `DeckStatsProps` 接口及 `DeckStatsData` 辅助类型
- 为 `GroupToggle` 定义 `GroupToggleProps` 接口
- 将 `onChange` 事件处理器类型从 `(e: any)` 改为具体类型（`React.ChangeEvent<HTMLInputElement>` 等）
- 将 `Object.entries` 迭代中的 `[string, any]` 替换为正确类型

---

## 任务4：拆分 AnalyzePage 子组件 ✅

**问题**：`AnalyzePage.tsx` 包含4个内联子组件，文件过大难以维护。

**提取到 `src/components/analyze/` 目录**：
| 组件 | 文件 | 职责 |
|------|------|------|
| `DeckManager` | `DeckManager.tsx` | 牌库管理面板（搜索、分组、拖拽、卡牌网格） |
| `RewardAnalyzer` | `RewardAnalyzer.tsx` | 选牌推荐面板（输入、分析、结果展示） |
| `DeckStats` | `DeckStats.tsx` | 牌库统计面板（概览、费用曲线、类型/稀有度分布） |
| `GroupToggle` | `GroupToggle.tsx` | 分组模式切换按钮（类型/费用/稀有度） |

`AnalyzePage.tsx` 从 **360行** 精简至 **172行**，仅保留页面编排逻辑。

---

## 任务5：添加 Error Boundary ✅

**问题**：页面运行时错误会导致整个应用白屏。

**修改**：
- **创建** `src/components/ErrorBoundary.tsx`：
  - Class 组件，捕获子组件渲染错误
  - 展示友好的错误提示界面（⚠️ 图标 + 错误信息 + 重试按钮）
  - 支持自定义 `fallback` 属性
  - 错误信息输出到 console 便于调试
- **修改** `src/App.tsx`：用 `<ErrorBoundary>` 包裹 `<Suspense>` 和 `<Routes>`

---

## 任务6：提取共享常量 ✅

**问题**：`TYPE_ICONS`、`TYPE_NAMES`、`RARITY_NAMES`、`RARITY_COLORS` 等常量在5个文件中重复定义。

**创建** `src/constants.ts`，包含以下共享常量：
| 常量 | 用途 |
|------|------|
| `TYPE_ICONS` | 卡牌类型图标映射 |
| `TYPE_NAMES` | 卡牌类型中文名 |
| `TYPE_COLORS` | 卡牌类型主色（hex） |
| `RARITY_NAMES` | 稀有度中文名 |
| `RARITY_COLORS` | 稀有度文字颜色类名 |
| `RARITY_BG_COLORS` | 稀有度背景色类名 |
| `RARITY_TAG_COLORS` | 稀有度标签颜色（文字+背景） |
| `RARITY_BORDER` | 稀有度边框类名 |
| `RARITY_GLOW` | 稀有度光效类名 |

**更新的文件**：
- `src/components/CardDisplay.tsx` — 移除6个内联常量，改为从 `@/constants` 导入
- `src/pages/EncyclopediaPage.tsx` — 移除4个内联常量，`RARITY_COLORS` → `RARITY_TAG_COLORS`
- `src/pages/StatsPage.tsx` — 移除3个内联常量
- `src/pages/AnalyzePage.tsx` — 移除2个内联常量
- `src/components/RecommendationPanel.tsx` — 保留独立的 `TYPE_NAMES`（值不同：攻击牌 vs 攻击）

---

## 验证结果

- ✅ `tsc --noEmit` 通过（仅测试文件的 `require` 类型问题，与本次修改无关）
- ✅ `vite build` 成功，产物大小合理
- ✅ 所有页面代码分割正常
- ✅ 无 `any` 类型残留
- ✅ 所有常量统一引用

## 文件变更清单

| 操作 | 文件 |
|------|------|
| 删除 | `src/stores/settingsStore.ts` |
| 重写 | `src/stores/themeStore.ts` |
| 重写 | `src/App.tsx` |
| 重写 | `src/pages/AnalyzePage.tsx` |
| 修改 | `src/pages/EncyclopediaPage.tsx` |
| 修改 | `src/pages/StatsPage.tsx` |
| 修改 | `src/components/CardDisplay.tsx` |
| 新建 | `src/constants.ts` |
| 新建 | `src/components/ErrorBoundary.tsx` |
| 新建 | `src/components/LoadingSpinner.tsx` |
| 新建 | `src/components/analyze/DeckManager.tsx` |
| 新建 | `src/components/analyze/RewardAnalyzer.tsx` |
| 新建 | `src/components/analyze/DeckStats.tsx` |
| 新建 | `src/components/analyze/GroupToggle.tsx` |
