# Application Design Plan

## 設計スコープ
Kiro Workspace Hub拡張機能のコンポーネント構成、インターフェース、依存関係を定義する。

---

## 設計質問

### Question 1: コンポーネント間の通信パターン
コンポーネント間のデータ受け渡しにどのパターンを採用しますか？

A) イベント駆動（EventEmitterベース）— コンポーネント間が疎結合になる
B) 直接メソッド呼び出し — シンプルで追跡しやすい
C) イベント + 直接呼び出しのハイブリッド — UI更新はイベント、データ取得は直接呼び出し（推奨）
X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

### Question 2: データ永続化の更新タイミング
~/.kiro-hub/の設定ファイルへの書き込みタイミングは？

A) 即時書き込み — 変更のたびに即座にファイル保存
B) デバウンス付き書き込み — 短時間の連続変更をまとめて保存（推奨）
C) 明示的保存 — ユーザーが「保存」操作をした時のみ
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Question 3: ツリービューの構造
サイドバーのツリービュー構造はどうしますか？

A) フラットリスト — 全プロジェクトを同一階層で表示（タグなしの場合はこちら）
B) タグでグループ化 — タグをフォルダのように扱い、その下にプロジェクトを配置
C) 切り替え可能 — ユーザーがフラット/グループ化を切り替えられる（推奨）
X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## 設計実行チェックリスト

- [x] Step 1: コンポーネント定義（components.md）
- [x] Step 2: コンポーネントメソッド定義（component-methods.md）
- [x] Step 3: サービス層定義（services.md）
- [x] Step 4: コンポーネント依存関係（component-dependency.md）
- [x] Step 5: 統合設計書（application-design.md）
- [x] Step 6: 設計の整合性検証
