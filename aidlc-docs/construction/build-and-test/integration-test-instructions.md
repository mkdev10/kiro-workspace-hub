# Integration Test Instructions

## Purpose
拡張機能の各コンポーネントが連携して正しく動作することを確認する。

## テスト方法
VSCode拡張機能の統合テストは `@vscode/test-electron` を使用して、
実際のVSCode/Kiroインスタンス内で拡張機能を実行して検証する。

## Test Scenarios

### Scenario 1: プロジェクト追加 → ツリービュー表示
- **Description**: プロジェクトを追加した後、ツリービューに反映されることを確認
- **Setup**: テスト用の一時フォルダに.kiroディレクトリを作成
- **Test Steps**:
  1. `kiro-workspace-hub.addProject` コマンドを実行
  2. テスト用フォルダを選択
  3. ツリービューのルートノードを取得
- **Expected Results**: 追加したプロジェクトがツリービューに表示される
- **Cleanup**: テスト用フォルダとプロジェクト登録を削除

### Scenario 2: スキャン → プロジェクト検出 → 永続化
- **Description**: スキャンで検出されたプロジェクトが永続化されることを確認
- **Setup**: テスト用ディレクトリ構造を作成（.kiroディレクトリ含む）
- **Test Steps**:
  1. スキャンパスを設定
  2. `kiro-workspace-hub.scanProjects` コマンドを実行
  3. ~/.kiro-hub/projects.json を読み取り
- **Expected Results**: 検出プロジェクトが projects.json に保存される
- **Cleanup**: テスト用ディレクトリとプロジェクト登録を削除

### Scenario 3: 表示モード切り替え → 設定永続化
- **Description**: 表示モード切り替えが設定に保存されることを確認
- **Setup**: プロジェクトにタグを設定
- **Test Steps**:
  1. `kiro-workspace-hub.toggleViewMode` コマンドを実行
  2. settings.json を読み取り
- **Expected Results**: viewModeが 'grouped' に変更されて保存される

## 手動統合テスト手順

### デバッグ起動
1. Kiro/VSCodeで拡張機能プロジェクトを開く
2. `F5` で Extension Development Host を起動
3. サイドバーの「Workspace Hub」アイコンをクリック

### 確認事項チェックリスト
- [ ] サイドバーにWorkspace Hubアイコンが表示される
- [ ] 初回起動時にウェルカムメッセージが表示される
- [ ] 「＋」ボタンでフォルダ選択ダイアログが開く
- [ ] プロジェクト追加後にツリービューに表示される
- [ ] プロジェクトダブルクリックで新ウィンドウが開く
- [ ] 右クリックメニューが正しく表示される
- [ ] 表示モード切替ボタンが動作する
- [ ] 検索/フィルタが動作する
- [ ] スキャンが実行され結果が反映される
- [ ] ~/.kiro-hub/ にJSONファイルが作成される
