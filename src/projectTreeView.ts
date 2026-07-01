import * as vscode from 'vscode';
import * as path from 'path';
import { Project, ProjectTreeItem, TreeNodeType } from './models/types';
import { ProjectManager } from './projectManager';
import { shortenPath, directoryExists } from './utils/pathUtils';

/**
 * サイドバーのツリービューUIを提供する
 */
export class ProjectTreeViewProvider implements vscode.TreeDataProvider<ProjectTreeItem> {
    private readonly _onDidChangeTreeData = new vscode.EventEmitter<ProjectTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private viewMode: 'flat' | 'grouped' = 'flat';
    private filterQuery = '';
    private missingPaths = new Map<string, boolean>();
    private missingCheckCache = new Map<string, { missing: boolean; checkedAt: number }>();
    private readonly CACHE_TTL = 5 * 60 * 1000; // 5分

    constructor(
        private readonly projectManager: ProjectManager,
        private readonly extensionUri: vscode.Uri
    ) {
        // ProjectManagerの変更を購読
        projectManager.onProjectsChanged(() => {
            this.refresh();
        });
    }

    /**
     * ツリービュー全体を再描画する
     */
    refresh(): void {
        this.missingPaths.clear();
        this._onDidChangeTreeData.fire();
    }

    /**
     * 表示モードを切り替える
     */
    setViewMode(mode: 'flat' | 'grouped'): void {
        this.viewMode = mode;
        this.refresh();
    }

    /**
     * 現在の表示モードを取得
     */
    getViewMode(): 'flat' | 'grouped' {
        return this.viewMode;
    }

    /**
     * フィルタテキストを設定してツリーを更新
     */
    setFilter(query: string): void {
        this.filterQuery = query;
        this.refresh();
    }

    // --- TreeDataProvider implementation ---

    getTreeItem(element: ProjectTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: ProjectTreeItem): Promise<ProjectTreeItem[]> {
        if (!element) {
            return this.getRootChildren();
        }

        if (element.nodeType === 'tagGroup' && element.tagName) {
            return this.getTagGroupChildren(element.tagName);
        }

        return [];
    }

    // --- Private methods ---

    private async getRootChildren(): Promise<ProjectTreeItem[]> {
        let projects = this.projectManager.getProjects();

        // フィルタ適用
        if (this.filterQuery) {
            projects = this.projectManager.searchProjects(this.filterQuery);
        }

        // プロジェクトが0件の場合はウェルカムノード
        if (projects.length === 0 && !this.filterQuery) {
            return [this.createWelcomeNode()];
        }

        if (this.viewMode === 'grouped') {
            return this.createTagGroupNodes(projects);
        }

        // フラットモード
        return this.createProjectNodes(projects);
    }

    private async getTagGroupChildren(tagName: string): Promise<ProjectTreeItem[]> {
        let projects: Project[];
        if (tagName === '未分類') {
            projects = this.projectManager.getProjects().filter((p) => p.tags.length === 0);
        } else {
            projects = this.projectManager.getProjectsByTag(tagName);
        }

        // フィルタ適用
        if (this.filterQuery) {
            const q = this.filterQuery.toLowerCase();
            projects = projects.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q)
            );
        }

        return this.createProjectNodes(projects);
    }

    private createTagGroupNodes(projects: Project[]): ProjectTreeItem[] {
        const tagMap = new Map<string, Project[]>();
        const untagged: Project[] = [];

        for (const project of projects) {
            if (project.tags.length === 0) {
                untagged.push(project);
            } else {
                for (const tag of project.tags) {
                    const list = tagMap.get(tag) || [];
                    list.push(project);
                    tagMap.set(tag, list);
                }
            }
        }

        const nodes: ProjectTreeItem[] = [];

        // ソートされたタグ順
        const sortedTags = [...tagMap.keys()].sort();
        for (const tag of sortedTags) {
            const count = tagMap.get(tag)!.length;
            const item = new ProjectTreeItem(
                'tagGroup',
                tag,
                vscode.TreeItemCollapsibleState.Collapsed,
                undefined,
                tag
            );
            item.description = `(${count})`;
            item.iconPath = new vscode.ThemeIcon('tag');
            item.contextValue = 'tagGroup';
            nodes.push(item);
        }

        // 未分類
        if (untagged.length > 0) {
            const item = new ProjectTreeItem(
                'tagGroup',
                '未分類',
                vscode.TreeItemCollapsibleState.Collapsed,
                undefined,
                '未分類'
            );
            item.description = `(${untagged.length})`;
            item.iconPath = new vscode.ThemeIcon('circle-outline');
            item.contextValue = 'tagGroup';
            nodes.push(item);
        }

        return nodes;
    }

    private createProjectNodes(projects: Project[]): ProjectTreeItem[] {
        const currentPath = this.projectManager.getCurrentWorkspacePath();
        const sorted = [...projects].sort((a, b) => a.name.localeCompare(b.name));

        return sorted.map((project) => {
            const isCurrent = currentPath === project.path;
            const item = new ProjectTreeItem(
                'project',
                project.name,
                vscode.TreeItemCollapsibleState.None,
                project.id
            );

            item.description = shortenPath(project.path);

            // ツールチップ
            const tooltipParts = [project.path];
            if (project.description) {
                tooltipParts.push(`\n${project.description}`);
            }
            if (project.tags.length > 0) {
                tooltipParts.push(`\nタグ: ${project.tags.join(', ')}`);
            }
            item.tooltip = tooltipParts.join('');

            // アイコンとコンテキスト
            if (isCurrent) {
                item.iconPath = new vscode.ThemeIcon('folder-active');
                item.contextValue = 'currentProject';
            } else {
                item.iconPath = new vscode.ThemeIcon('folder');
                item.contextValue = 'project';
            }

            // ダブルクリックコマンド
            item.command = {
                command: 'kiro-workspace-hub.openInNewWindow',
                title: '新しいウィンドウで開く',
                arguments: [item],
            };

            return item;
        });
    }

    private createWelcomeNode(): ProjectTreeItem {
        const item = new ProjectTreeItem(
            'welcome',
            'プロジェクトを追加してください',
            vscode.TreeItemCollapsibleState.None
        );
        item.description = '+ ボタンでプロジェクトを登録';
        item.iconPath = new vscode.ThemeIcon('info');
        item.command = {
            command: 'kiro-workspace-hub.addProject',
            title: 'プロジェクトを追加',
        };
        return item;
    }

    /**
     * パスの存在確認（キャッシュ付き）
     */
    async checkPathExists(projectPath: string): Promise<boolean> {
        const cached = this.missingCheckCache.get(projectPath);
        if (cached && Date.now() - cached.checkedAt < this.CACHE_TTL) {
            return !cached.missing;
        }

        const exists = await directoryExists(projectPath);
        this.missingCheckCache.set(projectPath, {
            missing: !exists,
            checkedAt: Date.now(),
        });

        return exists;
    }
}
