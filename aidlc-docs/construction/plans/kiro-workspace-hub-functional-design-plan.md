# Functional Design Plan - Kiro Workspace Hub

## 設計スコープ
コンポーネントの詳細ビジネスロジック、バリデーションルール、ドメインエンティティの設計。

---

## 設計質問

### Question 1: プロジェクト自動検出のスキャン深度
ディレクトリスキャン時、どの深さまで探索しますか？

A) 1階層のみ（指定ディレクトリ直下のフォルダのみチェック）
B) 2-3階層（一般的なプロジェクト配置をカバー）（推奨）
C) 無制限（全階層を再帰探索）— パフォーマンスリスクあり
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Question 2: 重複プロジェクトの判定基準
同じプロジェクトかどうかは何で判定しますか？

A) パスの完全一致のみ
B) パスの正規化後に比較（シンボリックリンク解決、末尾スラッシュ統一）（推奨）
C) パス + プロジェクト名の両方で判定
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Question 3: 不存在プロジェクトの扱い
登録済みプロジェクトのパスが存在しなくなった場合（削除/移動された場合）の動作は？

A) ツリービューで警告アイコンを表示し、ユーザーに削除/パス更新を促す（推奨）
B) 自動的に登録解除する
C) 非表示にする（次回存在確認で復活）
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## 設計実行チェックリスト

- [x] Step 1: ビジネスロジックモデル（business-logic-model.md）
- [x] Step 2: ビジネスルール定義（business-rules.md）
- [x] Step 3: ドメインエンティティ（domain-entities.md）
- [x] Step 4: フロントエンドコンポーネント設計（frontend-components.md）
