# Unit Test Execution

## テストフレームワーク
- **テストランナー**: Mocha
- **テスト環境**: @vscode/test-electron (VSCode拡張機能テスト用)
- **アサーション**: Node.js assert モジュール

## テストファイル
| ファイル                                | テスト対象                     |
| --------------------------------------- | ------------------------------ |
| `src/test/suite/pathUtils.test.ts`      | パス正規化、短縮表示           |
| `src/test/suite/storageService.test.ts` | 永続化サービス初期状態         |
| `src/test/suite/projectScanner.test.ts` | 自動検出スキャン               |
| `src/test/suite/projectManager.test.ts` | ビジネスロジック（検索、タグ） |

## Run Unit Tests

### 1. テストをコンパイル
```bash
npm run compile-tests
```

### 2. テスト実行（VSCode Extension Test環境）
```bash
npm test
```

**注意**: `npm test` はVSCode Extension Test Electron環境を起動するため、
CI環境ではディスプレイサーバー（xvfb）が必要。

### 3. 個別テストの実行（開発時）
ロジックのみのテスト（VSCode API非依存）はTypeScript直接実行も可能:
```bash
npx tsc -p tsconfig.test.json
node -e "require('./dist/test/suite/pathUtils.test.js')"
```

## Expected Results
- **pathUtils.test.ts**: 7テスト pass
- **storageService.test.ts**: 3テスト pass
- **projectScanner.test.ts**: 5テスト pass
- **projectManager.test.ts**: 4テスト pass
- **合計**: 19テスト pass, 0 failures

## Test Coverage
- 現時点ではカバレッジツール未設定
- 主要ビジネスロジック（検索、タグ処理、パス正規化、スキャン）をカバー
- VSCode API依存部分はモック不使用のため、統合テストとして実行
