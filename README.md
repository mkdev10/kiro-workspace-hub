<p align="center">
  <img src="resources/icon.png" alt="Kiro Workspace Hub" width="128" height="128">
</p>

<p align="center">
  <a href="README.en.md">English</a> | 日本語
</p>

# Kiro Workspace Hub

複数のKiroプロジェクトをサイドバーから横断的に切り替えられるKiro専用拡張機能。

## 機能

- **プロジェクト登録**: フォルダを手動で追加、または.kiroディレクトリを自動検出
- **ワンクリック切り替え**: サイドバーからプロジェクトを選んで即座に切り替え
- **表示モード**: フラットリスト / タググループ化を切り替え可能
- **プロジェクト検索**: 名前・タグ・説明文でリアルタイムフィルタリング
- **メタデータ管理**: カテゴリ/タグ、説明文、表示名のカスタマイズ
- **Kiro設定概要**: hook数、steering数、MCP設定数の確認

## インストール

```bash
# 開発ビルド
npm install
npm run compile

# VSIXパッケージ作成
npx vsce package
```

## 使い方

1. サイドバーの「Workspace Hub」アイコンをクリック
2. 「＋」ボタンでプロジェクトフォルダを追加
3. プロジェクトをクリックして切り替え

### スキャン設定

コマンドパレットから `Workspace Hub: スキャンパスを設定` を実行し、
プロジェクトが格納されているルートディレクトリを指定してください。

## 開発

### 必要環境

- Node.js 20.x (miseで管理: `.mise.toml`)
- npm

### セットアップ

```bash
mise install       # Node.js バージョンインストール
npm install        # 依存関係インストール
npm run compile    # ビルド
```

### コマンド

| コマンド          | 説明                 |
| ----------------- | -------------------- |
| `npm run compile` | ビルド               |
| `npm run watch`   | ウォッチモードビルド |
| `npm run package` | プロダクションビルド |
| `npm run lint`    | ESLint実行           |
| `npm run test`    | テスト実行           |

### デバッグ

1. Kiro/VSCodeで拡張機能プロジェクトを開く
2. `F5` で拡張機能開発ホストを起動
3. サイドバーの「Workspace Hub」で動作確認

## データ保存先

- プロジェクト登録情報: `~/.kiro-hub/projects.json`
- 拡張機能設定: `~/.kiro-hub/settings.json`

## ライセンス

MIT
