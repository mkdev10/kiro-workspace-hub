# ビジネスロジックモデル

## 1. プロジェクト登録ロジック

### 1.1 手動追加フロー

```
入力: folderPath (string)
処理:
  1. パスの正規化（末尾スラッシュ除去、シンボリックリンク解決）
  2. パス存在確認（fs.access）
  3. 重複チェック（正規化パスで既存プロジェクトと比較）
  4. .kiroディレクトリ存在確認
     - 存在する → そのまま登録
     - 存在しない → 警告表示「.kiroディレクトリがありません。登録しますか？」
       - Yes → 登録続行
       - No → キャンセル
  5. Projectオブジェクト生成
     - id: UUID v4
     - name: フォルダ名（path.basename）
     - path: 正規化パス
     - tags: []
     - description: ''
     - addedAt: 現在日時
     - lastOpenedAt: 現在日時
     - source: 'manual'
  6. プロジェクト配列に追加
  7. StorageService.saveProjects()（デバウンス付き）
  8. onProjectsChanged イベント発行
出力: Project
エラー: PathNotFoundError, DuplicateProjectError
```

### 1.2 自動検出フロー

```
入力: scanPaths (string[])
処理:
  1. 各scanPathに対して:
     a. パス存在確認（存在しないパスはスキップ + 警告）
     b. 最大3階層の再帰探索
     c. 各ディレクトリで .kiro/ の存在チェック
     d. .kiro/ が見つかった場合:
        - そのディレクトリのパスを正規化
        - 既存プロジェクトとの重複チェック
        - 重複なし → ScanResult に追加
     e. スキャン進捗を定期的にイベント通知
  2. スキャン完了後:
     - 未登録のScanResultからProjectオブジェクトを生成
       - source: 'scanned'
     - 一括で登録
     - StorageService.saveProjects()
     - onProjectsChanged イベント発行
出力: ScanResult[]
キャンセル: cancelScan() でAbortControllerを使用して中断
```

### 1.3 スキャン除外ルール

以下のディレクトリはスキャン対象外:
- `node_modules/`
- `.git/`
- `dist/`, `build/`, `out/`
- `.` で始まる隠しディレクトリ（`.kiro` 自体は除外しない）
- `__pycache__/`
- `vendor/`

## 2. プロジェクト切り替えロジック

### 2.1 新ウィンドウで開く

```
入力: projectId (string)
処理:
  1. projectIdからProjectを取得
  2. パス存在確認
     - 存在しない → エラー表示 + 不存在フラグ設定
  3. vscode.commands.executeCommand('vscode.openFolder', Uri.file(path), { forceNewWindow: true })
  4. lastOpenedAt を現在日時に更新
  5. StorageService.saveProjects()
出力: void
```

### 2.2 現在のウィンドウで開く

```
入力: projectId (string)
処理:
  1. projectIdからProjectを取得
  2. パス存在確認
  3. vscode.commands.executeCommand('vscode.openFolder', Uri.file(path), { forceNewWindow: false })
  4. lastOpenedAt を現在日時に更新
  5. StorageService.saveProjects()
出力: void
注意: 現ウィンドウが閉じて新しいウィンドウが開く動作になる（VSCode標準）
```

## 3. 検索・フィルタリングロジック

### 3.1 テキスト検索

```
入力: query (string)
処理:
  1. queryを小文字化
  2. 全プロジェクトに対して:
     - project.name.toLowerCase() に query が含まれるか
     - project.tags の各タグに query が含まれるか
     - project.description.toLowerCase() に query が含まれるか
  3. いずれかにマッチしたプロジェクトを返す
出力: Project[]
特性: リアルタイム（入力と同時、追加デバウンスなし）
```

### 3.2 タググループ化

```
入力: projects (Project[])
処理:
  1. 全プロジェクトのタグを収集
  2. タグごとにプロジェクトをグループ化
  3. タグなしプロジェクトは「未分類」グループ
  4. 1プロジェクトが複数タグを持つ場合、各タググループに重複表示
  5. グループはアルファベット順にソート
出力: Map<string, Project[]>
```

## 4. データ永続化ロジック

### 4.1 デバウンス書き込み

```
設定: DEBOUNCE_DELAY = 300ms
処理:
  1. saveProjects() 呼び出し
  2. 既存タイマーがあればクリア
  3. 新しいタイマーを設定（300ms後に実際の書き込み）
  4. タイマー発火時:
     a. projects.json にJSON.stringify(projects, null, 2)で書き込み
     b. 書き込み失敗時: エラー通知、リトライなし
  5. deactivate時: flush() で即時書き込み（未保存データのロスを防ぐ）
```

### 4.2 ファイル構造

```
~/.kiro-hub/
├── projects.json      # プロジェクト登録情報
└── settings.json      # 拡張機能設定（scanPaths, viewMode等）
```

## 5. 不存在プロジェクト検出ロジック

```
タイミング: ツリービュー表示時（getChildren呼び出し時）
処理:
  1. 各プロジェクトのパスに対して fs.access() で存在確認
  2. 存在しない場合:
     - project.missing = true フラグを設定（メモリ上のみ）
     - ツリービューで警告アイコン表示
     - コンテキストメニューに「パスを更新」「登録解除」を追加
  3. 存在確認は非同期で実行し、UIブロックしない
  4. キャッシュ: 確認結果を5分間キャッシュ（毎回I/Oしない）
```
