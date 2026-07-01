# Application Design - 統合設計書

## 概要

Kiro Workspace Hub は6つのコンポーネントから構成されるKiro専用拡張機能。
ProjectManagerをオーケストレーターとした、イベント+直接呼び出しのハイブリッド通信パターンを採用。

## アーキテクチャ概要図

```
+------------------------------------------------------------------+
|                      Kiro Extension Host                           |
+------------------------------------------------------------------+
|                                                                    |
|  +--------------------+         +---------------------------+     |
|  | ExtensionController|-------->| ProjectTreeViewProvider   |     |
|  | (activate/deact)   |    DI   | (TreeDataProvider)        |     |
|  +--------------------+         +---------------------------+     |
|         |                              |                          |
|         | DI                           | getProjects()            |
|         v                              v                          |
|  +--------------------+  onProjectsChanged (Event)                |
|  |  ProjectManager    |──────────────────────────────────────>    |
|  |  (Orchestrator)    |                                           |
|  +--------------------+                                           |
|     |       |       |                                             |
|     v       v       v                                             |
|  +------+ +------+ +----------+                                   |
|  |Store | |Scan  | |KiroConf  |                                   |
|  |Svc   | |ner   | |Reader    |                                   |
|  +------+ +------+ +----------+                                   |
|     |                                                             |
+-----|-------------------------------------------------------------+
      v
  ~/.kiro-hub/
  projects.json
  settings.json
```

## コンポーネント一覧（6つ）

| #   | コンポーネント          | 責務                                   |
| --- | ----------------------- | -------------------------------------- |
| 1   | ExtensionController     | ライフサイクル管理、コマンド登録、DI   |
| 2   | ProjectTreeViewProvider | サイドバーUI、ツリービュー描画         |
| 3   | ProjectManager          | ビジネスロジック、オーケストレーション |
| 4   | ProjectScanner          | .kiroプロジェクト自動検出              |
| 5   | StorageService          | ~/.kiro-hub/へのデータ永続化           |
| 6   | KiroConfigReader        | 各プロジェクトのKiro設定読み取り       |

## 設計決定事項

| 決定                 | 選択               | 理由                                                           |
| -------------------- | ------------------ | -------------------------------------------------------------- |
| 通信パターン         | ハイブリッド       | UI更新はイベント（疎結合）、データ取得は直接呼び出し（型安全） |
| 永続化タイミング     | デバウンス300ms    | 連続変更でのI/O抑制、クラッシュ時のロスも最小                  |
| ツリービュー         | 切り替え可能       | 少数/多数プロジェクトの両ペルソナに対応                        |
| オーケストレーション | ProjectManager中心 | 単一拡張機能で過剰なサービス層不要                             |
| DI方式               | コンストラクタ注入 | テスタビリティ確保、シンプル                                   |

## データフロー

### 読み取りフロー（起動時）
```
StorageService → (load) → ProjectManager → ProjectTreeViewProvider → UI表示
```

### 書き込みフロー（変更時）
```
UI操作 → ProjectManager → StorageService (debounced) → ~/.kiro-hub/
                ↓ event
         ProjectTreeViewProvider → UI再描画
```

### スキャンフロー
```
ユーザー操作 → ProjectManager → ProjectScanner → (async scan)
                                      ↓ event (progress)
                              UI進捗表示
                                      ↓ event (complete)
              ProjectManager ← 結果 → StorageService → 永続化
                    ↓ event
              ProjectTreeViewProvider → UI再描画
```

## ファイル構造（予定）

```
src/
├── extension.ts              # ExtensionController (エントリーポイント)
├── projectManager.ts         # ProjectManager
├── projectTreeView.ts        # ProjectTreeViewProvider
├── projectScanner.ts         # ProjectScanner
├── storageService.ts         # StorageService
├── kiroConfigReader.ts       # KiroConfigReader
├── models/
│   └── types.ts              # Project, KiroConfig, HubSettings等の型定義
└── utils/
    └── debounce.ts           # デバウンスユーティリティ
```

## 詳細リファレンス

- コンポーネント定義: [components.md](./components.md)
- メソッド定義: [component-methods.md](./component-methods.md)
- サービス層: [services.md](./services.md)
- 依存関係: [component-dependency.md](./component-dependency.md)
