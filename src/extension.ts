import * as vscode from 'vscode';
import { StorageService } from './storageService';
import { ProjectScanner } from './projectScanner';
import { KiroConfigReader } from './kiroConfigReader';
import { ProjectManager } from './projectManager';
import { ProjectTreeViewProvider } from './projectTreeView';
import { ProjectTreeItem } from './models/types';

let storageService: StorageService;
let projectManager: ProjectManager;

export async function activate(context: vscode.ExtensionContext) {
    // コンポーネント初期化
    storageService = new StorageService();
    await storageService.initialize();

    const scanner = new ProjectScanner();
    const configReader = new KiroConfigReader();

    projectManager = new ProjectManager(storageService, scanner, configReader);
    await projectManager.initialize();

    const treeViewProvider = new ProjectTreeViewProvider(
        projectManager,
        context.extensionUri
    );

    // ツリービュー初期表示モードを設定から復元
    const settings = storageService.getSettings();
    treeViewProvider.setViewMode(settings.viewMode);

    // ツリービュー登録
    const treeView = vscode.window.createTreeView('kiro-workspace-hub.projectsView', {
        treeDataProvider: treeViewProvider,
        showCollapseAll: true,
    });

    // コマンド登録
    const commands = [
        vscode.commands.registerCommand('kiro-workspace-hub.addProject', async () => {
            const result = await vscode.window.showOpenDialog({
                canSelectFolders: true,
                canSelectFiles: false,
                canSelectMany: false,
                openLabel: 'プロジェクトとして追加',
            });

            if (result && result.length > 0) {
                try {
                    await projectManager.addProject(result[0].fsPath);
                    vscode.window.showInformationMessage('プロジェクトを追加しました');
                } catch (error) {
                    if (error instanceof Error) {
                        vscode.window.showErrorMessage(error.message);
                    }
                }
            }
        }),

        vscode.commands.registerCommand('kiro-workspace-hub.removeProject', async (item: ProjectTreeItem) => {
            if (!item?.projectId) { return; }
            const choice = await vscode.window.showWarningMessage(
                'このプロジェクトの登録を解除しますか？（ファイルは削除されません）',
                'はい',
                'いいえ'
            );
            if (choice === 'はい') {
                await projectManager.removeProject(item.projectId);
            }
        }),

        vscode.commands.registerCommand('kiro-workspace-hub.openInNewWindow', async (item: ProjectTreeItem) => {
            if (!item?.projectId) { return; }
            await projectManager.openInNewWindow(item.projectId);
        }),

        vscode.commands.registerCommand('kiro-workspace-hub.openInCurrentWindow', async (item: ProjectTreeItem) => {
            if (!item?.projectId) { return; }
            await projectManager.openInCurrentWindow(item.projectId);
        }),

        vscode.commands.registerCommand('kiro-workspace-hub.editTags', async (item: ProjectTreeItem) => {
            if (!item?.projectId) { return; }
            const projects = projectManager.getProjects();
            const project = projects.find((p) => p.id === item.projectId);
            if (!project) { return; }

            const input = await vscode.window.showInputBox({
                prompt: 'カンマ区切りでタグを入力',
                placeHolder: '例: backend, aws, microservice',
                value: project.tags.join(', '),
            });

            if (input !== undefined) {
                const tags = input.split(',').map((t) => t.trim()).filter((t) => t !== '');
                await projectManager.updateProject(item.projectId, { tags });
            }
        }),

        vscode.commands.registerCommand('kiro-workspace-hub.editDescription', async (item: ProjectTreeItem) => {
            if (!item?.projectId) { return; }
            const projects = projectManager.getProjects();
            const project = projects.find((p) => p.id === item.projectId);
            if (!project) { return; }

            const input = await vscode.window.showInputBox({
                prompt: 'プロジェクトの説明を入力',
                placeHolder: '例: メインAPIサービス',
                value: project.description,
            });

            if (input !== undefined) {
                await projectManager.updateProject(item.projectId, { description: input });
            }
        }),

        vscode.commands.registerCommand('kiro-workspace-hub.renameProject', async (item: ProjectTreeItem) => {
            if (!item?.projectId) { return; }
            const projects = projectManager.getProjects();
            const project = projects.find((p) => p.id === item.projectId);
            if (!project) { return; }

            const input = await vscode.window.showInputBox({
                prompt: 'プロジェクト名を入力',
                value: project.name,
                validateInput: (value) => {
                    if (value.trim() === '') { return 'プロジェクト名を入力してください'; }
                    if (value.length > 100) { return 'プロジェクト名は100文字以内にしてください'; }
                    return null;
                },
            });

            if (input !== undefined) {
                await projectManager.updateProject(item.projectId, { name: input });
            }
        }),

        vscode.commands.registerCommand('kiro-workspace-hub.updatePath', async (item: ProjectTreeItem) => {
            if (!item?.projectId) { return; }
            const result = await vscode.window.showOpenDialog({
                canSelectFolders: true,
                canSelectFiles: false,
                canSelectMany: false,
                openLabel: 'パスを更新',
            });

            if (result && result.length > 0) {
                try {
                    await projectManager.updateProject(item.projectId, { path: result[0].fsPath });
                    vscode.window.showInformationMessage('パスを更新しました');
                } catch (error) {
                    if (error instanceof Error) {
                        vscode.window.showErrorMessage(error.message);
                    }
                }
            }
        }),

        vscode.commands.registerCommand('kiro-workspace-hub.scanProjects', async () => {
            await projectManager.scanForProjects();
        }),

        vscode.commands.registerCommand('kiro-workspace-hub.refresh', () => {
            projectManager.refreshConfigs();
            treeViewProvider.refresh();
        }),

        vscode.commands.registerCommand('kiro-workspace-hub.toggleViewMode', async () => {
            const current = treeViewProvider.getViewMode();
            const newMode = current === 'flat' ? 'grouped' : 'flat';
            treeViewProvider.setViewMode(newMode);

            const settings = storageService.getSettings();
            settings.viewMode = newMode;
            await storageService.saveSettings(settings);
        }),

        vscode.commands.registerCommand('kiro-workspace-hub.configureScanPaths', async () => {
            const settings = storageService.getSettings();
            const currentPaths = settings.scanPaths.join(', ');

            const input = await vscode.window.showInputBox({
                prompt: 'スキャン対象のルートディレクトリ（カンマ区切りで複数指定可）',
                placeHolder: '例: ~/projects, ~/work',
                value: currentPaths,
            });

            if (input !== undefined) {
                const paths = input
                    .split(',')
                    .map((p) => p.trim())
                    .filter((p) => p !== '');
                settings.scanPaths = paths;
                await storageService.saveSettings(settings);
                vscode.window.showInformationMessage('スキャンパスを設定しました');
            }
        }),
    ];

    // Disposable登録
    context.subscriptions.push(treeView, ...commands, scanner, storageService, projectManager);
}

export async function deactivate() {
    // デバウンス中の書き込みをフラッシュ
    if (storageService) {
        await storageService.flush();
    }
}
