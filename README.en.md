<p align="center">
  <img src="resources/icon.png" alt="Kiro Workspace Hub" width="128" height="128">
</p>

# Kiro Workspace Hub

A Kiro extension that lets you switch between multiple Kiro projects from a sidebar tree view.

## Features

- **Project Registration**: Add folders manually or auto-detect projects with `.kiro` directories
- **One-Click Switching**: Select a project from the sidebar to open it instantly
- **View Modes**: Toggle between flat list and tag-grouped views
- **Project Search**: Real-time filtering by name, tags, or description
- **Metadata Management**: Custom display names, tags, and descriptions
- **Kiro Config Overview**: View hook, steering, and MCP server counts per project

## Installation

### From VSIX

1. Download the `.vsix` file from [Releases](https://github.com/your-username/kiro-workspace-hub/releases)
2. Open Kiro's command palette (`Cmd+Shift+P`)
3. Select **Extensions: Install from VSIX...**
4. Choose the downloaded `.vsix` file

### Build from Source

```bash
npm install
npm run compile
npx @vscode/vsce package
```

## Usage

1. Click the "Workspace Hub" icon in the sidebar
2. Click the "+" button to add a project folder
3. Click a project to switch to it

### Scan Configuration

Run `Workspace Hub: Configure Scan Paths` from the command palette to specify root directories for automatic project detection.

## Development

### Prerequisites

- Node.js 20.x (managed via mise: `.mise.toml`)
- npm

### Setup

```bash
mise install       # Install Node.js version
npm install        # Install dependencies
npm run compile    # Build
```

### Commands

| Command           | Description       |
| ----------------- | ----------------- |
| `npm run compile` | Development build |
| `npm run watch`   | Watch mode build  |
| `npm run package` | Production build  |
| `npm run lint`    | Run ESLint        |
| `npm run test`    | Run tests         |

### Debugging

1. Open the extension project in Kiro/VSCode
2. Press `F5` to launch the Extension Development Host
3. Check the "Workspace Hub" sidebar

## Data Storage

- Project registry: `~/.kiro-hub/projects.json`
- Extension settings: `~/.kiro-hub/settings.json`

## License

MIT
