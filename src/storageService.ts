import * as fs from 'fs';
import * as path from 'path';
import { Project, HubSettings, ProjectsFile, SettingsFile, DEFAULT_SETTINGS } from './models/types';
import { Debouncer } from './utils/debounce';
import { getHubDataDir } from './utils/pathUtils';

/**
 * ~/.kiro-hub/ へのデータ永続化を担当するサービス
 */
export class StorageService {
    private readonly dataDir: string;
    private readonly projectsFilePath: string;
    private readonly settingsFilePath: string;
    private readonly debouncer: Debouncer;
    private projects: Project[] = [];
    private settings: HubSettings = { ...DEFAULT_SETTINGS };

    constructor() {
        this.dataDir = getHubDataDir();
        this.projectsFilePath = path.join(this.dataDir, 'projects.json');
        this.settingsFilePath = path.join(this.dataDir, 'settings.json');
        this.debouncer = new Debouncer(300);
    }

    /**
     * ~/.kiro-hub/ ディレクトリとファイルを初期化
     */
    async initialize(): Promise<void> {
        // ディレクトリ作成
        await fs.promises.mkdir(this.dataDir, { recursive: true });

        // projects.json 読み込み or 作成
        await this.loadProjectsFromDisk();

        // settings.json 読み込み or 作成
        await this.loadSettingsFromDisk();
    }

    /**
     * 保存済みプロジェクト一覧を取得
     */
    getProjects(): Project[] {
        return [...this.projects];
    }

    /**
     * プロジェクト一覧を設定（保存はデバウンスされる）
     */
    async saveProjects(projects: Project[]): Promise<void> {
        this.projects = [...projects];
        await this.debouncer.schedule(() => this.writeProjectsToDisk());
    }

    /**
     * 拡張機能設定を取得
     */
    getSettings(): HubSettings {
        return { ...this.settings };
    }

    /**
     * 拡張機能設定を保存
     */
    async saveSettings(settings: HubSettings): Promise<void> {
        this.settings = { ...settings };
        await this.writeSettingsToDisk();
    }

    /**
     * デバウンス中の書き込みを即時実行
     */
    async flush(): Promise<void> {
        await this.debouncer.flush(() => this.writeProjectsToDisk());
    }

    /**
     * 初回起動かどうか判定
     */
    isFirstLaunch(): boolean {
        return this.projects.length === 0;
    }

    dispose(): void {
        this.debouncer.dispose();
    }

    // --- Private methods ---

    private async loadProjectsFromDisk(): Promise<void> {
        try {
            const content = await fs.promises.readFile(this.projectsFilePath, 'utf-8');
            const data: ProjectsFile = JSON.parse(content);
            this.projects = data.projects || [];
        } catch {
            // ファイルが存在しない場合は空で初期化
            this.projects = [];
        }
    }

    private async loadSettingsFromDisk(): Promise<void> {
        try {
            const content = await fs.promises.readFile(this.settingsFilePath, 'utf-8');
            const data: SettingsFile = JSON.parse(content);
            this.settings = {
                scanPaths: data.scanPaths || [],
                viewMode: data.viewMode || 'flat',
                defaultOpenMode: data.defaultOpenMode || 'newWindow',
                scanMaxDepth: data.scanMaxDepth || 3,
            };
        } catch {
            // ファイルが存在しない場合はデフォルトで初期化
            this.settings = { ...DEFAULT_SETTINGS };
        }
    }

    private async writeProjectsToDisk(): Promise<void> {
        const data: ProjectsFile = {
            version: 1,
            projects: this.projects,
        };
        await fs.promises.writeFile(
            this.projectsFilePath,
            JSON.stringify(data, null, 2),
            'utf-8'
        );
    }

    private async writeSettingsToDisk(): Promise<void> {
        const data: SettingsFile = {
            version: 1,
            scanPaths: this.settings.scanPaths,
            viewMode: this.settings.viewMode,
            defaultOpenMode: this.settings.defaultOpenMode,
            scanMaxDepth: this.settings.scanMaxDepth,
        };
        await fs.promises.writeFile(
            this.settingsFilePath,
            JSON.stringify(data, null, 2),
            'utf-8'
        );
    }
}
