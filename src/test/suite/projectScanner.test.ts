import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ProjectScanner } from '../../projectScanner';

suite('ProjectScanner', () => {
    let scanner: ProjectScanner;
    let testDir: string;

    setup(async () => {
        scanner = new ProjectScanner();
        testDir = path.join(os.tmpdir(), `kiro-scan-test-${Date.now()}`);
        await fs.promises.mkdir(testDir, { recursive: true });
    });

    teardown(async () => {
        scanner.dispose();
        try {
            await fs.promises.rm(testDir, { recursive: true, force: true });
        } catch {
            // ignore
        }
    });

    test('scan finds project with .kiro directory', async () => {
        // テスト用プロジェクト作成
        const projectDir = path.join(testDir, 'my-project');
        const kiroDir = path.join(projectDir, '.kiro');
        await fs.promises.mkdir(kiroDir, { recursive: true });

        const results = await scanner.scan([testDir], 3, new Set());
        const found = results.filter((r) => r.hasKiroDir && !r.alreadyRegistered);
        assert.ok(found.length >= 1);
        assert.ok(found.some((r) => r.path.includes('my-project')));
    });

    test('scan skips already registered paths', async () => {
        const projectDir = path.join(testDir, 'registered-project');
        const kiroDir = path.join(projectDir, '.kiro');
        await fs.promises.mkdir(kiroDir, { recursive: true });

        const normalizedPath = fs.realpathSync(projectDir);
        const registered = new Set([normalizedPath]);
        const results = await scanner.scan([testDir], 3, registered);
        const newProjects = results.filter((r) => !r.alreadyRegistered);
        assert.strictEqual(newProjects.length, 0);
    });

    test('scan respects max depth', async () => {
        // 深い階層にプロジェクト作成（4階層）
        const deepDir = path.join(testDir, 'a', 'b', 'c', 'd', 'deep-project');
        const kiroDir = path.join(deepDir, '.kiro');
        await fs.promises.mkdir(kiroDir, { recursive: true });

        // maxDepth=2では見つからない
        const results = await scanner.scan([testDir], 2, new Set());
        const found = results.filter((r) => r.path.includes('deep-project'));
        assert.strictEqual(found.length, 0);
    });

    test('scan skips excluded directories', async () => {
        // node_modules内にプロジェクト作成
        const nodeModulesProject = path.join(testDir, 'node_modules', 'some-pkg');
        const kiroDir = path.join(nodeModulesProject, '.kiro');
        await fs.promises.mkdir(kiroDir, { recursive: true });

        const results = await scanner.scan([testDir], 3, new Set());
        const found = results.filter((r) => r.path.includes('node_modules'));
        assert.strictEqual(found.length, 0);
    });

    test('cancelScan stops scanning', async () => {
        // スキャン開始直後にキャンセル
        const promise = scanner.scan([testDir], 3, new Set());
        scanner.cancelScan();
        const results = await promise;
        // キャンセルされてもエラーにはならない
        assert.ok(Array.isArray(results));
    });
});
