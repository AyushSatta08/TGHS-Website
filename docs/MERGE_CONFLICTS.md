# Merge conflict practice

## Trigger and resolve a conflict

Use a disposable clone or test repository so the exercise does not disturb the project branch.

1. Create a shared text file on `main` and commit it.
2. Create two branches from that commit. Change the same lines in the file differently on each branch and commit both changes.
3. Merge the first branch into `main`, then merge the second. Git pauses and marks the overlapping hunk with `<<<<<<<`, `=======`, and `>>>>>>>`.
4. Read both changes and their context. Edit the file to preserve the intended behavior from both branches (or choose one deliberately), remove every marker, inspect the full result, then stage and commit the resolution.
5. Run the relevant checks and review the final diff before sharing the branch.

## Choosing a strategy

- **Merge** records both branch histories and creates a merge commit when needed. Prefer it for shared branches and collaborative integration where preserving the exact history matters.
- **Rebase** replays commits onto a new base for a linear history. Use it for private feature branches before sharing. Avoid rebasing commits others already depend on because it changes commit IDs.
- **Resolve by intent, not by marker order.** Understand what each side was trying to accomplish; simply choosing “ours” or “theirs” can silently discard required behavior.
- **Reduce conflicts early.** Keep changes focused, sync frequently, agree on ownership of shared files, and communicate before changing common interfaces.
- **Verify after resolving.** Search for leftover markers, inspect the combined diff, and run the project checks that cover the changed behavior.

## Practice log

This repository began as a clean, single-commit starter and did not contain two competing edits to resolve. The steps above are the safe repeatable exercise; record the test-repository URL and the specific resolution once the exercise is performed. No test repository was created as part of this website scaffold.
