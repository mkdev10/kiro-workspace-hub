# サービス層定義

## サービスアーキテクチャ概要

この拡張機能はシンプルな構成のため、重いサービス層は不要。
`ProjectManager`がオーケストレーション層として機能し、各コンポーネントを調整する。

---

## Service: ProjectManager（オーケストレーター）

**役割**: ビジネスロジックの中心。StorageService、ProjectScanner、KiroConfigReaderを統合的に利用して、プロジェクト管理の全操作を提供する。

### オーケストレーションパターン

#### プロジェクト追加フロー
```
1. ユーザーがフォルダを選択
2. ProjectManager.addProject(path) が呼ばれる
3. バリデーション（パス存在確認、重複チェック）
4. Project オブジェクト生成
5. StorageService.saveProjects() で永続化
6. onProjectsChanged イベント発行
7. ProjectTreeViewProvider がイベントを受けてツリー再描画
```

#### 自動検出フロー
```
1. ProjectManager.scanForProjects() が呼ばれる
2. ProjectScanner.scan(scanPaths) を実行（バックグラウンド）
3. スキャン結果から未登録プロジェクトを抽出
4. 新規プロジェクトを一括登録
5. StorageService.saveProjects() で永続化
6. onProjectsChanged イベント発行
```

#### プロジェクト切り替えフロー
```
1. ユーザーがツリービューからプロジェクトを選択
2. ProjectManager.openInNewWindow(id) or openInCurrentWindow(id)
3. vscode.commands.executeCommand('vscode.openFolder', uri, options)
4. lastOpenedAt を更新
5. StorageService.saveProjects() で永続化
```

#### 設定概要取得フロー
```
1. ProjectTreeViewProvider がプロジェクト展開時に呼び出し
2. ProjectManager.getProjectConfig(id)
3. KiroConfigReader.readConfig(projectPath)
4. キャッシュがあればキャッシュから返却
5. なければ.kiro/を読み取ってキャッシュに保存
```

---

## サービス間の責任分界

| 操作                 | 責任者                  | 補助             |
| -------------------- | ----------------------- | ---------------- |
| プロジェクトCRUD     | ProjectManager          | StorageService   |
| ファイルI/O          | StorageService          | -                |
| ディレクトリスキャン | ProjectScanner          | -                |
| Kiro設定読み取り     | KiroConfigReader        | -                |
| UI表示               | ProjectTreeViewProvider | ProjectManager   |
| 初期化・コマンド登録 | ExtensionController     | 全コンポーネント |

---

## エラーハンドリング戦略

| エラー種別             | 対応                                     |
| ---------------------- | ---------------------------------------- |
| ファイルI/O失敗        | ユーザーに通知、操作をロールバック       |
| スキャンパス不存在     | 警告表示、該当パスをスキップして続行     |
| .kiro/読み取り不可     | 「情報取得不可」表示、正常続行           |
| プロジェクトパス不存在 | エラー表示、プロジェクト一覧から削除提案 |
| JSON parse エラー      | バックアップから復元、不可ならリセット   |
