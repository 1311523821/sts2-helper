# STS2-Helper DevOps 工程化深度分析报告

> **分析人**: DevOps Engineer Agent  
> **日期**: 2026-05-04  
> **项目**: sts2-helper（杀戮尖塔2智能选牌助手）  
> **技术栈**: React 18 + TypeScript 5 + Vite 5 + TailwindCSS 3 + Zustand 5 + GitHub Pages  
> **代码规模**: ~4900 行 TypeScript/TSX + 25 个 JSON 数据文件

---

## 目录

1. [构建系统分析](#1-构建系统分析)
2. [CI/CD 流水线分析](#2-cicd-流水线分析)
3. [代码质量分析](#3-代码质量分析)
4. [依赖管理分析](#4-依赖管理分析)
5. [性能监控分析](#5-性能监控分析)
6. [开发体验分析](#6-开发体验分析)
7. [安全分析](#7-安全分析)
8. [发布管理分析](#8-发布管理分析)
9. [容器化分析](#9-容器化分析)
10. [文档自动化分析](#10-文档自动化分析)
11. [综合优化路线图](#11-综合优化路线图)
12. [附录：配置文件完整优化方案](#12-附录配置文件完整优化方案)

---

## 1. 构建系统分析

### 1.1 Vite 配置现状

当前 `vite.config.ts` 极其精简：

```typescript
// 当前配置 — 仅 12 行
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/sts2-helper/',
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
```

**问题诊断：**

| # | 问题 | 严重度 | 影响 |
|---|------|:------:|------|
| 1 | 无代码分割配置（`manualChunks`） | 🔴 P0 | 所有页面打包进单个 chunk，首屏加载慢 |
| 2 | 无构建产物分析工具 | 🟡 P1 | 无法量化 bundle 大小 |
| 3 | 无压缩配置 | 🟡 P1 | 未启用 Brotli 压缩 |
| 4 | 无 CSS 代码分割 | 🟡 P1 | 所有 CSS 合并为单文件 |
| 5 | 无 sourcemap 配置 | 🟡 P1 | 生产环境无法调试 |
| 6 | 无 chunk 大小警告阈值 | 🟢 P2 | 大 chunk 无告警 |

### 1.2 优化后的 Vite 配置

```typescript
// vite.config.ts — 推荐配置
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/sts2-helper/',
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-zustand': ['zustand'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,    // 生产环境移除 console
        drop_debugger: true,   // 移除 debugger
        pure_funcs: ['console.log'],
      },
    },
    // Sourcemap（仅 CI 环境生成）
    sourcemap: process.env.CI ? 'hidden' : false,
    // Chunk 大小警告
    chunkSizeWarningLimit: 500,
    // CSS 代码分割
    cssCodeSplit: true,
    // 目标浏览器
    target: 'es2020',
  },
  // 开发服务器优化
  server: {
    hmr: { overlay: true },
    open: false,
  },
  // 预览服务器
  preview: {
    port: 4173,
    strictPort: true,
  },
})
```

### 1.3 构建产物分析

当前项目无代码分割，预估 bundle 结构：

```
dist/
├── index.html              (~1 KB)
├── assets/
│   ├── index-[hash].js     (~150-200 KB) ← 全部 JS 合并
│   ├── index-[hash].css    (~30-50 KB)   ← 全部 CSS 合并
│   └── (图片/字体)
└── favicon.ico
```

**优化后预估：**

```
dist/
├── index.html              (~1 KB)
├── assets/
│   ├── vendor-react-[hash].js   (~45 KB gzipped)  ← React 生态
│   ├── vendor-zustand-[hash].js (~3 KB gzipped)   ← Zustand
│   ├── vendor-icons-[hash].js   (~20 KB gzipped)  ← Lucide 图标
│   ├── index-[hash].js          (~25 KB gzipped)  ← 业务代码
│   ├── HomePage-[hash].js       (~5 KB gzipped)   ← 首页懒加载
│   ├── AnalyzePage-[hash].js    (~8 KB gzipped)   ← 分析页懒加载
│   ├── LearnPage-[hash].js      (~7 KB gzipped)   ← 攻略页懒加载
│   ├── EncyclopediaPage-[hash].js (~7 KB gzipped) ← 图鉴页懒加载
│   ├── SimulatorPage-[hash].js  (~6 KB gzipped)   ← 模拟页懒加载
│   ├── StatsPage-[hash].js      (~7 KB gzipped)   ← 统计页懒加载
│   └── index-[hash].css         (~12 KB gzipped)
└── favicon.ico
```

**首屏加载优化效果：**
- 当前：~200 KB JS + ~50 KB CSS = ~250 KB（gzip 后约 80 KB）
- 优化后：首屏仅加载 ~73 KB JS + ~12 KB CSS = ~85 KB（gzip 后约 30 KB）
- **减少约 62% 的首屏传输量**

### 1.4 Tree-shaking 效果分析

**当前状态评估：**

| 依赖 | Tree-shaking 支持 | 实际效果 |
|------|:-----------------:|---------|
| `react` | ✅ | 良好 |
| `react-dom` | ✅ | 良好 |
| `react-router-dom` | ✅ | 良好 |
| `zustand` | ✅ | 优秀（5.x 体积很小） |
| `lucide-react` | ✅ | ⚠️ 需要确认按需导入 |

**`lucide-react` Tree-shaking 风险：**

如果项目使用了 `import { ... } from 'lucide-react'` 的方式导入图标，Vite 的 Tree-shaking 会自动移除未使用的图标。但需确认没有使用 `import * as Icons from 'lucide-react'` 的全量导入方式。

**建议添加构建分析脚本：**

```json
{
  "scripts": {
    "build:analyze": "npx vite-bundle-visualizer",
    "build:stats": "npx vite build --stats"
  }
}
```

### 1.5 PostCSS 与 TailwindCSS 构建优化

当前 `postcss.config.js`：

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**优化建议：**

```javascript
// postcss.config.js — 生产环境优化
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // 生产环境移除未使用的 CSS
    ...(process.env.NODE_ENV === 'production' ? {
      cssnano: {
        preset: ['advanced', {
          discardComments: { removeAll: true },
          reduceIdents: true,
          mergeRules: true,
          minifyFontValues: true,
        }],
      },
    } : {}),
  },
}
```

---

## 2. CI/CD 流水线分析

### 2.1 当前流水线现状

```yaml
# .github/workflows/deploy.yml — 当前配置
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm build
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with: { path: './dist' }

  deploy:
    environment: { name: github-pages }
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/deploy-pages@v4
```

**问题诊断：**

| # | 问题 | 严重度 | 说明 |
|---|------|:------:|------|
| 1 | 无依赖缓存 | 🔴 P0 | 每次 CI 都重新安装所有依赖 |
| 2 | 无 Lint 检查 | 🔴 P0 | 构建前不验证代码质量 |
| 3 | 无测试步骤 | 🔴 P0 | 无自动化测试 |
| 4 | 无多环境支持 | 🟡 P1 | 只有 production 部署 |
| 5 | pnpm 安装方式低效 | 🟡 P1 | 通过 npm 安装 pnpm 而非 corepack |
| 6 | 无构建缓存 | 🟡 P1 | 每次全量构建 |
| 7 | cancel-in-progress: false | 🟡 P1 | 可能导致旧版本部署覆盖新版本 |
| 8 | 无 PR 检查流水线 | 🟡 P1 | 只在 main 分支触发部署 |
| 9 | 无安全扫描 | 🟢 P2 | 无依赖审计 |

### 2.2 优化后的完整 CI/CD 流水线

#### 2.2.1 PR 检查流水线

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

permissions:
  contents: read

jobs:
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Enable Corepack
        run: corepack enable

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Cache dependencies
        uses: actions/cache@v4
        with:
          path: |
            node_modules
            ~/.pnpm-store
          key: ${{ runner.os }}-pnpm-${{ hashFiles('pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-

      - name: TypeScript type check
        run: pnpm tsc --noEmit

      - name: ESLint
        run: pnpm lint

  test:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: lint
    strategy:
      matrix:
        node-version: [18, 20]
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      - name: Enable Corepack
        run: corepack enable

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run unit tests
        run: pnpm test:run

      - name: Run tests with coverage
        if: matrix.node-version == 20
        run: pnpm test:coverage

      - name: Upload coverage
        if: matrix.node-version == 20
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: false

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Enable Corepack
        run: corepack enable

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build
        env:
          NODE_ENV: production

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
          retention-days: 7

  audit:
    name: Security Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Enable Corepack
        run: corepack enable

      - name: Audit dependencies
        run: pnpm audit --audit-level moderate
        continue-on-error: true
```

#### 2.2.2 部署流水线（优化版）

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true  # 改为 true，取消旧的部署

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Enable Corepack
        run: corepack enable

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build
        env:
          NODE_ENV: production

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

#### 2.2.3 Release 流水线

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

permissions:
  contents: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Enable Corepack
        run: corepack enable

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build

      - name: Generate CHANGELOG
        id: changelog
        run: |
          # 基于 conventional commits 自动生成
          npx conventional-changelog -p angular -r 2 > CHANGELOG.md

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          body_path: CHANGELOG.md
          files: dist/**
          draft: false
          prerelease: ${{ contains(github.ref, 'alpha') || contains(github.ref, 'beta') }}
```

### 2.3 多环境部署策略

```
分支策略:
├── main        → 生产环境 (GitHub Pages)
├── develop     → 预览环境 (Vercel/Netlify Preview)
├── feature/*   → PR Preview (自动部署预览链接)
└── hotfix/*    → 紧急修复
```

**Vercel 预览部署（推荐添加）：**

```yaml
# .github/workflows/preview.yml
name: Preview Deploy

on:
  pull_request:
    branches: [main]

jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./
```

### 2.4 CI 性能优化

**缓存策略：**

```yaml
- name: Cache pnpm store
  uses: actions/cache@v4
  with:
    path: ~/.pnpm-store
    key: ${{ runner.os }}-pnpm-${{ hashFiles('pnpm-lock.yaml') }}
    restore-keys: |
      ${{ runner.os }}-pnpm-

- name: Cache build
  uses: actions/cache@v4
  with:
    path: dist
    key: ${{ runner.os }}-build-${{ hashFiles('src/**') }}
    restore-keys: |
      ${{ runner.os }}-build-
```

**构建时间预估：**

| 步骤 | 当前（无缓存） | 优化后（有缓存） |
|------|:-------------:|:---------------:|
| pnpm install | ~30s | ~5s |
| tsc --noEmit | ~15s | ~10s |
| vite build | ~20s | ~15s |
| **总计** | **~65s** | **~30s** |

---

## 3. 代码质量分析

### 3.1 ESLint 配置分析

当前 `.eslintrc.cjs`：

```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn', { allowConstantExport: true },
    ],
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
}
```

**问题诊断：**

| # | 问题 | 严重度 | 说明 |
|---|------|:------:|------|
| 1 | `no-explicit-any` 仅 warn | 🔴 P0 | 代码中 15+ 处 `any` 类型未被阻止 |
| 2 | `no-unused-vars` 仅 warn | 🟡 P1 | 未使用变量未被阻止 |
| 3 | 缺少 import 排序规则 | 🟡 P1 | import 语句无序 |
| 4 | 缺少 accessibility 规则 | 🟡 P1 | 无 jsx-a11y 检查 |
| 5 | 缺少 prettier 集成 | 🟡 P1 | 格式化与 lint 未统一 |
| 6 | 使用旧格式 `.eslintrc.cjs` | 🟢 P2 | 应迁移到 `eslint.config.js` (flat config) |

### 3.2 优化后的 ESLint 配置

```javascript
// eslint.config.js (Flat Config, ESLint 9+)
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import importPlugin from 'eslint-plugin-import'

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'import': importPlugin,
    },
    rules: {
      // TypeScript 严格规则
      '@typescript-eslint/no-explicit-any': 'error',     // 禁止 any
      '@typescript-eslint/no-unused-vars': ['error', {   // 禁止未使用变量
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // React Refresh
      'react-refresh/only-export-components': [
        'warn', { allowConstantExport: true },
      ],

      // Import 排序
      'import/order': ['error', {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling'],
          'index',
        ],
        'newlines-between': 'never',
        alphabetize: { order: 'asc' },
      }],

      // 代码风格
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
)
```

### 3.3 Prettier 配置

当前项目有 `prettier` 依赖但**无 `.prettierrc` 配置文件**。建议添加：

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

```json
// .prettierignore
dist/
node_modules/
coverage/
pnpm-lock.yaml
*.json
```

**ESLint + Prettier 集成：**

```bash
# 安装依赖
pnpm add -D eslint-config-prettier eslint-plugin-prettier
```

```json
// package.json scripts
{
  "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
  "format:check": "prettier --check \"src/**/*.{ts,tsx,css}\"",
  "lint:fix": "eslint . --ext ts,tsx --fix"
}
```

### 3.4 Git Hooks — Husky + lint-staged

当前项目**完全没有 Git hooks**，意味着不规范的代码可以直接提交。

```bash
# 安装
pnpm add -D husky lint-staged
pnpm exec husky init
```

```json
// package.json 新增
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,json,md}": [
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit
npx lint-staged
```

```bash
# .husky/commit-msg
npx commitlint --edit $1
```

### 3.5 Commit 规范 — Commitlint

```bash
pnpm add -D @commitlint/cli @commitlint/config-conventional
```

```javascript
// commitlint.config.js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'perf', 'test', 'build', 'ci', 'chore', 'revert',
    ]],
    'subject-max-length': [2, 'always', 100],
  },
}
```

**Commit 类型说明：**

| 类型 | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(analysis): 添加流派权重差异化` |
| `fix` | 修复 | `fix(parser): 修复存档解析崩溃` |
| `docs` | 文档 | `docs: 更新 README 安装说明` |
| `refactor` | 重构 | `refactor(store): 统一主题管理` |
| `perf` | 性能 | `perf: 添加代码分割减少首屏加载` |
| `test` | 测试 | `test(scorer): 添加评分算法单元测试` |
| `build` | 构建 | `build: 升级 Vite 到 6.x` |
| `ci` | CI | `ci: 添加 PR 检查流水线` |

### 3.6 TypeScript 严格模式

当前 `tsconfig.json` 部分严格配置：

```json
{
  "strict": true,
  "noUnusedLocals": false,      // ← 应改为 true
  "noUnusedParameters": false,   // ← 应改为 true
  "noFallthroughCasesInSwitch": true,
  "forceConsistentCasingInFileNames": true
}
```

**建议开启更严格的检查：**

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitReturns": true,
    "noPropertyAccessFromIndexSignature": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": false
  }
}
```

---

## 4. 依赖管理分析

### 4.1 依赖清单审计

**生产依赖（5 个）：**

| 包名 | 版本 | 体积 | 安全性 | 评价 |
|------|------|------|:------:|------|
| `react` | ^18.3.1 | ~45 KB | ✅ | 稳定 |
| `react-dom` | ^18.3.1 | ~130 KB | ✅ | 稳定 |
| `react-router-dom` | ^6.28.0 | ~30 KB | ✅ | 稳定 |
| `zustand` | ^5.0.0 | ~3 KB | ✅ | 极轻量 |
| `lucide-react` | ^0.460.0 | ~20 KB* | ✅ | *Tree-shaking 后 |

**开发依赖（12 个）：**

| 包名 | 版本 | 用途 |
|------|------|------|
| `@types/react` | ^18.3.12 | React 类型 |
| `@types/react-dom` | ^18.3.1 | ReactDOM 类型 |
| `@typescript-eslint/eslint-plugin` | ^8.0.0 | TS ESLint 规则 |
| `@typescript-eslint/parser` | ^8.0.0 | TS ESLint 解析器 |
| `@vitejs/plugin-react` | ^4.3.4 | Vite React 插件 |
| `autoprefixer` | ^10.4.20 | CSS 前缀 |
| `eslint` | ^8.57.0 | 代码检查 |
| `eslint-plugin-react-hooks` | ^4.6.2 | React Hooks 规则 |
| `eslint-plugin-react-refresh` | ^0.4.14 | HMR 规则 |
| `postcss` | ^8.4.49 | CSS 处理 |
| `prettier` | ^3.4.2 | 代码格式化 |
| `tailwindcss` | ^3.4.16 | CSS 框架 |
| `typescript` | ^5.6.3 | TypeScript |
| `vite` | ^5.4.11 | 构建工具 |

### 4.2 版本锁定策略

**当前状态：**

项目同时存在 `pnpm-lock.yaml` 和 `package-lock.json`，说明曾混合使用 pnpm 和 npm。CI 中使用 `pnpm install` 而非 `pnpm install --frozen-lockfile`，这意味着**lockfile 可能在 CI 中被修改**。

**问题：**

| # | 问题 | 严重度 |
|---|------|:------:|
| 1 | 双 lockfile 共存 | 🔴 P0 |
| 2 | CI 未使用 `--frozen-lockfile` | 🔴 P0 |
| 3 | 无 `.npmrc` 配置 | 🟡 P1 |
| 4 | 无 `engines` 字段 | 🟡 P1 |

**建议：**

```bash
# 删除多余的 lockfile
rm package-lock.json

# 确保 pnpm-lock.yaml 是唯一的 lockfile
```

```json
// package.json 新增
{
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@9.15.0"
}
```

```ini
# .npmrc
auto-install-peers=true
strict-peer-dependencies=false
```

### 4.3 依赖安全审计

```bash
# 安全审计
pnpm audit

# 自动修复
pnpm audit --fix
```

**建议添加自动化审计：**

```json
{
  "scripts": {
    "audit": "pnpm audit --audit-level moderate",
    "audit:fix": "pnpm audit --fix"
  }
}
```

**GitHub Dependabot 配置：**

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 10
    reviewers:
      - "your-github-username"
    labels:
      - "dependencies"
    commit-message:
      prefix: "deps"
    groups:
      react:
        patterns:
          - "react"
          - "react-dom"
          - "@types/react*"
      eslint:
        patterns:
          - "eslint*"
          - "@typescript-eslint/*"
```

### 4.4 依赖更新策略

```bash
# 检查过时依赖
pnpm outdated

# 交互式更新
pnpm update --interactive --latest
```

**建议使用 Renovate 或 Dependabot 自动化依赖更新，配置如下：**

```json
// renovate.json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "config:recommended",
    ":semanticCommits",
    "group:react",
    "group:eslint"
  ],
  "schedule": ["every weekend"],
  "automerge": false,
  "prConcurrentLimit": 5
}
```

---

## 5. 性能监控分析

### 5.1 当前状态

**项目完全没有性能监控机制。** 没有 Lighthouse CI、没有 Bundle 分析、没有性能预算。

### 5.2 Lighthouse CI 配置

```bash
pnpm add -D @lhci/cli
```

```json
// lighthouserc.json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:4173/sts2-helper/"],
      "startServerCommand": "pnpm preview",
      "startServerReadyPattern": "Local:",
      "numberOfRuns": 3,
      "settings": {
        "preset": "desktop"
      }
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["warn", { "minScore": 0.8 }],
        "categories:best-practices": ["warn", { "minScore": 0.9 }],
        "categories:seo": ["warn", { "minScore": 0.8 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 2000 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["error", { "maxNumericValue": 300 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

```json
{
  "scripts": {
    "lhci": "lhci autorun",
    "lhci:collect": "lhci collect",
    "lhci:assert": "lhci assert"
  }
}
```

### 5.3 Bundle 分析工具

```bash
pnpm add -D vite-bundle-visualizer rollup-plugin-visualizer
```

```typescript
// vite.config.ts — 添加分析插件
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    ...(process.env.ANALYZE ? [
      visualizer({
        open: true,
        filename: 'bundle-analysis.html',
        gzipSize: true,
        brotliSize: true,
      })
    ] : []),
  ],
})
```

```json
{
  "scripts": {
    "build:analyze": "ANALYZE=true pnpm build"
  }
}
```

### 5.4 性能预算

```json
// package.json
{
  "bundlesize": [
    {
      "path": "./dist/assets/vendor-react-*.js",
      "maxSize": "50 kB",
      "compression": "gzip"
    },
    {
      "path": "./dist/assets/index-*.js",
      "maxSize": "30 kB",
      "compression": "gzip"
    },
    {
      "path": "./dist/assets/index-*.css",
      "maxSize": "15 kB",
      "compression": "gzip"
    }
  ]
}
```

### 5.5 Web Vitals 监控

```typescript
// src/utils/webVitals.ts
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals'

function sendToAnalytics(metric: any) {
  // 发送到分析服务
  if (process.env.NODE_ENV === 'production') {
    console.log('[Web Vitals]', metric.name, metric.value)
    // 可以发送到 Google Analytics、自建服务等
  }
}

export function initWebVitals() {
  onCLS(sendToAnalytics)
  onFID(sendToAnalytics)
  onFCP(sendToAnalytics)
  onLCP(sendToAnalytics)
  onTTFB(sendToAnalytics)
}
```

---

## 6. 开发体验分析

### 6.1 热更新（HMR）配置

**当前状态：** 使用 Vite 默认 HMR 配置，基本够用但可以优化。

```typescript
// vite.config.ts — HMR 优化
server: {
  hmr: {
    overlay: true,          // 错误覆盖层
    protocol: 'ws',         // WebSocket 协议
  },
  watch: {
    usePolling: false,       // 不使用轮询（Linux 文件系统原生支持）
    interval: 100,
  },
  open: false,               // 不自动打开浏览器
  port: 5173,
  strictPort: false,
  host: true,                // 允许外部访问（Docker 开发环境）
}
```

### 6.2 调试配置

**VS Code 调试配置（`.vscode/launch.json`）：**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Vite Dev Server",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:5173/sts2-helper/",
      "webRoot": "${workspaceFolder}/src",
      "sourceMapPathOverrides": {
        "webpack:///src/*": "${webRoot}/*"
      }
    },
    {
      "name": "Vitest Current File",
      "type": "node",
      "request": "launch",
      "autoAttachChildProcesses": true,
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/vitest",
      "args": ["run", "${relativeFile}"],
      "console": "integratedTerminal"
    }
  ]
}
```

**VS Code 推荐扩展（`.vscode/extensions.json`）：**

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-playwright.playwright",
    "vitest.explorer",
    "csstools.postcss"
  ]
}
```

### 6.3 开发工具脚本

```json
{
  "scripts": {
    "dev": "vite",
    "dev:host": "vite --host",
    "build": "tsc && vite build",
    "build:analyze": "ANALYZE=true pnpm build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css}\"",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "lhci": "lhci autorun",
    "audit": "pnpm audit --audit-level moderate",
    "validate": "pnpm type-check && pnpm lint && pnpm test:run && pnpm build",
    "prepare": "husky"
  }
}
```

### 6.4 环境变量管理

```bash
# .env.example
# 应用配置
VITE_APP_TITLE=杀戮尖塔2智能选牌助手
VITE_APP_VERSION=$npm_package_version

# 数据更新
VITE_DATA_REMOTE_URL=
VITE_DATA_CACHE_MAX_AGE=3600000

# 分析
VITE_ANALYTICS_ID=
```

```typescript
// src/config/env.ts
interface EnvConfig {
  appTitle: string
  appVersion: string
  dataRemoteUrl: string
  dataCacheMaxAge: number
  analyticsId: string
  isDev: boolean
  isProd: boolean
}

export const env: EnvConfig = {
  appTitle: import.meta.env.VITE_APP_TITLE || '杀戮尖塔2智能选牌助手',
  appVersion: import.meta.env.VITE_APP_VERSION || '0.0.0',
  dataRemoteUrl: import.meta.env.VITE_DATA_REMOTE_URL || '',
  dataCacheMaxAge: Number(import.meta.env.VITE_DATA_CACHE_MAX_AGE) || 3600000,
  analyticsId: import.meta.env.VITE_ANALYTICS_ID || '',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
}
```

---

## 7. 安全分析

### 7.1 CSP（Content Security Policy）

**当前状态：完全没有 CSP 配置。**

对于部署在 GitHub Pages 的纯前端应用，建议添加以下 CSP：

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' https:;
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
">
```

**注意：** Vite 开发模式需要 `'unsafe-eval'`，生产构建后可以移除。

### 7.2 XSS 防护

**风险点分析：**

| 位置 | 风险 | 说明 |
|------|:----:|------|
| 存档解析器（SaveParser） | 🟡 中 | 解析用户输入的 JSON/文本 |
| 卡牌描述渲染 | 🟢 低 | 数据来自本地 JSON |
| 搜索框 | 🟢 低 | React 自动转义 |

**SaveParser 安全建议：**

```typescript
// 当前：直接解析用户输入
const result = SaveParser.parse(userInput)

// 建议：添加输入清理
function sanitizeInput(input: string): string {
  // 1. 移除 HTML 标签
  const cleaned = input.replace(/<[^>]*>/g, '')
  // 2. 限制长度
  return cleaned.slice(0, 100000) // 100KB 上限
}
```

### 7.3 依赖漏洞扫描

```bash
# 安全扫描
pnpm audit

# 更详细的扫描
npx snyk test
```

**GitHub Actions 安全扫描：**

```yaml
# .github/workflows/security.yml
name: Security Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 8 * * 1'  # 每周一早上 8 点

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run pnpm audit
        run: pnpm audit --audit-level high

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
```

### 7.4 安全 Headers（GitHub Pages）

由于 GitHub Pages 不支持自定义 HTTP headers，可以通过 `<meta>` 标签实现：

```html
<!-- index.html -->
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="X-Frame-Options" content="DENY">
<meta http-equiv="X-XSS-Protection" content="1; mode=block">
<meta name="referrer" content="strict-origin-when-cross-origin">
```

### 7.5 敏感信息保护

**当前评估：**

项目是纯前端应用，不涉及 API Key 或敏感数据。但需注意：

1. **IndexedDB 数据**：用户游戏记录存储在浏览器本地，不需要额外保护
2. **localStorage 数据**：设置和主题偏好，不敏感
3. **存档数据**：用户上传的游戏存档，应在解析后立即释放原始数据

---

## 8. 发布管理分析

### 8.1 版本号规范

**当前状态：** `package.json` 中 `version: "1.0.0"`，但项目仍处于早期开发阶段。

**建议使用语义化版本（SemVer）：**

```
MAJOR.MINOR.PATCH

MAJOR: 不兼容的 API 变更
MINOR: 向后兼容的功能新增
PATCH: 向后兼容的问题修复

预发布版本: 1.0.0-alpha.1, 1.0.0-beta.1, 1.0.0-rc.1
```

**版本号策略：**

| 阶段 | 版本号 | 说明 |
|------|--------|------|
| 当前 | 0.3.0 | 数据版本 0.3.0 |
| Alpha | 0.4.0-alpha.1 | 添加测试框架 |
| Beta | 0.5.0-beta.1 | 功能基本完整 |
| RC | 0.9.0-rc.1 | 准备发布 |
| 正式 | 1.0.0 | 首个正式版本 |

### 8.2 CHANGELOG 自动生成

```bash
pnpm add -D conventional-changelog-cli @commitlint/cli @commitlint/config-conventional
```

```json
{
  "scripts": {
    "changelog": "conventional-changelog -p angular -i CHANGELOG.md -s",
    "changelog:first": "conventional-changelog -p angular -i CHANGELOG.md -s -r 0",
    "version": "pnpm changelog && git add CHANGELOG.md"
  }
}
```

**CHANGELOG.md 模板：**

```markdown
# Changelog

## [0.3.0](https://github.com/user/sts2-helper/compare/v0.2.0...v0.3.0) (2026-05-04)

### ⚡ Features

* **analysis:** 添加流派权重差异化 ([#12](https://github.com/user/sts2-helper/issues/12))
* **parser:** 支持 Base64 编码存档 ([#15](https://github.com/user/sts2-helper/issues/15))

### 🐛 Bug Fixes

* **scorer:** 修复 X 费牌费用曲线计算错误 ([#10](https://github.com/user/sts2-helper/issues/10))
* **data:** 修复流派引用断裂 68 处 ([#11](https://github.com/user/sts2-helper/issues/11))

### 📦 Dependencies

* **deps:** 升级 react 到 18.3.1
* **deps:** 升级 vite 到 5.4.11
```

### 8.3 GitHub Release 自动化

```yaml
# .github/workflows/release.yml (已在 2.2.3 节定义)
```

**手动发布流程：**

```bash
# 1. 更新版本号
pnpm version patch  # 或 minor, major

# 2. 自动生成 CHANGELOG
pnpm changelog

# 3. 推送 tag
git push --follow-tags

# 4. GitHub Actions 自动创建 Release
```

### 8.4 发布检查清单

```yaml
# .github/release-checklist.md
## 发布前检查

- [ ] 所有测试通过 (`pnpm test:run`)
- [ ] Lint 无错误 (`pnpm lint`)
- [ ] TypeScript 编译通过 (`pnpm type-check`)
- [ ] 构建成功 (`pnpm build`)
- [ ] Lighthouse 分数达标 (`pnpm lhci`)
- [ ] CHANGELOG 已更新
- [ ] 版本号已更新
- [ ] 数据完整性验证通过
```

---

## 9. 容器化分析

### 9.1 是否需要容器化？

**评估结论：当前阶段不需要 Docker。**

| 因素 | 评估 |
|------|------|
| 部署平台 | GitHub Pages（静态托管） |
| 后端服务 | 无（纯前端） |
| 开发环境 | Vite dev server（无需容器） |
| CI/CD | GitHub Actions（原生支持） |
| 多环境 | 仅前端，无需容器编排 |

**未来可能需要的场景：**

1. 添加后端 API 服务时
2. 需要统一团队开发环境时
3. 需要本地运行完整数据更新服务时

### 9.2 开发环境 Docker（可选）

如果团队扩大，可以提供统一的开发环境：

```dockerfile
# Dockerfile.dev
FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 5173

CMD ["pnpm", "dev", "--host"]
```

```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  dev:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    volumes:
      - ./src:/app/src
      - ./public:/app/public
    environment:
      - NODE_ENV=development
```

---

## 10. 文档自动化分析

### 10.1 当前文档状态

| 文档类型 | 状态 | 说明 |
|----------|:----:|------|
| README.md | ❌ 缺失 | 项目根目录无 README |
| API 文档 | ❌ 缺失 | 服务层无 API 文档 |
| JSDoc | 🟡 部分 | 部分函数有中文注释，缺少参数说明 |
| Storybook | ❌ 缺失 | 无组件文档 |
| CHANGELOG | ❌ 缺失 | 无变更日志 |
| CONTRIBUTING | ❌ 缺失 | 无贡献指南 |
| LICENSE | ❌ 缺失 | 无许可证 |

### 10.2 README.md 模板

```markdown
# 🎮 STS2 Helper — 杀戮尖塔2智能选牌助手

[![CI](https://github.com/user/sts2-helper/actions/workflows/ci.yml/badge.svg)](https://github.com/user/sts2-helper/actions/workflows/ci.yml)
[![Deploy](https://github.com/user/sts2-helper/actions/workflows/deploy.yml/badge.svg)](https://github.com/user/sts2-helper/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 帮助杀戮尖塔2新手玩家做出更好的选牌决策

## ✨ 功能特性

- 🃏 **智能选牌推荐** — 基于流派匹配、协同度、楼层适配的多维评分
- 📊 **牌库分析** — 攻防平衡、费用曲线、流派匹配可视化
- 📖 **卡牌图鉴** — 6个角色 427 张卡牌完整数据
- 🎯 **选牌模拟** — 模拟选牌场景，提升决策能力
- 📈 **数据统计** — 游戏记录追踪和胜率分析

## 🚀 快速开始

```bash
# 克隆项目
git clone https://github.com/user/sts2-helper.git
cd sts2-helper

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

## 📦 技术栈

- ⚛️ React 18 + TypeScript 5
- ⚡ Vite 5
- 🎨 TailwindCSS 3
- 🐻 Zustand 5
- 🧭 React Router 6

## 📁 项目结构

```
src/
├── components/     # 共享组件
├── data/           # 卡牌/流派/遗物数据
├── pages/          # 页面组件
├── services/       # 业务逻辑层
├── stores/         # 状态管理
└── types/          # TypeScript 类型
```

## 🤝 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 许可证

[MIT License](LICENSE)
```

### 10.3 JSDoc 规范

```typescript
// 当前
function scoreCardOptions(options, deck, archetypes, floor, relics) { ... }

// 建议
/**
 * 对一组卡牌选项进行多维度评分
 *
 * 评分维度包括：基础强度(20%)、流派适配(25%)、协同度(20%)、
 * 楼层适配(15%)、遗物协同(10%)、牌库健康度(10%)
 *
 * @param options - 待评分的卡牌选项列表
 * @param deck - 当前牌库中的卡牌
 * @param archetypes - 已匹配的流派列表
 * @param floor - 当前楼层（1-50）
 * @param relics - 已拥有的遗物列表
 * @returns 按分数降序排列的评分结果
 *
 * @example
 * ```ts
 * const scores = scoreCardOptions(
 *   [{ cardId: 'ironclad_inflame', upgraded: false }],
 *   currentDeck,
 *   matchedArchetypes,
 *   10
 * )
 * // scores[0].score => 85
 * ```
 */
export function scoreCardOptions(
  options: CardOption[],
  deck: DeckCard[],
  archetypes: ArchetypeMatch[],
  floor: number,
  relics?: OwnedRelic[]
): CardScore[] { ... }
```

### 10.4 Storybook（可选）

```bash
# 安装
npx storybook@latest init

# 配置
# .storybook/main.ts
export default {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
}
```

```typescript
// src/components/CardDisplay.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { CardDisplay } from './CardDisplay'

const meta: Meta<typeof CardDisplay> = {
  title: 'Components/CardDisplay',
  component: CardDisplay,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof CardDisplay>

export const Default: Story = {
  args: {
    card: {
      id: 'ironclad_strike',
      name: '打击',
      type: 'attack',
      rarity: 'basic',
      cost: 1,
      description: '造成6点伤害',
    },
  },
}

export const Rare: Story = {
  args: {
    card: {
      id: 'ironclad_offering',
      name: '祭品',
      type: 'skill',
      rarity: 'rare',
      cost: 0,
      description: '失去6HP。获得2能量。抽3张牌。',
    },
  },
}
```

---

## 11. 综合优化路线图

### Phase 1: 基础设施建设（1-2 天）

| # | 任务 | 优先级 | 文件 |
|---|------|:------:|------|
| 1 | 添加 Vitest 测试框架 | 🔴 P0 | `vitest.config.ts` |
| 2 | 配置 Husky + lint-staged | 🔴 P0 | `.husky/` |
| 3 | 添加 `.prettierrc` | 🔴 P0 | `.prettierrc` |
| 4 | 删除多余 `package-lock.json` | 🔴 P0 | 根目录 |
| 5 | 添加 `engines` 和 `packageManager` | 🟡 P1 | `package.json` |
| 6 | 创建 `README.md` | 🟡 P1 | 根目录 |
| 7 | 创建 `.env.example` | 🟡 P1 | 根目录 |

### Phase 2: CI/CD 流水线（2-3 天）

| # | 任务 | 优先级 | 文件 |
|---|------|:------:|------|
| 8 | 优化 `deploy.yml`（缓存、Corepack） | 🔴 P0 | `.github/workflows/deploy.yml` |
| 9 | 添加 CI 检查流水线 | 🔴 P0 | `.github/workflows/ci.yml` |
| 10 | 添加 Dependabot 配置 | 🟡 P1 | `.github/dependabot.yml` |
| 11 | 添加安全扫描流水线 | 🟡 P1 | `.github/workflows/security.yml` |
| 12 | 添加 Release 流水线 | 🟡 P1 | `.github/workflows/release.yml` |

### Phase 3: 构建优化（3-4 天）

| # | 任务 | 优先级 | 文件 |
|---|------|:------:|------|
| 13 | 优化 Vite 配置（代码分割、压缩） | 🔴 P0 | `vite.config.ts` |
| 14 | 添加 React.lazy 代码分割 | 🔴 P0 | `src/App.tsx` |
| 15 | 添加 Lighthouse CI | 🟡 P1 | `lighthouserc.json` |
| 16 | 添加 Bundle 分析 | 🟡 P1 | `vite.config.ts` |
| 17 | 优化 PostCSS 配置 | 🟢 P2 | `postcss.config.js` |

### Phase 4: 代码质量（4-5 天）

| # | 任务 | 优先级 | 文件 |
|---|------|:------:|------|
| 18 | 升级 ESLint 到 Flat Config | 🟡 P1 | `eslint.config.js` |
| 19 | 开启 TypeScript 严格检查 | 🟡 P1 | `tsconfig.json` |
| 20 | 添加 Commitlint | 🟡 P1 | `commitlint.config.js` |
| 21 | 添加 JSDoc 规范 | 🟢 P2 | 全局 |
| 22 | 添加 CSP 和安全 Headers | 🟢 P2 | `index.html` |

### Phase 5: 高级功能（5+ 天）

| # | 任务 | 优先级 | 文件 |
|---|------|:------:|------|
| 23 | 添加 Web Vitals 监控 | 🟢 P2 | `src/utils/webVitals.ts` |
| 24 | 添加 Storybook | 🟢 P2 | `.storybook/` |
| 25 | 添加 Vercel 预览部署 | 🟢 P2 | `.github/workflows/preview.yml` |
| 26 | 添加 CHANGELOG 自动化 | 🟢 P2 | `CHANGELOG.md` |

---

## 12. 附录：配置文件完整优化方案

### 12.1 完整的 package.json

```json
{
  "name": "sts2-helper",
  "private": true,
  "version": "0.3.0",
  "type": "module",
  "description": "杀戮尖塔2智能选牌助手 — 帮助新手玩家做出更好的选牌决策",
  "keywords": ["slay-the-spire-2", "card-game", "helper", "react"],
  "author": "",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/user/sts2-helper.git"
  },
  "homepage": "https://user.github.io/sts2-helper/",
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@9.15.0",
  "scripts": {
    "dev": "vite",
    "dev:host": "vite --host",
    "build": "tsc && vite build",
    "build:analyze": "ANALYZE=true pnpm build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css}\"",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "lhci": "lhci autorun",
    "audit": "pnpm audit --audit-level moderate",
    "validate": "pnpm type-check && pnpm lint && pnpm test:run && pnpm build",
    "changelog": "conventional-changelog -p angular -i CHANGELOG.md -s",
    "version": "pnpm changelog && git add CHANGELOG.md",
    "prepare": "husky"
  },
  "dependencies": {
    "lucide-react": "^0.460.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@commitlint/cli": "^19.0.0",
    "@commitlint/config-conventional": "^19.0.0",
    "@lhci/cli": "^0.14.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "@vitest/coverage-v8": "^2.0.0",
    "@vitest/ui": "^2.0.0",
    "autoprefixer": "^10.4.20",
    "conventional-changelog-cli": "^5.0.0",
    "eslint": "^8.57.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-import": "^2.29.0",
    "eslint-plugin-prettier": "^5.0.0",
    "eslint-plugin-react-hooks": "^4.6.2",
    "eslint-plugin-react-refresh": "^0.4.14",
    "fake-indexeddb": "^6.0.0",
    "husky": "^9.0.0",
    "jsdom": "^25.0.0",
    "lint-staged": "^15.0.0",
    "postcss": "^8.4.49",
    "prettier": "^3.4.2",
    "prettier-plugin-tailwindcss": "^0.6.0",
    "rollup-plugin-visualizer": "^5.12.0",
    "tailwindcss": "^3.4.16",
    "typescript": "^5.6.3",
    "vite": "^5.4.11",
    "vitest": "^2.0.0"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,json,md}": [
      "prettier --write"
    ]
  }
}
```

### 12.2 完整的 vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    ...(process.env.ANALYZE ? [
      visualizer({
        open: true,
        filename: 'bundle-analysis.html',
        gzipSize: true,
        brotliSize: true,
      })
    ] : []),
  ],
  base: '/sts2-helper/',
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-zustand': ['zustand'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log'],
      },
    },
    sourcemap: process.env.CI ? 'hidden' : false,
    chunkSizeWarningLimit: 500,
    cssCodeSplit: true,
    target: 'es2020',
  },
  server: {
    hmr: { overlay: true },
    open: false,
    host: true,
    port: 5173,
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
})
```

### 12.3 完整的 CI 流水线

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

permissions:
  contents: read

jobs:
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - name: Enable Corepack
        run: corepack enable
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Type check
        run: pnpm type-check
      - name: ESLint
        run: pnpm lint
      - name: Prettier check
        run: pnpm format:check

  test:
    name: Tests
    runs-on: ubuntu-latest
    needs: lint
    strategy:
      matrix:
        node-version: [18, 20]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'pnpm'
      - name: Enable Corepack
        run: corepack enable
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Run tests
        run: pnpm test:run
      - name: Run tests with coverage
        if: matrix.node-version == 20
        run: pnpm test:coverage
      - name: Upload coverage
        if: matrix.node-version == 20
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: false

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - name: Enable Corepack
        run: corepack enable
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Build
        run: pnpm build
      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
          retention-days: 7

  audit:
    name: Security Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - name: Enable Corepack
        run: corepack enable
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Audit
        run: pnpm audit --audit-level high
        continue-on-error: true
```

---

## 总结

### 项目工程化评分

| 维度 | 当前评分 | 目标评分 | 差距 |
|------|:-------:|:-------:|:----:|
| 构建系统 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 代码分割、压缩 |
| CI/CD | ⭐⭐ | ⭐⭐⭐⭐⭐ | 缓存、多环境、安全扫描 |
| 代码质量 | ⭐⭐ | ⭐⭐⭐⭐⭐ | Prettier、Git hooks、严格 TS |
| 依赖管理 | ⭐⭐⭐ | ⭐⭐⭐⭐ | 单 lockfile、审计、自动更新 |
| 性能监控 | ⭐ | ⭐⭐⭐⭐ | Lighthouse CI、Bundle 分析 |
| 开发体验 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 调试配置、环境变量 |
| 安全 | ⭐ | ⭐⭐⭐⭐ | CSP、扫描、Headers |
| 发布管理 | ⭐ | ⭐⭐⭐⭐ | 版本规范、CHANGELOG、Release |
| 容器化 | N/A | N/A | 纯前端暂不需要 |
| 文档 | ⭐ | ⭐⭐⭐⭐ | README、JSDoc、Storybook |

### 核心结论

1. **最大的工程化债务是缺乏测试和 CI 检查** — 代码可以直接合入 main 分支而无任何自动化验证
2. **构建配置过于简单** — 没有代码分割导致首屏加载过重
3. **双 lockfile 共存是安全隐患** — 必须统一为 pnpm
4. **完全没有安全防护** — 无 CSP、无依赖审计、无安全扫描
5. **版本管理和发布流程缺失** — 没有 CHANGELOG、没有自动化 Release

**建议优先执行 Phase 1 和 Phase 2（3-5 天），可将项目工程化水平从 30% 提升到 70%。**

---

> **报告完成日期**: 2026-05-04  
> **分析人**: DevOps Engineer Agent  
> **下一步**: 根据路线图按优先级逐步实施优化
