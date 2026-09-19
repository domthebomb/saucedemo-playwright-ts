Guidance for Claude Code when working in this repository.

## Git workflow

This repo doesn't have paid GitHub branch protection enabled, so `master` isn't actually locked at the platform level — this rule is the substitute enforcement mechanism. If branch protection becomes available, enable it and this rule becomes a backstop rather than the only guard.

Never commit or push directly to `master`. For any piece of work:

1. Create a new branch off `master` (e.g. `git checkout -b <short-descriptive-name>`).
2. Commit the work on that branch.
3. Push the branch to origin and open a PR against `master` via `gh pr create`.

Ask the user before adding a GitHub Copilot review to the PR — this is a take-home, so not every PR should necessarily get one. Do not add Copilot as a reviewer by default. If the user says yes, run: `gh pr edit <PR#> --add-reviewer "@copilot"`

Note: `--add-reviewer copilot-pull-request-reviewer[bot]` (the bot's literal login) and the equivalent raw REST `POST .../requested_reviewers` call both return success but silently add nobody — `@copilot` is the only value `gh` actually resolves. Also, checking `gh pr view --json reviewRequests` or `GET .../requested_reviewers` afterwards will show it as empty even when the request worked, because that REST field doesn't surface bot reviewers. To actually verify, query GraphQL instead:

```bash
gh api graphql -f query='{ repository(owner:"<owner>", name:"<repo>") { pullRequest(number: <PR#>) { reviewRequests(first: 10) { nodes { requestedReviewer { __typename ... on Bot { login } } } } reviews(first: 10) { nodes { author { login } state } } } } }'
```

If Copilot still isn't added after using `@copilot`, then tell the user rather than silently skipping this step.

To wait for the review itself (initial or a re-request after replying to comments), poll the review count in the background rather than matching on a timestamp substring (fragile — a substring like the current hour:minute can coincidentally match an old review too) or foreground-sleeping in long chained calls. Capture the current `reviews(first: 100) { totalCount }` as a baseline before requesting, then background-poll with `run_in_background` until the count exceeds it:

```bash
until [ "$(gh api graphql -f query='{ repository(owner:"<owner>", name:"<repo>") { pullRequest(number: <PR#>) { reviews(first: 100) { totalCount } } } }' --jq '.data.repository.pullRequest.reviews.totalCount')" -gt <baseline> ]; do sleep 8; done
```

Do not merge the PR — leave it open for the user to review and merge.

This applies to real work in this repo (features, fixes, refactors). It does not apply to editing `DIARY.md` via the `/diary` skill — diary entries are just file edits, not a PR-worthy change on their own, so committing them directly to `master` is fine.
