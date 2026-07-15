import * as vscode from 'vscode';

/** 登録されたKiroプロジェクト */
export interface Project {
    /** 一意識別子 (UUID v4) */
    id: string;
    /** 表示名 (デフォルト: フォルダ名) */
    name: string;
    /** フォルダの絶対パス (正規化済み) */
    path: string;
    /** ユーザー定義タグ */
    tags: string[];
    /** 説明文 */
    description: string;
    /** 登録日時 (ISO 8601) */
    addedAt: string;
    /** 最終アクセス日時 (ISO 8601) */
    lastOpenedAt: string;
    /** 登録方法 */
    source: 'manual' | 'scanned';
}

/** プロジェクトのKiro設定概要 */
export interface KiroConfig {
    hookCount: number;
    steeringCount: number;
    mcpServerCount: number;
    specCount: number;
    skillCount: number;
    agentCount: number;
    lastReadAt: string;
}

/** 拡張機能のグローバル設定 */
export interface HubSettings {
    scanPaths: string[];
    viewMode: 'flat' | 'grouped';
    defaultOpenMode: 'newWindow' | 'currentWindow';
    scanMaxDepth: number;
}

/** 自動検出スキャンの結果1件 */
export interface ScanResult {
    path: string;
    hasKiroDir: boolean;
    alreadyRegistered: boolean;
}

/** スキャン進捗情報 */
export interface ScanProgress {
    scannedCount: number;
    foundCount: number;
    currentPath: string;
}

/** 永続化ファイルのスキーマ (projects.json) */
export interface ProjectsFile {
    version: number;
    projects: Project[];
}

/** 永続化ファイルのスキーマ (settings.json) */
export interface SettingsFile {
    version: number;
    scanPaths: string[];
    viewMode: 'flat' | 'grouped';
    defaultOpenMode: 'newWindow' | 'currentWindow';
    scanMaxDepth: number;
}

/** ツリービューのノードタイプ */
export type TreeNodeType = 'project' | 'tagGroup' | 'welcome';

/** ツリービューのノード */
export class ProjectTreeItem extends vscode.TreeItem {
    constructor(
        public readonly nodeType: TreeNodeType,
        label: string,
        collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly projectId?: string,
        public readonly tagName?: string,
    ) {
        super(label, collapsibleState);
    }
}

/** デフォルト設定 */
export const DEFAULT_SETTINGS: HubSettings = {
    scanPaths: [],
    viewMode: 'flat',
    defaultOpenMode: 'newWindow',
    scanMaxDepth: 3,
};

/** スキャン除外ディレクトリ */
export const SCAN_EXCLUDE_DIRS = new Set([
    'node_modules',
    '.git',
    'dist',
    'build',
    'out',
    '__pycache__',
    'vendor',
]);
