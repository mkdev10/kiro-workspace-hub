import * as fs from 'fs';
import * as path from 'path';
import { KiroConfig } from './models/types';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5分

/**
 * 各プロジェクトの.kiro/ディレクトリからKiro設定情報を読み取る
 */
export class KiroConfigReader {
    private cache = new Map<string, { config: KiroConfig; cachedAt: number }>();

    /**
     * プロジェクトのKiro設定概要を読み取る
     */
    async readConfig(projectPath: string): Promise<KiroConfig> {
        // キャッシュチェック
        const cached = this.cache.get(projectPath);
        if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
            return cached.config;
        }

        const kiroPath = path.join(projectPath, '.kiro');

        const [hookCount, steeringCount, mcpServerCount, specCount, skillCount, agentCount] =
            await Promise.all([
                this.countHooks(path.join(kiroPath, 'hooks')),
                this.countFiles(path.join(kiroPath, 'steering')),
                this.countMcpServers(path.join(kiroPath, 'settings', 'mcp.json')),
                this.countDirectories(path.join(kiroPath, 'specs')),
                this.countDirectories(path.join(kiroPath, 'skills')),
                this.countFiles(path.join(kiroPath, 'agents')),
            ]);

        const config: KiroConfig = {
            hookCount,
            steeringCount,
            mcpServerCount,
            specCount,
            skillCount,
            agentCount,
            lastReadAt: new Date().toISOString(),
        };

        // キャッシュに保存
        this.cache.set(projectPath, { config, cachedAt: Date.now() });

        return config;
    }

    /**
     * キャッシュをクリア
     */
    clearCache(projectPath?: string): void {
        if (projectPath) {
            this.cache.delete(projectPath);
        } else {
            this.cache.clear();
        }
    }

    // --- Private methods ---

    private async countFiles(dirPath: string): Promise<number> {
        try {
            const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
            return entries.filter((e) => e.isFile()).length;
        } catch {
            return 0;
        }
    }

    private async countDirectories(dirPath: string): Promise<number> {
        try {
            const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
            return entries.filter((e) => e.isDirectory()).length;
        } catch {
            return 0;
        }
    }

    /**
     * hooks/ 内のフックファイル数をカウントする
     * IDE版: *.json (内部に hooks 配列を持つ)
     * 新形式: *.kiro.hook (1ファイル=1フック)
     */
    private async countHooks(dirPath: string): Promise<number> {
        try {
            const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
            const hookFiles = entries.filter(
                (e) => e.isFile() && (e.name.endsWith('.json') || e.name.endsWith('.kiro.hook')),
            );

            let total = 0;
            for (const file of hookFiles) {
                if (file.name.endsWith('.kiro.hook')) {
                    // .kiro.hook 形式: 1ファイル = 1フック
                    total += 1;
                } else {
                    // .json 形式: hooks 配列の要素数を合計
                    try {
                        const content = await fs.promises.readFile(
                            path.join(dirPath, file.name),
                            'utf-8',
                        );
                        const data = JSON.parse(content);
                        if (Array.isArray(data.hooks)) {
                            total += data.hooks.length;
                        }
                    } catch {
                        // 読み取り/パースに失敗した場合はスキップ
                    }
                }
            }
            return total;
        } catch {
            return 0;
        }
    }

    private async countMcpServers(filePath: string): Promise<number> {
        try {
            const content = await fs.promises.readFile(filePath, 'utf-8');
            const data = JSON.parse(content);
            if (data.mcpServers && typeof data.mcpServers === 'object') {
                return Object.keys(data.mcpServers).length;
            }
            return 0;
        } catch {
            return 0;
        }
    }
}
