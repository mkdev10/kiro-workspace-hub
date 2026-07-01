import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { StorageService } from '../../storageService';

suite('StorageService', () => {
    let service: StorageService;
    let testDir: string;

    setup(async () => {
        // テスト用の一時ディレクトリを使用
        testDir = path.join(os.tmpdir(), `kiro-hub-test-${Date.now()}`);
        // 環境変数でテスト用ディレクトリを指定する代わりに、
        // StorageServiceの内部パスをモックするのが理想だが、
        // ここではinitializeの動作確認のみ行う
    });

    teardown(async () => {
        if (service) {
            service.dispose();
        }
        // テスト用ディレクトリのクリーンアップ
        try {
            await fs.promises.rm(testDir, { recursive: true, force: true });
        } catch {
            // ignore
        }
    });

    test('isFirstLaunch returns true when no projects', () => {
        service = new StorageService();
        // initialize前はプロジェクトが空
        assert.strictEqual(service.isFirstLaunch(), true);
    });

    test('getProjects returns empty array initially', () => {
        service = new StorageService();
        const projects = service.getProjects();
        assert.deepStrictEqual(projects, []);
    });

    test('getSettings returns default settings initially', () => {
        service = new StorageService();
        const settings = service.getSettings();
        assert.strictEqual(settings.viewMode, 'flat');
        assert.strictEqual(settings.defaultOpenMode, 'newWindow');
        assert.strictEqual(settings.scanMaxDepth, 3);
        assert.deepStrictEqual(settings.scanPaths, []);
    });
});
