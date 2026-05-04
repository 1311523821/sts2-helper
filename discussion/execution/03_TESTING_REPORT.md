# 测试框架搭建报告

**日期**: 2026-05-04  
**状态**: ✅ 全部完成  
**测试结果**: 75/75 通过

---

## 任务概览

| 任务 | 状态 | 说明 |
|------|------|------|
| 安装测试依赖 | ✅ | vitest, @testing-library/react, jsdom, fake-indexeddb 等 |
| 创建 Vitest 配置 | ✅ | vitest.config.ts + setup.ts + test-utils.tsx |
| cardScorer 单元测试 | ✅ | 20 个测试用例 |
| archetypeEngine 单元测试 | ✅ | 28 个测试用例 |
| saveParser 单元测试 | ✅ | 27 个测试用例 |
| 添加测试脚本 | ✅ | test, test:run, test:coverage |
| 运行测试验证 | ✅ | 75/75 通过 |

---

## 安装的依赖

### devDependencies
- `vitest` ^2.1.9 — 测试框架
- `@vitejs/plugin-react` ^4.7.0 — Vite React 插件（已有，更新）
- `@vitest/coverage-v8` ^4.1.5 — V8 覆盖率
- `jsdom` ^29.1.1 — DOM 环境
- `@testing-library/react` ^16.3.2 — React 测试工具
- `@testing-library/jest-dom` ^6.9.1 — DOM 断言扩展
- `fake-indexeddb` ^6.2.5 — IndexedDB 模拟

---

## 创建的文件

### 配置文件
- **`vitest.config.ts`** — Vitest 配置，启用 jsdom 环境、`@/` 路径别名、V8 覆盖率
- **`src/test/setup.ts`** — 测试初始化，加载 jest-dom 和 fake-indexeddb
- **`src/test/test-utils.tsx`** — 自定义 render 函数（可扩展 providers）

### 测试文件

#### `src/services/__tests__/cardScorer.test.ts` — 20 个测试
- 正常评分流程（多选项返回有效分数）
- 分数降序排列
- 核心卡高分验证（力量流核心卡 vs 基础打击）
- 未知卡牌处理（返回 "未知"、score=50）
- 空选项/空牌库处理
- 各维度评分验证（baseStrength, archetypeFit, synergy 等）
- 楼层适配（前期攻击牌加分）
- 遗物协同
- 0 费牌理由
- 跳过分析（大牌库更倾向跳过、前期不易跳过）
- 推荐理由生成（核心卡提及、0 费灵活性）

#### `src/services/__tests__/archetypeEngine.test.ts` — 28 个测试
- 流派匹配返回完整结果
- 核心卡在牌库中时得分更高
- 空牌库容错
- 断裂引用容错（不存在的卡牌 ID）
- 遗物加成（vajra 力量遗物 + 力量流）
- 子分数正确性
- 缺失核心卡时生成 nextSteps
- 流派识别（排序、阈值过滤）
- Combo 检测（完整/不完整/排序/空牌库）
- 费用曲线分析（too_low 评级）
- 攻防平衡（attack_heavy / defense_heavy / balanced）
- 大牌库健康度问题检测

#### `src/services/__tests__/saveParser.test.ts` — 27 个测试
- JSON 格式解析（标准/嵌套 current_save/save）
- deck 支持字符串数组和对象数组
- relics 支持字符串数组和对象数组
- act 默认值计算（ceil(floor/16)）
- max_health / coins 别名
- 未知角色回退到 ironclad
- 缺失字段默认值
- 无效 JSON 处理
- 文本格式解析（中文/英文键名）
- 中文角色名映射（战士/猎人/机器人/观者/亡灵/储君）
- 升级卡牌检测（+前缀/+后缀）
- 空输入/空白输入处理
- 自动格式检测

---

## package.json scripts

```json
{
  "test": "vitest",
  "test:run": "vitest run",
  "test:coverage": "vitest run --coverage",
  "test:watch": "vitest"
}
```

---

## 测试结果

```
 ✓ src/services/__tests__/archetypeEngine.test.ts (28 tests) 9ms
 ✓ src/services/__tests__/saveParser.test.ts (27 tests) 8ms
 ✓ src/services/__tests__/cardScorer.test.ts (20 tests) 8ms

 Test Files  3 passed (3)
      Tests  75 passed (75)
   Duration  2.28s
```

---

## 注意事项

1. **vitest 版本**: 当前安装 v2.1.9，@vitest/coverage-v8 peer 依赖期望 v4.1.5，有警告但不影响功能
2. **esbuild 构建脚本**: pnpm 默认忽略 esbuild 构建脚本，如需可运行 `pnpm approve-builds`
3. **测试数据**: 使用真实游戏数据（ironclad 卡牌 ID、遗物 ID），确保测试与实际运行一致
4. **模块别名**: vitest.config.ts 中配置了 `@/` → `src/` 的路径别名，与项目 tsconfig 一致
