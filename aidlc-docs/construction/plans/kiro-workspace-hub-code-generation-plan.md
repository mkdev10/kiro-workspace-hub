# Code Generation Plan - Kiro Workspace Hub

## ユニットコンテキスト

- **プロジェクトタイプ**: Greenfield (単一ユニット)
- **ワークスペースルート**: /Users/osphd/kiro-workspace-hub
- **コード配置**: ワークスペースルート直下 (src/, test/)
- **言語**: TypeScript
- **ビルドツール**: esbuild
- **テストフレームワーク**: Mocha + @vscode/test-electron

## 実装するストーリー

| Story | 内容                       | Priority |
| ----- | -------------------------- | -------- |
| US-01 | プロジェクト手動追加       | MVP      |
| US-02 | プロジェクト自動検出設定   | MVP      |
| US-03 | 初回起動オンボーディング   | MVP      |
| US-04 | サイドバープロジェクト一覧 | MVP      |
| US-05 | 新ウィンドウで開く         | MVP      |
| US-06 | 現ウィンドウで開く         | MVP      |
| US-07 | プロジェクト名検索         | MVP      |
| US-11 | プロジェクト登録解除       | MVP      |

## コード生成ステップ

### Step 1: プロジェクト基盤セットアップ
- [x] package.json（拡張機能マニフェスト、依存関係、contributes設定）
- [x] tsconfig.json
- [x] .eslintrc.json
- [x] esbuild.js（バンドル設定）
- [x] .vscodeignore
- [x] .gitignore

### Step 2: 型定義・データモデル
- [x] src/models/types.ts（Project, KiroConfig, HubSettings, ScanResult, ScanProgress）

### Step 3: ユーティリティ
- [x] src/utils/debounce.ts（デバウンスヘルパー）
- [x] src/utils/pathUtils.ts（パス正規化、ホームディレクトリ展開）

### Step 4: StorageService
- [x] src/storageService.ts（~/.kiro-hub/ 永続化、デバウンス書き込み）

### Step 5: KiroConfigReader
- [x] src/kiroConfigReader.ts（.kiro/設定読み取り、キャッシュ）

### Step 6: ProjectScanner
- [x] src/projectScanner.ts（自動検出スキャン、深度制限、除外ルール）

### Step 7: ProjectManager
- [x] src/projectManager.ts（ビジネスロジック、オーケストレーション）

### Step 8: ProjectTreeViewProvider
- [x] src/projectTreeView.ts（ツリービューUI、ノード生成、表示モード切替）

### Step 9: ExtensionController（エントリーポイント）
- [x] src/extension.ts（activate/deactivate、コマンド登録、DI）

### Step 10: リソースファイル
- [x] resources/hub-icon.svg（サイドバーアイコン）

### Step 11: ユニットテスト
- [x] src/test/suite/storageService.test.ts
- [x] src/test/suite/projectScanner.test.ts
- [x] src/test/suite/projectManager.test.ts
- [x] src/test/suite/pathUtils.test.ts
- [x] src/test/runTest.ts（テストランナー）
- [x] src/test/suite/index.ts（テストスイート設定）

### Step 12: ドキュメント
- [x] README.md（使い方、インストール手順）
- [x] CHANGELOG.md
- [x] .mise.toml（Node.js 20.20.0固定）

---

## ファイル構成（最終形）

```
/Users/osphd/kiro-workspace-hub/
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── esbuild.js
├── .vscodeignore
├── .gitignore
├── README.md
├── CHANGELOG.md
├── resources/
│   ├── hub-icon.svg
│   ├── project-icon.svg
│   ├── project-active-icon.svg
│   ├── project-warning-icon.svg
│   └── tag-icon.svg
├── src/
│   ├── extension.ts
│   ├── projectManager.ts
│   ├── projectTreeView.ts
│   ├── projectScanner.ts
│   ├── storageService.ts
│   ├── kiroConfigReader.ts
│   ├── models/
│   │   └── types.ts
│   ├── utils/
│   │   ├── debounce.ts
│   │   └── pathUtils.ts
│   └── test/
│       ├── runTest.ts
│       └── suite/
│           ├── index.ts
│           ├── storageService.test.ts
│           ├── projectScanner.test.ts
│           ├── projectManager.test.ts
│           └── pathUtils.test.ts
└── aidlc-docs/
    └── (documentation only)
```
