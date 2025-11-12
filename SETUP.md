# Arch Linux Setup Guide - MongoDB Index Manager Frontend

This guide provides detailed instructions for setting up the development environment on Arch Linux.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Install Bun](#install-bun)
3. [Install Node.js (Optional)](#install-nodejs-optional)
4. [Install Development Tools](#install-development-tools)
5. [Install Git](#install-git)
6. [VS Code Setup (Optional)](#vs-code-setup-optional)
7. [Project Setup](#project-setup)
8. [Verify Installation](#verify-installation)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Update System

```bash
sudo pacman -Syu
```

### Install Base Development Tools

```bash
sudo pacman -S base-devel git curl wget
```

---

## Install Bun

### Method 1: Using Official Installer (Recommended)

```bash
curl -fsSL https://bun.sh/install | bash
```

This will install Bun to `~/.bun/bin/bun`. Add it to your PATH:

```bash
# Add to ~/.bashrc or ~/.zshrc
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# Reload shell configuration
source ~/.bashrc  # or source ~/.zshrc
```

### Method 2: Using AUR (Alternative)

```bash
# Using yay (AUR helper)
yay -S bun-bin

# Or using paru
paru -S bun-bin
```

### Verify Bun Installation

```bash
bun --version
# Should output: bun x.x.x

bun --help
```

### Bun Documentation
- Official Website: https://bun.sh/
- Installation Guide: https://bun.sh/docs/installation
- Getting Started: https://bun.sh/docs/cli/run

---

## Install Node.js (Optional)

While Bun can run Node.js code, you may want Node.js for compatibility:

### Install Node.js and npm

```bash
sudo pacman -S nodejs npm
```

### Install nvm (Node Version Manager) - Alternative

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Add to ~/.bashrc or ~/.zshrc
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Reload shell
source ~/.bashrc  # or source ~/.zshrc

# Install Node.js LTS
nvm install --lts
nvm use --lts
```

**Note**: Bun is sufficient for this project, Node.js is optional.

---

## Install Development Tools

### Install TypeScript Globally (Optional)

```bash
# Using Bun
bun add -g typescript

# Or using npm (if installed)
npm install -g typescript
```

### Install ESLint and Prettier Globally (Optional)

```bash
# Using Bun
bun add -g eslint prettier

# Or using npm
npm install -g eslint prettier
```

**Note**: These can also be installed as project dependencies (recommended).

---

## Install Git

### Install Git

```bash
sudo pacman -S git
```

### Configure Git

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Optional: Set default editor
git config --global core.editor "code --wait"  # VS Code
# or
git config --global core.editor "nano"  # Nano
```

### Git Documentation
- Official Docs: https://git-scm.com/doc
- Git Cheat Sheet: https://education.github.com/git-cheat-sheet-education.pdf

---

## VS Code Setup (Optional)

### Install VS Code

```bash
# Using AUR
yay -S visual-studio-code-bin

# Or download from: https://code.visualstudio.com/
```

### Recommended VS Code Extensions

Install these extensions for better development experience:

```bash
# Using VS Code CLI
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension formulahendry.auto-rename-tag
code --install-extension christian-kohler.path-intellisense
code --install-extension ms-vscode.vscode-json
```

Or install manually:
1. Open VS Code
2. Press `Ctrl+Shift+X` to open Extensions
3. Search and install:
   - **ESLint** (dbaeumer.vscode-eslint)
   - **Prettier** (esbenp.prettier-vscode)
   - **TypeScript and JavaScript Language Features** (built-in)
   - **Path Intellisense** (christian-kohler.path-intellisense)
   - **Auto Rename Tag** (formulahendry.auto-rename-tag)

### VS Code Settings

Create or edit `~/.config/Code/User/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "files.eol": "\n",
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true
}
```

---

## Project Setup

### Clone or Navigate to Project

```bash
cd /home/kenny/src/1_github/trankhanh040147/mongo-index-manager
```

### Create Frontend Directory

```bash
mkdir -p frontend
cd frontend
```

### Initialize Project with Bun

```bash
# Initialize package.json
bun init -y

# Or use Vite template directly
bunx create-vite . --template react-ts
```

### Install Dependencies

```bash
# Install all dependencies
bun install

# Or install individually
bun add react react-dom react-router-dom
bun add antd @ant-design/icons
bun add zustand axios react-hook-form zod

# Install dev dependencies
bun add -d @types/react @types/react-dom
bun add -d @vitejs/plugin-react typescript vite
bun add -d eslint prettier
```

### Bun Commands Reference

```bash
# Install dependencies
bun install
# or
bun i

# Add a package
bun add <package-name>

# Add dev dependency
bun add -d <package-name>

# Remove a package
bun remove <package-name>

# Run scripts (from package.json)
bun run <script-name>
# or
bun <script-name>

# Run TypeScript files directly
bun run <file.ts>

# Update dependencies
bun update

# Check outdated packages
bun outdated
```

### Bun Documentation
- CLI Reference: https://bun.sh/docs/cli/install
- Package Manager: https://bun.sh/docs/cli/install
- Runtime: https://bun.sh/docs/runtime

---

## Verify Installation

### Check Versions

```bash
# Check Bun
bun --version

# Check Node.js (if installed)
node --version

# Check npm (if installed)
npm --version

# Check Git
git --version

# Check TypeScript (if installed globally)
tsc --version
```

### Test Bun Installation

```bash
# Create a test file
echo 'console.log("Hello from Bun!");' > test.js

# Run with Bun
bun test.js

# Should output: Hello from Bun!

# Clean up
rm test.js
```

### Test Project Setup

```bash
cd frontend

# Install dependencies
bun install

# Run dev server (after setup)
bun run dev

# Build project (after setup)
bun run build
```

---

## Troubleshooting

### Bun Not Found

**Problem**: `bun: command not found`

**Solution**:
```bash
# Check if Bun is installed
ls ~/.bun/bin/bun

# Add to PATH in ~/.bashrc or ~/.zshrc
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# Reload shell
source ~/.bashrc  # or source ~/.zshrc
```

### Permission Denied

**Problem**: Permission errors when installing packages

**Solution**:
```bash
# Don't use sudo with Bun
# Bun installs packages locally by default

# If you need global packages
bun add -g <package-name>
```

### TypeScript Errors

**Problem**: TypeScript not found or version mismatch

**Solution**:
```bash
# Install TypeScript locally
bun add -d typescript

# Use local TypeScript
bunx tsc --version
```

### Port Already in Use

**Problem**: Port 5173 (Vite default) already in use

**Solution**:
```bash
# Find process using port
sudo lsof -i :5173

# Kill process
kill -9 <PID>

# Or change port in vite.config.ts
```

### CORS Issues

**Problem**: CORS errors when connecting to backend

**Solution**:
1. Ensure backend CORS is configured
2. Use Vite proxy in `vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
```

### Package Installation Fails

**Problem**: `bun install` fails

**Solution**:
```bash
# Clear Bun cache
bun pm cache rm

# Remove node_modules and lockfile
rm -rf node_modules bun.lockb

# Reinstall
bun install
```

### Slow Package Installation

**Problem**: Bun install is slow

**Solution**:
```bash
# Check internet connection
ping registry.npmjs.org

# Use Bun's faster registry
# Bun uses npm registry by default, which is usually fast

# Check Bun version (update if old)
bun upgrade
```

---

## Additional Resources

### Arch Linux Documentation
- Arch Wiki: https://wiki.archlinux.org/
- Package Management: https://wiki.archlinux.org/title/Pacman
- AUR: https://wiki.archlinux.org/title/Arch_User_Repository

### Bun Resources
- Official Docs: https://bun.sh/docs
- GitHub: https://github.com/oven-sh/bun
- Discord: https://bun.sh/discord

### Development Tools
- Vite Docs: https://vitejs.dev/
- React Docs: https://react.dev/
- TypeScript Docs: https://www.typescriptlang.org/docs/
- Ant Design Docs: https://ant.design/

### VS Code
- VS Code Docs: https://code.visualstudio.com/docs
- Extensions Marketplace: https://marketplace.visualstudio.com/

---

## Quick Reference Commands

```bash
# System update
sudo pacman -Syu

# Install package
sudo pacman -S <package-name>

# Install from AUR
yay -S <package-name>

# Bun commands
bun install          # Install dependencies
bun add <pkg>        # Add package
bun run <script>     # Run script
bunx <command>       # Run command with Bun

# Git commands
git clone <repo>     # Clone repository
git status           # Check status
git add .            # Stage changes
git commit -m "msg"   # Commit changes
git push             # Push changes

# Project commands (after setup)
bun run dev          # Start dev server
bun run build        # Build for production
bun run preview      # Preview production build
```

---

**Last Updated**: 2024  
**OS**: Arch Linux  
**Package Manager**: Bun

