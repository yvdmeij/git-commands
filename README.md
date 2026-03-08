---
title: Git Commands
---

# Git Commands

| Command | Description |
| :--- | :--- |
| `git init .` | Make folder a local git repo |
| `git status` | See all changes, staged and unstaged |
| `git add -A` | Stage all changes |
| `git commit -m 'MSG'` | Commit to local git |
| `git restore .` | Restore all files |
| `git reset <file>` | Unstage a specific file |

### Remote
| Command | Description |
| :--- | :--- |
| `git remote -v` | Check the URL used for the remote branch |
| `git remote show` | Show info on push/pull automation and branch status |
| `git remote set-url origin <URL>` | Set the URL for the remote branch |
| `git remote update origin --prune` | Update local list and remove deleted remote branches |

### Push
| Command | Description |
| :--- | :--- |
| `git push -u origin <branch>` | Push to remote and set upstream |
| `git push origin <branch>` | Create remote branch from current |
| `git push -d origin <branch>` | Delete remote branch |

### Checkout & Switch
| Command | Description |
| :--- | :--- |
| `git checkout -b <name>` | Create new branch and switch to it |
| `git checkout <name>` | Change branch |
| `git switch <name>` | Modern way to change branches |
| `git checkout <hash>` | Go to a specific commit |

### Log & Diff
| Command | Description |
| :--- | :--- |
| `git log` | See local commits (`q` to exit) |
| `git reflog` | Show recent commits, pulls, resets, and pushes |
| `git diff HEAD` | See differences between staged and new changes |
| `git diff <branch1>..<branch2>` | Compare two branches |

### Stash
| Command | Description |
| :--- | :--- |
| `git stash` | Record current state and return to clean directory |
| `git stash -u` | Stash files including untracked changes |
| `git stash list` | List all stashed modifications |
| `git stash apply <index>` | Restore a specific stash (e.g., index 1) |
| `git stash drop <index>` | Remove a specific stash |

### Cleaning & Resetting
| Command | Description |
| :--- | :--- |
| `git commit --amend` | Add forgotten changes to the last commit |
| `git reset --soft HEAD~1` | Undo last commit, but **keep** your changes |
| `git reset --hard HEAD~1` | Undo last commit and **discard** all changes |
| `git clean -df` | Remove untracked files and directories |
| `git revert <hash>` | Undo a specific old commit with a new commit |

### Rebase Example
1. `git checkout <branch>`
2. `git rebase -i HEAD~3` (Opens VIM)
3. Change `pick` to `drop` (to delete) or `squash` (to combine).
4. `git push origin <branch> --force`

---

#### Recovering Lost Work
* **Lost staged changes:** `git fsck --lost-found` (Checks `.git/lost-found/`)
* **Undo a hard reset:** `git reflog` to find the SHA1, then `git reset --hard <sha1>`.
