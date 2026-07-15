import * as crypto from 'crypto';
import * as vscode from 'vscode';
import { Project, KiroConfig, HubSettings } from './models/types';
import { StorageService } from './storageService';
import { ProjectScanner } from './projectScanner';
import { KiroConfigReader } from './kiroConfigReader';
import { normalizePath, directoryExists, hasKiroDirectory } from './utils/pathUtils';

/**
 * プロジェクトの登録・削除・編集のビジネスロジックを管理する
 */
export class ProjectManager {
    private readonly _onProjectsChanged = new vscode.EventEmitter<void>();
    readonly onProjectsChanged = this._onProjectsChanged.event;

    private projects: Project[] = [];

    constructor(
        private readonly storage: StorageService,
        private readonly scanner: ProjectScanner,
        private readonly configReader: KiroConfigReader
    ) { }

    /**
     * 初期化（StorageServiceからデータ読み込み）
     */
    async initialize(): Promise<void> {
        this.projects = this.storage.getProjects();
    }

    /**
     * プロジェクトを手動登録する
     */
    async addProject(folderPath: string): Promise<Project> {
        const normalized = normalizePath(folderPath);

        // バリデーション
        if (!(await directoryExists(normalized))) {
            throw new Error('指定されたパスが見つかりません');
        }

        // 重複チェック
        if (this.projects.some((p) => p.path === normalized)) {
            throw new Error('このプロジェクトは既に登録されています');
        }

        // .kiro チェック（警告のみ、ブロックしない）
        const hasKiro = await hasKiroDirectory(normalized);
        if (!hasKiro) {
            const choice = await vscode.window.showWarningMessage(
                '.kiroディレクトリがありません。このフォルダを登録しますか？',
                'はい',
                'いいえ'
            );
            if (choice !== 'はい') {
                throw new Error('登録がキャンセルされました');
            }
        }

        const project: Project = {
            id: crypto.randomUUID(),
            name: this.extractFolderName(normalized),
            path: normalized,
            tags: [],
            description: '',
            addedAt: new Date().toISOString(),
            lastOpenedAt: new Date().toISOString(),
            source: 'manual',
        };

        this.projects.push(project);
        await this.storage.saveProjects(this.projects);
        this._onProjectsChanged.fire();

        return project;
    }

    /**
     * プロジェクトの登録を解除する
     */
    async removeProject(id: string): Promise<void> {
        const index = this.projects.findIndex((p) => p.id === id);
        if (index === -1) {
            return;
        }

        this.projects.splice(index, 1);
        await this.storage.saveProjects(this.projects);
        this._onProjectsChanged.fire();
    }

    /**
     * 全プロジェクトを取得する
     */
    getProjects(): Project[] {
        return [...this.projects];
    }

    /**
     * タグでフィルタしたプロジェクトを取得
     */
    getProjectsByTag(tag: string): Project[] {
        return this.projects.filter((p) => p.tags.includes(tag));
    }

    /**
     * 名前・タグ・説明文で部分一致検索
     */
    searchProjects(query: string): Project[] {
        const q = query.toLowerCase();
        return this.projects.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                p.tags.some((t) => t.toLowerCase().includes(q)) ||
                p.description.toLowerCase().includes(q)
        );
    }

    /**
     * プロジェクト情報を更新する
     */
    async updateProject(id: string, data: Partial<Pick<Project, 'name' | 'tags' | 'description' | 'path'>>): Promise<Project | undefined> {
        const project = this.projects.find((p) => p.id === id);
        if (!project) {
            return undefined;
        }

        if (data.name !== undefined) {
            if (data.name.trim() === '') {
                throw new Error('プロジェクト名を入力してください');
            }
            if (data.name.length > 100) {
                throw new Error('プロジェクト名は100文字以内にしてください');
            }
            project.name = data.name.trim();
        }

        if (data.tags !== undefined) {
            const cleaned = data.tags
                .map((t) => t.trim())
                .filter((t) => t !== '')
                .slice(0, 20);
            project.tags = cleaned;
        }

        if (data.description !== undefined) {
            if (data.description.length > 500) {
                throw new Error('説明は500文字以内にしてください');
            }
            project.description = data.description;
        }

        if (data.path !== undefined) {
            const normalized = normalizePath(data.path);
            if (!(await directoryExists(normalized))) {
                throw new Error('指定されたパスが見つかりません');
            }
            project.path = normalized;
        }

        await this.storage.saveProjects(this.projects);
        this._onProjectsChanged.fire();

        return project;
    }

    /**
     * 新しいウィンドウでプロジェクトを開く
     */
    async openInNewWindow(id: string): Promise<void> {
        const project = this.projects.find((p) => p.id === id);
        if (!project) {
            return;
        }

        if (!(await directoryExists(project.path))) {
            vscode.window.showErrorMessage(
                `パスが見つかりません: ${project.path}`
            );
            return;
        }

        const uri = vscode.Uri.file(project.path);
        await vscode.commands.executeCommand('vscode.openFolder', uri, { forceNewWindow: true });

        project.lastOpenedAt = new Date().toISOString();
        await this.storage.saveProjects(this.projects);
    }

    /**
     * 現在のウィンドウでプロジェクトを開く
     */
    async openInCurrentWindow(id: string): Promise<void> {
        const project = this.projects.find((p) => p.id === id);
        if (!project) {
            return;
        }

        if (!(await directoryExists(project.path))) {
            vscode.window.showErrorMessage(
                `パスが見つかりません: ${project.path}`
            );
            return;
        }

        const uri = vscode.Uri.file(project.path);
        await vscode.commands.executeCommand('vscode.openFolder', uri, { forceNewWindow: false });

        project.lastOpenedAt = new Date().toISOString();
        await this.storage.saveProjects(this.projects);
    }

    /**
     * 自動検出スキャンを実行する
     */
    async scanForProjects(): Promise<Project[]> {
        const settings = this.storage.getSettings();
        if (settings.scanPaths.length === 0) {
            const choice = await vscode.window.showInformationMessage(
                'スキャンパスが設定されていません。設定しますか？',
                'はい',
                'いいえ'
            );
            if (choice === 'はい') {
                await vscode.commands.executeCommand('kiro-workspace-hub.configureScanPaths');
            }
            return [];
        }

        const registeredPaths = new Set(this.projects.map((p) => p.path));

        const results = await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: 'プロジェクトをスキャン中...',
                cancellable: true,
            },
            async (progress, token) => {
                token.onCancellationRequested(() => {
                    this.scanner.cancelScan();
                });

                this.scanner.onScanProgress((p) => {
                    progress.report({
                        message: `${p.foundCount}件検出 (${p.scannedCount}ディレクトリスキャン済み)`,
                    });
                });

                return this.scanner.scan(
                    settings.scanPaths,
                    settings.scanMaxDepth,
                    registeredPaths
                );
            }
        );

        // 未登録のプロジェクトを追加
        const newProjects: Project[] = [];
        for (const result of results) {
            if (!result.alreadyRegistered && result.hasKiroDir) {
                const project: Project = {
                    id: crypto.randomUUID(),
                    name: this.extractFolderName(result.path),
                    path: result.path,
                    tags: [],
                    description: '',
                    addedAt: new Date().toISOString(),
                    lastOpenedAt: new Date().toISOString(),
                    source: 'scanned',
                };
                newProjects.push(project);
            }
        }

        if (newProjects.length > 0) {
            this.projects.push(...newProjects);
            await this.storage.saveProjects(this.projects);
            this._onProjectsChanged.fire();
            vscode.window.showInformationMessage(
                `${newProjects.length}個の新しいプロジェクトを検出しました`
            );
        } else {
            vscode.window.showInformationMessage(
                '新しいプロジェクトは見つかりませんでした'
            );
        }

        // スキャン時にKiro設定キャッシュをクリアして最新情報を反映
        this.configReader.clearCache();

        return newProjects;
    }

    /**
     * プロジェクトのKiro設定概要を取得
     */
    async getProjectConfig(id: string): Promise<KiroConfig | undefined> {
        const project = this.projects.find((p) => p.id === id);
        if (!project) {
            return undefined;
        }

        try {
            return await this.configReader.readConfig(project.path);
        } catch {
            return undefined;
        }
    }

    /**
     * Kiro設定キャッシュをクリアし、次回取得時に最新情報を反映する
     */
    refreshConfigs(): void {
        this.configReader.clearCache();
    }

    /**
     * 全タグを取得（サジェスト用）
     */
    getAllTags(): string[] {
        const tagSet = new Set<string>();
        for (const project of this.projects) {
            for (const tag of project.tags) {
                tagSet.add(tag);
            }
        }
        return [...tagSet].sort();
    }

    /**
     * 現在のワークスペースのパスを取得
     */
    getCurrentWorkspacePath(): string | undefined {
        const folders = vscode.workspace.workspaceFolders;
        if (folders && folders.length > 0) {
            return normalizePath(folders[0].uri.fsPath);
        }
        return undefined;
    }

    dispose(): void {
        this._onProjectsChanged.dispose();
    }

    private extractFolderName(folderPath: string): string {
        const parts = folderPath.split(/[/\\]/);
        return parts[parts.length - 1] || folderPath;
    }
}
