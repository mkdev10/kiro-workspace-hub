# Build Instructions

## Prerequisites
- **Node.js**: 20.20.0 (mise で管理: `.mise.toml`)
- **パッケージマネージャ**: npm
- **ビルドツール**: esbuild
- **OS**: macOS / Windows / Linux

## Build Steps

### 1. Install Dependencies
```bash
mise install       # Node.js バージョンのインストール（初回のみ）
npm install        # パッケージインストール
```

### 2. Build（開発用）
```bash
npm run compile
```

出力: `dist/extension.js`（ソースマップ付き）

### 3. Build（プロダクション用）
```bash
npm run package
```

出力: `dist/extension.js`（minified、ソースマップなし）

### 4. Lint
```bash
npm run lint
```

### 5. VSIX パッケージ作成
```bash
npx vsce package
```

出力: `kiro-workspace-hub-0.1.0.vsix`

## Verify Build Success
- `dist/extension.js` が生成されること
- TypeScript コンパイルエラーが 0 であること
- esbuild がバンドルエラーなく完了すること

## Troubleshooting

### `mise` が見つからない場合
```bash
# macOS (Homebrew)
brew install mise
mise trust
mise install
```

### TypeScript エラーが発生する場合
```bash
# 型定義の再インストール
rm -rf node_modules
npm install
npx tsc --noEmit
```

### esbuild バンドルエラーの場合
- `vscode` モジュールがexternalに含まれているか確認 (`esbuild.js` の `external: ['vscode']`)
