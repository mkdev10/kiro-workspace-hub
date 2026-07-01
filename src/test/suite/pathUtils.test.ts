import * as assert from 'assert';
import * as os from 'os';
import * as path from 'path';
import { normalizePath, shortenPath, isAbsolutePath } from '../../utils/pathUtils';

suite('pathUtils', () => {
    test('normalizePath removes trailing slash', () => {
        const result = normalizePath('/Users/test/project/');
        assert.ok(!result.endsWith('/') || result === '/');
    });

    test('normalizePath expands tilde', () => {
        const result = normalizePath('~/projects');
        const expected = path.join(os.homedir(), 'projects');
        assert.strictEqual(result, expected);
    });

    test('normalizePath handles absolute path', () => {
        const input = '/Users/test/project';
        const result = normalizePath(input);
        assert.ok(path.isAbsolute(result));
    });

    test('shortenPath replaces home dir with tilde', () => {
        const home = os.homedir();
        const input = path.join(home, 'projects', 'my-app');
        const result = shortenPath(input);
        assert.ok(result.startsWith('~'));
        assert.ok(result.includes('projects'));
    });

    test('shortenPath leaves non-home paths unchanged', () => {
        const input = '/opt/projects/my-app';
        const result = shortenPath(input);
        assert.strictEqual(result, input);
    });

    test('isAbsolutePath returns true for absolute paths', () => {
        assert.strictEqual(isAbsolutePath('/Users/test'), true);
    });

    test('isAbsolutePath returns false for relative paths', () => {
        assert.strictEqual(isAbsolutePath('relative/path'), false);
    });
});
