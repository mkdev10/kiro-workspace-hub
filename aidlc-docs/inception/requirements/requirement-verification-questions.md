# 要件確認質問

以下の質問に回答してください。各質問の [Answer]: タグの後に選択肢の文字を記入してください。

---

## Question 1
「プロジェクトの切り替え」とは具体的にどのような操作を指しますか？

A) Kiroのワークスペースフォルダを切り替える（別のプロジェクトディレクトリを開く）
B) 同一ワークスペース内の複数プロジェクト設定（steeringファイルやhook設定など）を切り替える
C) 複数のVSCode/Kiroウィンドウ間をすばやく切り替える
D) タスク自動化の設定プロファイル（hook、steering、MCP設定のセット）をプロジェクトごとに管理して切り替える
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 2
「複数のプロジェクトを横断して切り替え」する際、プロジェクトの情報はどこに保存されることを想定していますか？

A) ローカルファイル（JSONなど）に保存し、ユーザーが手動で管理
B) VSCode/Kiroのグローバル設定として保存
C) 各プロジェクトの .kiro/ ディレクトリ内に設定を持ち、ハブ拡張機能がそれらを一覧化
D) 専用の設定ディレクトリ（例: ~/.kiro-hub/）に一元管理
X) Other (please describe after [Answer]: tag below)

[Answer]: どれがいいか深掘りしたい

---

## Question 3
拡張機能のUI（ユーザーインターフェース）として、どの形式が望ましいですか？

A) サイドバーにプロジェクト一覧のツリービューを表示
B) コマンドパレットからプロジェクトを選択するQuickPick形式
C) ステータスバーに現在のプロジェクト名を表示し、クリックで切り替え
D) A + C の組み合わせ（サイドバー一覧 + ステータスバー表示）
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 4
プロジェクト切り替え時にどのようなアクションを実行したいですか？

A) 新しいVSCode/Kiroウィンドウで対象プロジェクトを開く
B) 現在のウィンドウで対象プロジェクトのフォルダに切り替える
C) マルチルートワークスペースに追加/削除する
D) A と B の両方（ユーザーが選択可能）
X) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## Question 5
プロジェクトの登録方法として何を想定していますか？

A) ユーザーがフォルダパスを手動で追加する
B) 最近開いたKiroプロジェクト（.kiroディレクトリを含むフォルダ）を自動検出
C) 特定のルートディレクトリ配下のプロジェクトを自動スキャン
D) A + B の組み合わせ（手動追加 + 自動検出）
X) Other (please describe after [Answer]: tag below)

[Answer]: D

---

## Question 6
各プロジェクトについて表示・管理したい情報はどれですか？（最も重要なもの）

A) プロジェクト名とパスのみ（シンプル）
B) プロジェクト名、パス、最終アクセス日時
C) プロジェクト名、パス、カテゴリ/タグ、説明文
D) プロジェクト名、パス、Kiro設定の概要（hook数、steering数など）
X) Other (please describe after [Answer]: tag below)

[Answer]: C+Dかなプロジェクトの詳細などもみえるといいかも

---

## Question 7
対象とする開発環境はどちらですか？

A) VSCode拡張機能として開発（VSCode Marketplaceに公開可能）
B) Kiro専用の拡張機能として開発
C) VSCodeとKiroの両方で動作する拡張機能
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 8
開発言語はTypeScriptで良いですか？

A) はい、TypeScript
B) いいえ、JavaScript
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 9: Security Extensions
このプロジェクトにセキュリティ拡張ルールを適用しますか？

A) はい — すべてのセキュリティルールをブロッキング制約として適用（本番グレードのアプリケーション向け推奨）
B) いいえ — セキュリティルールをスキップ（PoC、プロトタイプ、実験的プロジェクト向け）
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 10: Property-Based Testing Extension
このプロジェクトにプロパティベーステスト（PBT）ルールを適用しますか？

A) はい — すべてのPBTルールをブロッキング制約として適用（ビジネスロジック、データ変換、シリアライゼーション、ステートフルコンポーネントを持つプロジェクト向け推奨）
B) 部分的 — 純粋関数とシリアライゼーションのラウンドトリップのみにPBTルールを適用（アルゴリズム複雑度が限定的なプロジェクト向け）
C) いいえ — PBTルールをスキップ（シンプルなCRUDアプリ、UIのみのプロジェクト、重要なビジネスロジックのない薄いインテグレーション層向け）
X) Other (please describe after [Answer]: tag below)

[Answer]: もう少し考えてほしい
