# コンポーネント依存関係

## 依存関係図

```
+---------------------+
| ExtensionController |  ← エントリーポイント（activate関数）
+---------------------+
         |
         | 初期化・DI
         v
+---------------------+       イベント通知        +-------------------------+
|   ProjectManager    | ─────────────────────────>| ProjectTreeViewProvider |
|  (オーケストレーター)  |  onProjectsChanged       |    (ツリービューUI)       |
+---------------------+                          +-------------------------+
    |       |       |                                      |
    |       |       |  直接呼び出し                          | 直接呼び出し
    |       |       |  (データ取得)                          | (データ取得)
    v       v       v                                      v
+-------+ +-------+ +---------+                   +---------------------+
|Storage| |Scanner| |KiroConf |                   |   ProjectManager    |
|Service| |       | |Reader   |                   | (getProjects, etc.) |
+-------+ +-------+ +---------+                   +---------------------+
    |
    v
 ~/.kiro-hub/
 (JSON files)
```

## 依存関係マトリクス

| コンポーネント                           | 依存先                                                  | 依存の種類                        |
| ---------------------------------------- | ------------------------------------------------------- | --------------------------------- |
| ExtensionController                      | ProjectManager, ProjectTreeViewProvider, StorageService | 初期化・DI                        |
| ProjectTreeViewProvider                  | ProjectManager                                          | 直接呼び出し（データ取得）        |
| ProjectManager                           | StorageService, ProjectScanner, KiroConfigReader        | 直接呼び出し（CRUD）              |
| ProjectManager → ProjectTreeViewProvider | -                                                       | イベント通知（onProjectsChanged） |
| ProjectScanner                           | -                                                       | 独立（fs APIのみ使用）            |
| StorageService                           | -                                                       | 独立（fs APIのみ使用）            |
| KiroConfigReader                         | -                                                       | 独立（fs APIのみ使用）            |

## 通信パターン詳細

### 直接呼び出し（データ取得・操作）

```typescript
// ProjectTreeViewProvider → ProjectManager
const projects = this.projectManager.getProjects();
const filtered = this.projectManager.searchProjects(query);

// ProjectManager → StorageService
await this.storage.saveProjects(this.projects);
const saved = await this.storage.loadProjects();

// ProjectManager → ProjectScanner
const results = await this.scanner.scan(scanPaths);

// ProjectManager → KiroConfigReader
const config = await this.configReader.readConfig(path);
```

### イベント通知（UI更新）

```typescript
// ProjectManager が変更を通知
this._onProjectsChanged.fire();

// ProjectTreeViewProvider がイベントを購読
projectManager.onProjectsChanged(() => {
  this.refresh();  // ツリービュー再描画
});

// ProjectScanner が進捗を通知
this._onScanProgress.fire({ scannedCount, foundCount, currentPath });
```

## 初期化順序

```
1. ExtensionController.activate()
2.   → StorageService.initialize()        // ~/.kiro-hub/ の確認・作成
3.   → StorageService.loadProjects()      // 保存済みデータ読み込み
4.   → ProjectScanner 生成               // スキャンパス設定読み込み
5.   → KiroConfigReader 生成             // キャッシュ初期化
6.   → ProjectManager 生成（上記3つを注入）
7.   → ProjectTreeViewProvider 生成（ProjectManagerを注入）
8.   → コマンド登録
9.   → 初回起動判定 → オンボーディング表示（必要な場合）
```

## Disposableリソース管理

```
ExtensionController が全Disposableを管理:
- コマンド登録 (vscode.commands.registerCommand)
- ツリービュー (vscode.window.createTreeView)
- イベントリスナー (onProjectsChanged subscription)
- StorageService のデバウンスタイマー (flush on deactivate)
```
