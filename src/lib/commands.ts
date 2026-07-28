export interface Command {
  cmd: string;
  desc: string;
}

export interface Section {
  id: string;
  title: string;
  icon: string;
  commands: Command[];
  notes?: string[];
}

export const sections: Section[] = [
  {
    id: 'remote',
    title: 'Remote',
    icon: 'globe',
    commands: [
      {
        cmd: 'git remote -v',
        desc: 'Check the URL used for the remote branch',
      },
      {
        cmd: 'git remote show',
        desc: 'Show info on push/pull automation and branch status',
      },
      {
        cmd: 'git remote set-url origin <URL>',
        desc: 'Set the URL for the remote branch',
      },
      {
        cmd: 'git remote update origin --prune',
        desc: 'Update local list and remove deleted remote branches',
      },
    ],
  },
  {
    id: 'push',
    title: 'Push',
    icon: 'upload',
    commands: [
      {
        cmd: 'git push -u origin <branch>',
        desc: 'Push to remote and set upstream',
      },
      {
        cmd: 'git push origin <branch>',
        desc: 'Create remote branch from current',
      },
      { cmd: 'git push -d origin <branch>', desc: 'Delete remote branch' },
    ],
  },
  {
    id: 'checkout',
    title: 'Checkout & Switch',
    icon: 'git-branch',
    commands: [
      {
        cmd: 'git checkout -b <name>',
        desc: 'Create new branch and switch to it',
      },
      { cmd: 'git checkout <name>', desc: 'Change branch' },
      { cmd: 'git switch <name>', desc: 'Modern way to change branches' },
      { cmd: 'git checkout <hash>', desc: 'Go to a specific commit' },
    ],
  },
  {
    id: 'log',
    title: 'Log & Diff',
    icon: 'history',
    commands: [
      { cmd: 'git log', desc: 'See local commits (q to exit)' },
      {
        cmd: 'git reflog',
        desc: 'Show recent commits, pulls, resets, and pushes',
      },
      {
        cmd: 'git diff HEAD',
        desc: 'See differences between staged and new changes',
      },
      { cmd: 'git diff <branch1>..<branch2>', desc: 'Compare two branches' },
    ],
  },
  {
    id: 'stash',
    title: 'Stash',
    icon: 'layers',
    commands: [
      {
        cmd: 'git stash',
        desc: 'Record current state and return to clean directory',
      },
      { cmd: 'git stash -u', desc: 'Stash files including untracked changes' },
      { cmd: 'git stash list', desc: 'List all stashed modifications' },
      {
        cmd: 'git stash apply <index>',
        desc: 'Restore a specific stash (e.g., index 1)',
      },
      { cmd: 'git stash drop <index>', desc: 'Remove a specific stash' },
      {
        cmd: 'git stash push -u -m "your message here"',
        desc: 'Stash all changes with a message',
      },
    ],
  },
  {
    id: 'worktree',
    title: 'Worktree',
    icon: 'layout',
    notes: [
      'The -C flag tells Git to run the command from a specific repository directory instead of your current folder.',
    ],
    commands: [
      {
        cmd: 'git -C E:\\Repositories\\<name-of-app> fetch origin develop',
        desc: 'Fetch the latest develop branch from the remote before creating a feature worktree',
      },
      {
        cmd: 'git -C E:\\Repositories\\<name-of-app> worktree add E:\\Repositories\\<name-of-app>\\feature\\<name-of-feature> -b feature/<name-of-feature> origin/develop',
        desc: 'Create a new worktree and branch from the develop branch',
      },
      {
        cmd: 'git -C E:\\Repositories\\<name-of-app>\\feature\\<name-of-feature> push -u origin feature/<name-of-feature>',
        desc: 'Push the new feature branch and set upstream tracking',
      },
      {
        cmd: 'git -C E:\\Repositories\\<name-of-app> worktree list',
        desc: 'Verify all active worktrees linked to the repository',
      },
      {
        cmd: 'git worktree add <path> <branch>',
        desc: 'Create a new directory and checkout a branch',
      },
      {
        cmd: 'git worktree remove <path>',
        desc: 'Safely remove a worktree directory',
      },
      {
        cmd: 'git worktree prune',
        desc: 'Clean up stale worktree information',
      },
      {
        cmd: 'git worktree lock / unlock',
        desc: 'Prevent/allow worktree from being pruned',
      },
    ],
  },
  {
    id: 'reset',
    title: 'Cleaning & Resetting',
    icon: 'rotate-ccw',
    commands: [
      {
        cmd: 'git commit --amend',
        desc: 'Add forgotten changes to the last commit',
      },
      {
        cmd: 'git reset --soft HEAD~1',
        desc: 'Undo last commit, but keep your changes',
      },
      {
        cmd: 'git reset --hard HEAD~1',
        desc: 'Undo last commit and discard all changes',
      },
      { cmd: 'git clean -df', desc: 'Remove untracked files and directories' },
      {
        cmd: 'git revert <hash>',
        desc: 'Undo a specific old commit with a new commit',
      },
    ],
  },
  {
    id: 'rebase',
    title: 'Rebase',
    icon: 'git-merge',
    commands: [
      {
        cmd: 'git checkout <branch>',
        desc: 'Step 1: Switch to the branch to rebase',
      },
      {
        cmd: 'git rebase -i HEAD~3',
        desc: 'Step 2: Open interactive rebase (opens VIM)',
      },
      {
        cmd: 'git push origin <branch> --force',
        desc: 'Step 4: Force push after rebase',
      },
    ],
    notes: [
      'In VIM: change pick to drop (delete commit) or squash (combine commits)',
    ],
  },
  {
    id: 'recover',
    title: 'Recovering Lost Work',
    icon: 'shield',
    commands: [
      {
        cmd: 'git fsck --lost-found',
        desc: 'Find lost staged changes (checks .git/lost-found/)',
      },
      {
        cmd: 'git reflog',
        desc: 'Find the SHA1 after an accidental hard reset',
      },
      {
        cmd: 'git reset --hard <sha1>',
        desc: 'Restore to a specific commit found via reflog',
      },
    ],
  },
];
