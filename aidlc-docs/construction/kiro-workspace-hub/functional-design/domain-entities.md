# ドメインエンティティ

## エンティティ関連図

```
+-------------+       1:N       +--------+
| HubSettings |                 |  Tag   |
+-------------+                 +--------+
      |                            ^
      | 1:1                        | N:M
      v                            |
+----------------+  1:1    +----------+
| StorageState   |-------->| Project  |
+----------------+         +----------+
                                |
                                | 1:1
                                v
                           +----------+
                           |KiroConfig|
                           +----------+
```

---

## Entity: Project

**説明**: 登録されたKiroプロジェクトを表す中心エンティティ

```typescript
interface Project {
  /** 一意識別子 (UUID v4) */
  id: string;

  /** 表示名 (デフォルト: フォルダ名) */
  name: string;

  /** フォルダの絶対パス (正規化済み) */
  path: string;

  /** ユーザー定義タグ (0〜20個) */
  tags: string[];

  /** 説明文 (最大500文字) */
  description: string;

  /** 登録日時 (ISO 8601) */
  addedAt: string;

  /** 最終アクセス日時 (ISO 8601) */
  lastOpenedAt: string;

  /** 登録方法 */
  source: 'manual' | 'scanned';
}
```

**ライフサイクル**:
- 生成: 手動追加 or 自動検出時
- 更新: 名前変更、タグ編集、説明文編集、切り替え時（lastOpenedAt）
- 削除: 登録解除時（ファイルシステムからの削除ではない）

---

## Entity: KiroConfig

**説明**: プロジェクトの.kiro/ディレクトリから読み取ったKiro設定の概要

```typescript
interface KiroConfig {
  /** .kiro/hooks/ 配下のファイル数 */
  hookCount: number;

  /** .kiro/steering/ 配下のファイル数 */
  steeringCount: number;

  /** .kiro/settings/mcp.json 内のサーバー数 */
  mcpServerCount: number;

  /** キャッシュ読み取り日時 (ISO 8601) */
  lastReadAt: string;
}
```

**ライフサイクル**:
- 生成: プロジェクト詳細表示時にオンデマンド読み取り
- 更新: キャッシュ期限切れ or 手動リフレッシュ時
- キャッシュ有効期間: 5分

---

## Entity: HubSettings

**説明**: 拡張機能のグローバル設定

```typescript
interface HubSettings {
  /** 自動検出スキャンパス (最大10個) */
  scanPaths: string[];

  /** ツリービュー表示モード */
  viewMode: 'flat' | 'grouped';

  /** プロジェクトを開く際のデフォルトモード */
  defaultOpenMode: 'newWindow' | 'currentWindow';

  /** スキャン最大深度 */
  scanMaxDepth: number;
}
```

**デフォルト値**:
```typescript
const DEFAULT_SETTINGS: HubSettings = {
  scanPaths: [],
  viewMode: 'flat',
  defaultOpenMode: 'newWindow',
  scanMaxDepth: 3,
};
```

---

## Value Object: ScanResult

**説明**: 自動検出スキャンの結果1件

```typescript
interface ScanResult {
  /** 検出されたプロジェクトパス */
  path: string;

  /** .kiroディレクトリが存在するか */
  hasKiroDir: boolean;

  /** 既に登録済みか */
  alreadyRegistered: boolean;
}
```

---

## Value Object: ScanProgress

**説明**: スキャン進捗情報

```typescript
interface ScanProgress {
  /** スキャン済みディレクトリ数 */
  scannedCount: number;

  /** 検出されたプロジェクト数 */
  foundCount: number;

  /** 現在スキャン中のパス */
  currentPath: string;
}
```

---

## Value Object: ProjectTreeItem

**説明**: ツリービューの1ノードを表す

```typescript
interface ProjectTreeItem extends vscode.TreeItem {
  /** プロジェクトID (ProjectのIDと対応) */
  projectId?: string;

  /** ノードタイプ */
  nodeType: 'project' | 'tagGroup' | 'welcome';

  /** タググループの場合のタグ名 */
  tagName?: string;
}
```

---

## 永続化形式

### projects.json

```json
{
  "version": 1,
  "projects": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "my-api-service",
      "path": "/Users/user/projects/my-api-service",
      "tags": ["backend", "aws"],
      "description": "メインAPIサービス",
      "addedAt": "2026-06-19T10:00:00Z",
      "lastOpenedAt": "2026-06-19T15:30:00Z",
      "source": "manual"
    }
  ]
}
```

### settings.json

```json
{
  "version": 1,
  "scanPaths": ["/Users/user/projects", "/Users/user/work"],
  "viewMode": "flat",
  "defaultOpenMode": "newWindow",
  "scanMaxDepth": 3
}
```
