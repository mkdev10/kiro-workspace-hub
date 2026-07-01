# コンポーネントメソッド定義

## ProjectTreeViewProvider

| メソッド                | 入力                           | 出力                  | 目的                                                    |
| ----------------------- | ------------------------------ | --------------------- | ------------------------------------------------------- |
| `getTreeItem(element)`  | `ProjectTreeItem`              | `vscode.TreeItem`     | ツリーアイテムの表示情報を返す                          |
| `getChildren(element?)` | `ProjectTreeItem \| undefined` | `ProjectTreeItem[]`   | 子ノードを返す（ルート=全プロジェクト or タググループ） |
| `refresh()`             | -                              | `void`                | ツリービュー全体を再描画する                            |
| `setViewMode(mode)`     | `'flat' \| 'grouped'`          | `void`                | 表示モードを切り替える                                  |
| `setFilter(query)`      | `string`                       | `void`                | フィルタテキストを設定してツリーを更新                  |
| `getCurrentHighlight()` | -                              | `string \| undefined` | 現在ハイライト中のプロジェクトパスを返す                |

---

## ProjectManager

| メソッド                  | 入力                       | 出力                  | 目的                                 |
| ------------------------- | -------------------------- | --------------------- | ------------------------------------ |
| `addProject(folderPath)`  | `string`                   | `Promise<Project>`    | プロジェクトを手動登録する           |
| `removeProject(id)`       | `string`                   | `Promise<void>`       | プロジェクトの登録を解除する         |
| `getProjects()`           | -                          | `Project[]`           | 全プロジェクトを取得する             |
| `getProjectsByTag(tag)`   | `string`                   | `Project[]`           | タグでフィルタしたプロジェクトを取得 |
| `searchProjects(query)`   | `string`                   | `Project[]`           | 名前で部分一致検索                   |
| `updateProject(id, data)` | `string, Partial<Project>` | `Promise<Project>`    | プロジェクト情報を更新する           |
| `openInNewWindow(id)`     | `string`                   | `Promise<void>`       | 新ウィンドウでプロジェクトを開く     |
| `openInCurrentWindow(id)` | `string`                   | `Promise<void>`       | 現ウィンドウでプロジェクトを開く     |
| `scanForProjects()`       | -                          | `Promise<Project[]>`  | 自動検出スキャンを実行する           |
| `getProjectConfig(id)`    | `string`                   | `Promise<KiroConfig>` | プロジェクトのKiro設定概要を取得     |

**イベント**:
- `onProjectsChanged: Event<void>` — プロジェクト一覧変更時

---

## ProjectScanner

| メソッド              | 入力       | 出力                    | 目的                             |
| --------------------- | ---------- | ----------------------- | -------------------------------- |
| `scan(rootPaths)`     | `string[]` | `Promise<ScanResult[]>` | 指定パス配下をスキャンする       |
| `cancelScan()`        | -          | `void`                  | 実行中のスキャンをキャンセルする |
| `getScanPaths()`      | -          | `string[]`              | 設定されたスキャンパスを取得     |
| `setScanPaths(paths)` | `string[]` | `Promise<void>`         | スキャンパスを設定する           |

**イベント**:
- `onScanProgress: Event<ScanProgress>` — スキャン進捗通知
- `onScanComplete: Event<ScanResult[]>` — スキャン完了通知

---

## StorageService

| メソッド                 | 入力          | 出力                   | 目的                                         |
| ------------------------ | ------------- | ---------------------- | -------------------------------------------- |
| `initialize()`           | -             | `Promise<void>`        | ~/.kiro-hub/ディレクトリとファイルを初期化   |
| `loadProjects()`         | -             | `Promise<Project[]>`   | 保存済みプロジェクト一覧を読み込む           |
| `saveProjects(projects)` | `Project[]`   | `Promise<void>`        | プロジェクト一覧を保存する（デバウンス付き） |
| `loadSettings()`         | -             | `Promise<HubSettings>` | 拡張機能設定を読み込む                       |
| `saveSettings(settings)` | `HubSettings` | `Promise<void>`        | 拡張機能設定を保存する                       |
| `flush()`                | -             | `Promise<void>`        | デバウンス中の書き込みを即時実行             |

---

## KiroConfigReader

| メソッド                         | 入力                  | 出力                  | 目的                         |
| -------------------------------- | --------------------- | --------------------- | ---------------------------- |
| `readConfig(projectPath)`        | `string`              | `Promise<KiroConfig>` | .kiro/から設定概要を読み取る |
| `getHookCount(projectPath)`      | `string`              | `Promise<number>`     | hook数を取得                 |
| `getSteeringCount(projectPath)`  | `string`              | `Promise<number>`     | steering数を取得             |
| `getMcpServerCount(projectPath)` | `string`              | `Promise<number>`     | MCPサーバー数を取得          |
| `clearCache(projectPath?)`       | `string \| undefined` | `void`                | キャッシュをクリア           |

---

## ExtensionController

| メソッド                 | 入力                      | 出力            | 目的                         |
| ------------------------ | ------------------------- | --------------- | ---------------------------- |
| `activate(context)`      | `vscode.ExtensionContext` | `void`          | 拡張機能を初期化する         |
| `deactivate()`           | -                         | `void`          | リソースをクリーンアップする |
| `registerCommands()`     | -                         | `void`          | 全コマンドをVSCodeに登録する |
| `initializeComponents()` | -                         | `Promise<void>` | 各コンポーネントを初期化する |
| `showOnboarding()`       | -                         | `Promise<void>` | 初回起動ガイドを表示する     |

---

## 主要データ型

```typescript
interface Project {
  id: string;           // UUID
  name: string;         // 表示名
  path: string;         // フォルダの絶対パス
  tags: string[];       // ユーザー定義タグ
  description: string;  // 説明文
  addedAt: string;      // 登録日時 (ISO 8601)
  lastOpenedAt: string; // 最終アクセス日時 (ISO 8601)
  source: 'manual' | 'scanned';  // 登録方法
}

interface KiroConfig {
  hookCount: number;
  steeringCount: number;
  mcpServerCount: number;
  lastReadAt: string;   // キャッシュ日時
}

interface HubSettings {
  scanPaths: string[];        // 自動検出スキャンパス
  viewMode: 'flat' | 'grouped';  // ツリービュー表示モード
  defaultOpenMode: 'newWindow' | 'currentWindow';  // デフォルト開き方
}

interface ScanResult {
  path: string;
  hasKiroDir: boolean;
  alreadyRegistered: boolean;
}

interface ScanProgress {
  scannedCount: number;
  foundCount: number;
  currentPath: string;
}
```
