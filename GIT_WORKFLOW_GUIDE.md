# 🌿 GrowGuardians Git Workflow Guide

This guide explains how to maintain and update your GrowGuardians repository on GitHub.

## 🚀 Initial Setup (Already Done)

1. **Initialize Git repository:**
   ```bash
   git init
   ```

2. **Configure user information:**
   ```bash
   git config --global user.name "Farwah Mahnoor"
   git config --global user.email "farwahmahnoor99@gmail.com"
   ```

3. **Add all files and commit:**
   ```bash
   git add .
   git commit -m "Initial commit: Full GrowGuardians project"
   ```

4. **Add remote repository:**
   ```bash
   git remote add origin https://github.com/Farwah-Mahnoor/GrowGuardians.git
   ```

5. **Push to GitHub:**
   ```bash
   git branch -M main
   git push -u origin main
   ```

## 📝 Daily Workflow

### 1. Check Current Status
```bash
git status
```

### 2. Add New or Modified Files
```bash
# Add specific files
git add filename.ext

# Add all changes
git add .

# Add all changes with a more controlled approach
git add -A
```

### 3. Commit Changes
```bash
# Commit with a descriptive message
git commit -m "Add feature: description of what you did"

# Examples:
git commit -m "Fix: Resolve camera upload issue on mobile devices"
git commit -m "Feat: Add Urdu translation for new diagnosis content"
git commit -m "Update: Improve model accuracy for brown spot detection"
```

### 4. Push to GitHub
```bash
# Push to main branch
git push origin main

# If you're working on a feature branch
git push origin branch-name
```

## 🌿 Branching Strategy

For larger features or experiments, use branches:

### Create a New Branch
```bash
# Create and switch to a new branch
git checkout -b feature/new-feature-name

# Or create branch and switch separately
git branch feature/new-feature-name
git checkout feature/new-feature-name
```

### Work on Branch
```bash
# Make changes to your code
# Add and commit as usual
git add .
git commit -m "Implement new feature functionality"
```

### Merge Branch to Main
```bash
# Switch back to main branch
git checkout main

# Pull latest changes
git pull origin main

# Merge your feature branch
git merge feature/new-feature-name

# Push to GitHub
git push origin main

# Delete the feature branch (optional)
git branch -d feature/new-feature-name
```

## 🔍 Viewing Changes

### See Commit History
```bash
# View commit history
git log

# View compact history
git log --oneline

# View last 5 commits
git log -5
```

### See What Changed
```bash
# See unstaged changes
git diff

# See staged changes (added but not committed)
git diff --staged

# Compare with last commit
git diff HEAD
```

## 🔁 Syncing with Remote

### Pull Latest Changes
```bash
# Get changes from GitHub
git pull origin main
```

### Handle Merge Conflicts
If you see conflicts after pulling:
1. Open conflicted files
2. Look for conflict markers: `<<<<<<<`, `=======`, `>>>>>>>`
3. Edit the file to resolve conflicts
4. Add and commit the resolved files:
   ```bash
   git add conflicted-file.ext
   git commit -m "Resolve merge conflicts"
   ```

## 🏷️ Tagging Releases

When you reach important milestones:
```bash
# Create a tag
git tag -a v1.0 -m "Version 1.0 - Initial Release"

# Push tags to GitHub
git push origin --tags
```

## 🧹 Cleaning Up

### Remove Untracked Files
```bash
# See what would be removed
git clean -n

# Remove untracked files
git clean -f

# Remove untracked files and directories
git clean -fd
```

### Undo Changes
```bash
# Undo unstaged changes to a file
git checkout -- filename.ext

# Undo staged changes
git reset HEAD filename.ext

# Undo last commit (but keep changes)
git reset --soft HEAD~1

# Completely remove last commit
git reset --hard HEAD~1
```

## 🔐 Authentication

GitHub now uses token-based authentication instead of passwords:

### Create Personal Access Token
1. Go to GitHub Settings → Developer Settings → Personal Access Tokens
2. Generate new token with appropriate permissions
3. Copy the token (you won't see it again)

### Use Token for Authentication
When prompted for password, enter your personal access token instead.

## 📦 Large File Handling

For large model files or datasets:
1. Consider using Git LFS (Large File Storage)
2. Or host large files separately and link to them

### Install Git LFS
```bash
git lfs install
```

### Track Large Files
```bash
# Track specific file types
git lfs track "*.pth"
git lfs track "*.h5"
git lfs track "*.zip"

# Add .gitattributes to track LFS settings
git add .gitattributes
```

## 🚨 Common Issues and Solutions

### Issue: "Permission denied" when pushing
**Solution:** Use HTTPS with personal access token or set up SSH keys

### Issue: "Merge conflicts"
**Solution:** Follow the conflict resolution steps above

### Issue: "Repository not found"
**Solution:** Check that the remote URL is correct:
```bash
git remote -v
# If incorrect, update it:
git remote set-url origin https://github.com/Farwah-Mahnoor/GrowGuardians.git
```

### Issue: "Updates were rejected"
**Solution:** Pull latest changes first:
```bash
git pull origin main
# Resolve any conflicts, then push
git push origin main
```

## 🎯 Best Practices

1. **Commit Often:** Small, focused commits are better than large ones
2. **Write Good Commit Messages:** Start with capital letter, be descriptive
3. **Pull Before Push:** Always pull latest changes before pushing
4. **Use Branches:** For experimental features or major changes
5. **Tag Releases:** Mark important milestones
6. **Keep .gitignore Updated:** Don't commit unnecessary files
7. **Review Changes:** Use `git diff` before committing

## 📊 Useful Commands Summary

| Action | Command |
|--------|---------|
| Check status | `git status` |
| Add files | `git add .` |
| Commit changes | `git commit -m "message"` |
| Push to GitHub | `git push origin main` |
| Pull changes | `git pull origin main` |
| View history | `git log --oneline` |
| Create branch | `git checkout -b branch-name` |
| Switch branch | `git checkout branch-name` |
| Merge branch | `git merge branch-name` |

## 🆘 Need Help?

### Get Help with Any Command
```bash
git help command-name
# Example:
git help commit
```

### View Git Configuration
```bash
git config --list
```

### Check Remote Repositories
```bash
git remote -v
```

Remember: Git is your friend! Don't be afraid to experiment in branches, and you can always undo changes if needed.