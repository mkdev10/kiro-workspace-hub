import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

/**
 * パスを正規化する
 * - ~ をホームディレクトリに展開
 * - 末尾スラッシュ除去
 * - シンボリックリンク解決
 */
export function normalizePath(inputPath: string): string {
    let normalized = inputPath.trim();

    // ~ をホームディレクトリに展開
    if (normalized.startsWith('~')) {
        normalized = path.join(os.homedir(), normalized.slice(1));
    }

    // 絶対パスに変換
    normalized = path.resolve(normalized);

    // 末尾スラッシュ除去（ルートパス以外）
    if (normalized.length > 1 && normalized.endsWith(path.sep)) {
        normalized = normalized.slice(0, -1);
    }

    // シンボリックリンク解決（パスが存在する場合のみ）
    try {
        normalized = fs.realpathSync(normalized);
    } catch {
        // パスが存在しない場合はそのまま返す
    }

    return normalized;
}

/**
 * パスを短縮表示用に変換する
 * 例: /Users/username/projects/my-app → ~/projects/my-app
 */
export function shortenPath(fullPath: string): string {
    const home = os.homedir();
    if (fullPath.startsWith(home)) {
        return '~' + fullPath.slice(home.length);
    }
    return fullPath;
}

/**
 * パスが絶対パスかチェックする
 */
export function isAbsolutePath(inputPath: string): boolean {
    return path.isAbsolute(inputPath);
}

/**
 * ディレクトリが存在するかチェックする
 */
export async function directoryExists(dirPath: string): Promise<boolean> {
    try {
        const stat = await fs.promises.stat(dirPath);
        return stat.isDirectory();
    } catch {
        return false;
    }
}

/**
 * .kiroディレクトリが存在するかチェックする
 */
export async function hasKiroDirectory(dirPath: string): Promise<boolean> {
    const kiroPath = path.join(dirPath, '.kiro');
    try {
        const stat = await fs.promises.stat(kiroPath);
        return stat.isDirectory();
    } catch {
        return false;
    }
}

/**
 * ~/.kiro-hub/ のパスを取得する
 */
export function getHubDataDir(): string {
    return path.join(os.homedir(), '.kiro-hub');
}
