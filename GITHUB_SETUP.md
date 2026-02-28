# How to Push Receipt Split to GitHub 🚀

Follow these steps to transfer your Receipt Split project to GitHub:

## Prerequisites
- GitHub account (create one at https://github.com if needed)
- Git installed on your computer (download from https://git-scm.com/)
- Basic familiarity with command line/terminal

## Step 1: Create a New Repository on GitHub

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **+** icon in the top right corner
3. Select **New repository**
4. Fill in the details:
   - **Repository name**: `receipt-split` (or your preferred name)
   - **Description**: `A web app for splitting receipts among groups with OCR and drag-and-drop`
   - **Visibility**: Choose **Public** (to share) or **Private** (for personal use)
   - **DO NOT** initialize with README, .gitignore, or license (we'll do this locally)
5. Click **Create repository**

## Step 2: Initialize Git in Your Local Project

Open PowerShell/Terminal and navigate to your project:

```powershell
cd "c:\Users\jackp\OneDrive\Documents\aPersonal\ReceiptSplit"
```

Initialize git:

```powershell
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

## Step 3: Create `.gitignore` File

Create a `.gitignore` file to exclude unnecessary files from version control:

```powershell
# PowerShell: Create .gitignore
Add-Content -Path .gitignore -Value @"
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage
/.vitest

# Next.js/Build
/.next/
/out/
/build/
*.tsbuildinfo

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Local storage/cache
.cache/
.next/cache

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history
"@
```

## Step 4: Create LICENSE File (Optional but Recommended)

Create an MIT LICENSE file:

```powershell
Add-Content -Path LICENSE -Value @"
MIT License

Copyright (c) 2024 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
"@
```

## Step 5: Stage and Commit Files

Add all files to git:

```powershell
git add .
```

Verify what's being committed (should exclude node_modules):

```powershell
git status
```

Create your first commit:

```powershell
git commit -m "Initial commit: Receipt Split app with OCR and drag-and-drop"
```

## Step 6: Add Remote Repository

Replace `YOUR_USERNAME` and `repository-name` with your GitHub username and repo name:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/receipt-split.git
```

Verify the remote was added:

```powershell
git remote -v
```

## Step 7: Rename Branch to Main (if needed)

```powershell
git branch -M main
```

## Step 8: Push to GitHub

```powershell
git push -u origin main
```

You'll be prompted to authenticate. Use one of these methods:

### Option A: Personal Access Token (Recommended)
1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Create a new token with `repo` scope
3. Copy the token and paste it when prompted for password
4. Save the token for future use

### Option B: SSH Key
1. Generate SSH key: `ssh-keygen -t ed25519`
2. Add public key to GitHub Settings → SSH and GPG keys
3. Use SSH URL instead: `git@github.com:YOUR_USERNAME/receipt-split.git`

## Step 9: Verify on GitHub

1. Go to your repository URL: `https://github.com/YOUR_USERNAME/receipt-split`
2. Verify all files are there (except node_modules)
3. Check that the README appears on the repository homepage

---

## Bonus: Enable GitHub Pages (Optional - for hosting)

If you want to host the app online via GitHub Pages:

1. Go to your repository → Settings → Pages
2. Under "Build and deployment":
   - Source: GitHub Actions
   - Next.js will be auto-detected
3. Configure the workflow or use the default
4. Your site will be live at `https://YOUR_USERNAME.github.io/receipt-split`

**Note**: This requires additional setup with Next.js exports and GitHub Actions. Contact me if you need help with this!

---

## Future Updates: Pushing Changes

After the initial setup, to push updates:

```powershell
git add .
git commit -m "Your descriptive commit message"
git push
```

## Useful Git Commands

```powershell
# Check status
git status

# View commit history
git log --oneline

# Undo last commit (before pushing)
git reset --soft HEAD~1

# Create a new branch for features
git checkout -b feature/my-feature

# Switch branches
git checkout main

# Merge a branch
git merge feature/my-feature
```

---

That's it! You now have your Receipt Split project on GitHub. 🎉

For more help, visit: https://docs.github.com/en/get-started
