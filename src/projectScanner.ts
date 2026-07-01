import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { ScanResult, ScanProgress, SCAN_EXCLUDE_DIRS } from './models/types';
import { normalizePath } from './utils/pathUtils';

/**
 * ファイルシステムをスキャンして.kiroプロジェクトを自動検出する
 */
export class ProjectScanner {
    private readonly _onScanProgress = new vscode.EventEmitter<ScanProgress>();
    private readonly _onScanComplete = new vscode.EventEmitter<ScanResult[]>();
    readonly onScanProgress = this._onScanProgress.event;
    readonly onScanComplete = this._onScanComplete.event;

    private abortController: AbortController | undefined;

    /**
     * 指定パス配下をスキャンして.kiroプロジェクトを検出する
     */
    async scan(
        rootPaths: string[],
        maxDepth: number,
        registeredPaths: Set<string>
    ): Promise<ScanResult[]> {
        this.abortController = new AbortController();
        const results: ScanResult[] = [];
        let scannedCount = 0;
        let foundCount = 0;

        for (const rootPath of rootPaths) {
            if (this.abortController.signal.aborted) {
                break;
            }

            const normalizedRoot = normalizePath(rootPath);

            // ルートパスの存在チェック
            try {
                const stat = await fs.promises.stat(normalizedRoot);
                if (!stat.isDirectory()) {
                    continue;
                }
            } catch {
                continue;
            }

            await this.scanDirectory(
                normalizedRoot,
                0,
                maxDepth,
                registeredPaths,
                results,
                (s, f, p) => {
                    scannedCount = s;
                    foundCount = f;
                    this._onScanProgress.fire({ scannedCount: s, foundCount: f, currentPath: p });
                }
            );
        }

        this._onScanComplete.fire(results);
        this.abortController = undefined;
        return results;
    }

    /**
     * 実行中のスキャンをキャンセルする
     */
    cancelScan(): void {
        this.abortController?.abort();
    }

    dispose(): void {
        this.cancelScan();
        this._onScanProgress.dispose();
        this._onScanComplete.dispose();
    }

    // --- Private methods ---

    private async scanDirectory(
        dirPath: string,
        currentDepth: number,
        maxDepth: number,
        registeredPaths: Set<string>,
        results: ScanResult[],
        onProgress: (scanned: number, found: number, current: string) => void,
        counters: { scanned: number; found: number } = { scanned: 0, found: 0 }
    ): Promise<void> {
        if (this.abortController?.signal.aborted) {
            return;
        }

        if (currentDepth > maxDepth) {
            return;
        }

        counters.scanned++;
        onProgress(counters.scanned, counters.found, dirPath);

        // .kiro ディレクトリの存在チェック
        const kiroPath = path.join(dirPath, '.kiro');
        let hasKiroDir = false;
        try {
            const stat = await fs.promises.stat(kiroPath);
            hasKiroDir = stat.isDirectory();
        } catch {
            // .kiro が存在しない
        }

        if (hasKiroDir) {
            const normalizedPath = normalizePath(dirPath);
            const alreadyRegistered = registeredPaths.has(normalizedPath);
            results.push({ path: normalizedPath, hasKiroDir: true, alreadyRegistered });
            counters.found++;
            onProgress(counters.scanned, counters.found, dirPath);
            // .kiro が見つかったらその配下は探索しない（プロジェクトルートとして確定）
            return;
        }

        // 子ディレクトリを探索
        if (currentDepth >= maxDepth) {
            return;
        }

        let entries: fs.Dirent[];
        try {
            entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
        } catch {
            return;
        }

        for (const entry of entries) {
            if (this.abortController?.signal.aborted) {
                return;
            }

            if (!entry.isDirectory()) {
                continue;
            }

            // 除外ディレクトリチェック
            if (SCAN_EXCLUDE_DIRS.has(entry.name)) {
                continue;
            }

            // 隠しディレクトリは除外（.kiro 自体は上でチェック済み）
            if (entry.name.startsWith('.')) {
                continue;
            }

            const childPath = path.join(dirPath, entry.name);
            await this.scanDirectory(
                childPath,
                currentDepth + 1,
                maxDepth,
                registeredPaths,
                results,
                onProgress,
                counters
            );
        }
    }
}
