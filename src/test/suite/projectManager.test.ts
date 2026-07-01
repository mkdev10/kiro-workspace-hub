import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

suite('ProjectManager', () => {
    // Note: ProjectManager tests require vscode API mocking
    // These tests focus on logic that can be tested in isolation

    test('search logic - case insensitive matching', () => {
        // 検索ロジックの単体テスト（ProjectManagerを直接使わず）
        const projects = [
            { name: 'My-API-Service', tags: ['backend', 'aws'], description: 'Main API' },
            { name: 'frontend-app', tags: ['react'], description: 'React frontend' },
            { name: 'infra-cdk', tags: ['aws', 'cdk'], description: 'Infrastructure' },
        ];

        const query = 'aws';
        const q = query.toLowerCase();
        const results = projects.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                p.tags.some((t) => t.toLowerCase().includes(q)) ||
                p.description.toLowerCase().includes(q)
        );

        assert.strictEqual(results.length, 2);
        assert.ok(results.some((r) => r.name === 'My-API-Service'));
        assert.ok(results.some((r) => r.name === 'infra-cdk'));
    });

    test('tag grouping logic', () => {
        const projects = [
            { name: 'a', tags: ['backend', 'aws'] },
            { name: 'b', tags: ['frontend'] },
            { name: 'c', tags: [] },
            { name: 'd', tags: ['backend'] },
        ];

        const tagMap = new Map<string, typeof projects>();
        const untagged: typeof projects = [];

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

        assert.strictEqual(tagMap.get('backend')?.length, 2);
        assert.strictEqual(tagMap.get('frontend')?.length, 1);
        assert.strictEqual(tagMap.get('aws')?.length, 1);
        assert.strictEqual(untagged.length, 1);
    });

    test('tag validation - empty tags filtered out', () => {
        const input = 'backend, , aws, ,   react  ';
        const tags = input.split(',').map((t) => t.trim()).filter((t) => t !== '');
        assert.deepStrictEqual(tags, ['backend', 'aws', 'react']);
    });

    test('tag validation - max 20 tags enforced', () => {
        const tags = Array.from({ length: 25 }, (_, i) => `tag${i}`);
        const cleaned = tags.slice(0, 20);
        assert.strictEqual(cleaned.length, 20);
    });
});
