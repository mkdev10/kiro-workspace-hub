# ユーザーストーリー生成プラン

## ストーリー開発質問

以下の質問に回答して、ユーザーストーリーの方向性を決めてください。

---

### Question 1: ユーザーペルソナ
この拡張機能を使うユーザーの特徴として、最も当てはまるものは？

A) 少数のプロジェクト（2-5個）を頻繁に切り替える開発者
B) 多数のプロジェクト（10個以上）を管理し、週に数回切り替える開発者
C) AとBの両方を想定する
X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

### Question 2: ストーリーの粒度
ストーリーの細かさはどの程度が望ましいですか？

A) 大きめ（機能単位: 「プロジェクト登録」「プロジェクト切り替え」など）
B) 中程度（操作単位: 「手動でプロジェクトを追加する」「タグでフィルタする」など）
C) 細かめ（アクション単位: 「追加ボタンをクリックする」「フォルダ選択ダイアログが開く」など）
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Question 3: ストーリーの分類方法
ストーリーをどのように整理しますか？

A) ユーザージャーニー別（初回セットアップ → 日常使用 → 管理操作）
B) 機能別（登録、表示、切り替え、設定）
C) 優先度別（MVP必須 → Nice to Have → 将来拡張）
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Question 4: アクセプタンスクライテリアの形式
アクセプタンスクライテリアの記述形式は？

A) Given-When-Then形式（BDD的）
B) チェックリスト形式（箇条書き）
C) 両方の組み合わせ（主要フローはGWT、エッジケースはチェックリスト）
X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

### Question 5: MVP（最小限の実行可能製品）の範囲
最初のリリースに含めるべき最低限の機能は？

A) プロジェクト登録（手動のみ）+ 一覧表示 + 切り替え（新ウィンドウのみ）
B) プロジェクト登録（手動+自動検出）+ 一覧表示 + 切り替え（新/現ウィンドウ）
C) 全要件をMVPとして一括実装
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## ストーリー生成実行チェックリスト

上記質問への回答を受けて、以下のステップを順に実行します：

- [x] Step 1: ユーザーペルソナの定義（personas.md生成）
- [x] Step 2: エピック（大きな機能グループ）の定義
- [x] Step 3: 各エピックのユーザーストーリー作成
- [x] Step 4: 各ストーリーにアクセプタンスクライテリア追加
- [x] Step 5: ストーリー間の依存関係マッピング
- [x] Step 6: INVEST基準による品質チェック
- [x] Step 7: ペルソナとストーリーのマッピング
- [x] Step 8: stories.md と personas.md の最終生成
