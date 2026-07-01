# フロントエンドコンポーネント設計

## ツリービュー構造

### コンポーネント階層

```
Kiro Workspace Hub (View Container - サイドバー)
└── ProjectTreeView (TreeView)
    ├── [フラットモード]
    │   ├── ProjectNode (プロジェクト1)
    │   ├── ProjectNode (プロジェクト2) ← ハイライト（現在のプロジェクト）
    │   ├── ProjectNode (プロジェクト3) ← ⚠️ 警告アイコン（パス不存在）
    │   └── ...
    │
    └── [グループ化モード]
        ├── TagGroupNode ("backend")
        │   ├── ProjectNode (プロジェクトA)
        │   └── ProjectNode (プロジェクトB)
        ├── TagGroupNode ("frontend")
        │   └── ProjectNode (プロジェクトC)
        └── TagGroupNode ("未分類")
            └── ProjectNode (プロジェクトD)
```

---

## ノードタイプ詳細

### ProjectNode（プロジェクトノード）

**表示情報**:
| 要素         | 内容                                                                   |
| ------------ | ---------------------------------------------------------------------- |
| label        | プロジェクト名                                                         |
| description  | パス（短縮表示: ~/projects/my-app）                                    |
| tooltip      | フルパス + 説明文 + タグ一覧                                           |
| iconPath     | 通常: フォルダアイコン、現在: アクティブアイコン、不存在: 警告アイコン |
| contextValue | 'project' / 'currentProject' / 'missingProject'                        |

**コンテキストメニュー**:
| contextValue   | メニュー項目                                                                         |
| -------------- | ------------------------------------------------------------------------------------ |
| project        | 新ウィンドウで開く, 現ウィンドウで開く, タグを編集, 説明を編集, 名前を変更, 登録解除 |
| currentProject | タグを編集, 説明を編集, 名前を変更                                                   |
| missingProject | パスを更新, 登録解除                                                                 |

**展開時（Post-MVP）**:
- hookCount, steeringCount, mcpServerCount を子ノードとして表示

---

### TagGroupNode（タググループノード）

**表示情報**:
| 要素             | 内容                              |
| ---------------- | --------------------------------- |
| label            | タグ名                            |
| description      | (N) — 配下のプロジェクト数        |
| collapsibleState | Collapsed（デフォルト折りたたみ） |
| iconPath         | タグアイコン                      |
| contextValue     | 'tagGroup'                        |

---

### WelcomeNode（ウェルカムノード）

**表示条件**: プロジェクトが0件の時のみ表示

**表示情報**:
| 要素        | 内容                               |
| ----------- | ---------------------------------- |
| label       | 「プロジェクトを追加してください」 |
| description | 「+ ボタンでプロジェクトを登録」   |
| command     | kiro-workspace-hub.addProject      |

---

## ビューアクション（タイトルバーボタン）

| アイコン          | コマンド                          | 条件     |
| ----------------- | --------------------------------- | -------- |
| ＋（追加）        | kiro-workspace-hub.addProject     | 常時表示 |
| 🔄（リフレッシュ） | kiro-workspace-hub.refresh        | 常時表示 |
| 🔍（スキャン）     | kiro-workspace-hub.scanProjects   | 常時表示 |
| 📋/🏷️（表示切替）   | kiro-workspace-hub.toggleViewMode | 常時表示 |

---

## コマンド一覧

| コマンドID                             | 表示名                 | 処理                              |
| -------------------------------------- | ---------------------- | --------------------------------- |
| kiro-workspace-hub.addProject          | プロジェクトを追加     | フォルダ選択ダイアログ → 登録     |
| kiro-workspace-hub.removeProject       | 登録解除               | 確認 → 削除                       |
| kiro-workspace-hub.openInNewWindow     | 新しいウィンドウで開く | vscode.openFolder (newWindow)     |
| kiro-workspace-hub.openInCurrentWindow | 現在のウィンドウで開く | vscode.openFolder (currentWindow) |
| kiro-workspace-hub.editTags            | タグを編集             | InputBox → タグ更新               |
| kiro-workspace-hub.editDescription     | 説明を編集             | InputBox → 説明更新               |
| kiro-workspace-hub.renameProject       | 名前を変更             | InputBox → 名前更新               |
| kiro-workspace-hub.updatePath          | パスを更新             | フォルダ選択 → パス変更           |
| kiro-workspace-hub.scanProjects        | プロジェクトをスキャン | 自動検出実行                      |
| kiro-workspace-hub.refresh             | 表示を更新             | ツリービュー再描画                |
| kiro-workspace-hub.toggleViewMode      | 表示モード切替         | flat ↔ grouped                    |
| kiro-workspace-hub.configureScanPaths  | スキャンパスを設定     | 設定UI表示                        |

---

## ユーザーインタラクションフロー

### フロー1: プロジェクト追加
```
1. ユーザーが「+」ボタンをクリック
2. フォルダ選択ダイアログ表示（vscode.window.showOpenDialog）
   - canSelectFolders: true
   - canSelectFiles: false
   - canSelectMany: false
3. フォルダ選択 → ProjectManager.addProject()
4. 成功 → ツリービュー更新、通知「プロジェクトを追加しました」
5. 失敗（重複）→ 警告メッセージ表示
```

### フロー2: プロジェクト切り替え
```
1. ユーザーがプロジェクトノードをダブルクリック
   → デフォルトモード（settings.defaultOpenMode）で開く
2. または右クリック → コンテキストメニュー → 明示選択
```

### フロー3: タグ編集
```
1. 右クリック → 「タグを編集」
2. InputBox表示
   - placeholder: 「カンマ区切りでタグを入力（例: backend, aws）」
   - value: 現在のタグ（カンマ区切り）
3. 入力確定 → カンマ分割 → trim → 空文字除外 → 保存
4. ツリービュー更新
```

### フロー4: スキャン実行
```
1. ユーザーが「🔍」ボタンをクリック
2. スキャンパス未設定の場合:
   → 「スキャンパスを設定してください」のメッセージ + 設定ボタン
3. スキャンパス設定済みの場合:
   → プログレス通知表示（vscode.window.withProgress）
   → スキャン実行
   → 完了時: 「N個の新しいプロジェクトを検出しました」通知
   → 0件: 「新しいプロジェクトは見つかりませんでした」通知
```

---

## package.json 主要設定

### contributes（抜粋）

```json
{
  "viewsContainers": {
    "activitybar": [{
      "id": "kiro-workspace-hub",
      "title": "Workspace Hub",
      "icon": "resources/hub-icon.svg"
    }]
  },
  "views": {
    "kiro-workspace-hub": [{
      "id": "kiro-workspace-hub.projectsView",
      "name": "Projects"
    }]
  },
  "commands": [...],
  "menus": {
    "view/title": [...],
    "view/item/context": [...]
  }
}
```
