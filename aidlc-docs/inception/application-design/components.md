# コンポーネント定義

## Component 1: ProjectTreeViewProvider

**目的**: サイドバーのツリービューUIを提供し、プロジェクト一覧を表示する

**責務**:
- ツリービューのデータ提供（TreeDataProvider実装）
- プロジェクトノードの生成と表示
- フラットリスト / タググループ化の切り替え
- 現在開いているプロジェクトのハイライト
- フィルタリング状態の管理
- コンテキストメニューアクションの登録

**インターフェース**:
- `vscode.TreeDataProvider<ProjectTreeItem>` を実装
- イベント: `onDidChangeTreeData` でツリーの再描画を通知

---

## Component 2: ProjectManager

**目的**: プロジェクトの登録・削除・編集のビジネスロジックを管理する

**責務**:
- プロジェクトの追加（手動）
- プロジェクトの削除（登録解除）
- プロジェクト情報の更新（名前、タグ、説明文）
- プロジェクト一覧の取得（フィルタリング含む）
- プロジェクト切り替えアクションの実行
- 変更イベントの発行

**インターフェース**:
- 他コンポーネントから直接呼び出し（データ取得）
- EventEmitterで変更を通知（UI更新用）

---

## Component 3: ProjectScanner

**目的**: ファイルシステムをスキャンして.kiroプロジェクトを自動検出する

**責務**:
- 指定ディレクトリの再帰スキャン
- .kiroディレクトリの検出
- スキャン結果のProjectManagerへの報告
- バックグラウンド非同期実行
- スキャン進捗の通知

**インターフェース**:
- ProjectManagerから直接呼び出し（スキャン実行）
- EventEmitterで進捗/完了を通知

---

## Component 4: StorageService

**目的**: ~/.kiro-hub/へのデータ永続化を担当する

**責務**:
- プロジェクト登録情報のJSON読み書き
- デバウンス付き書き込み（300ms）
- 設定ファイルの初期化（ディレクトリ・ファイル作成）
- データのバリデーション
- ファイルI/Oエラーハンドリング

**インターフェース**:
- ProjectManagerから直接呼び出し（CRUD操作）
- 同期的なread、非同期的なwrite

---

## Component 5: KiroConfigReader

**目的**: 各プロジェクトの.kiro/ディレクトリからKiro設定情報を読み取る

**責務**:
- .kiro/hooks/ 配下のhookファイル数カウント
- .kiro/steering/ 配下のsteeringファイル数カウント
- .kiro/settings/mcp.json のMCPサーバー数カウント
- 読み取り結果のキャッシュ
- アクセス不可時のグレースフルハンドリング

**インターフェース**:
- ProjectManagerから直接呼び出し（設定情報取得）

---

## Component 6: ExtensionController

**目的**: 拡張機能のライフサイクル管理とコマンド登録

**責務**:
- 拡張機能のactivate/deactivate処理
- VSCodeコマンドの登録
- 各コンポーネントの初期化と依存性注入
- Disposableリソースの管理
- 初回起動時のオンボーディングフロー

**インターフェース**:
- VSCode Extension APIからのエントリーポイント（activate関数）
