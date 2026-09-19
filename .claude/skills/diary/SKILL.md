---
name: diary
description: Append a timestamped, reviewer-facing diary entry to DIARY.md documenting a decision, piece of reasoning, or milestone reached in this session — used so reviewers can see the AI-assisted thought process behind this take-home project.
---

# Dev Diary skill

Use this skill to record a short, reviewer-facing log entry in `DIARY.md` at the repo root. The diary exists so a human reviewer can trace *why* decisions were made during this AI-assisted build, not just see the final code.

## When invoked

1. Determine the entry's subject:
   - If the user passed argument text (e.g. `/diary chose Playwright over Cypress`), use that as the seed for the entry.
   - If no argument was given, infer the subject from the most recent significant decision, trade-off, or milestone in the current conversation — not from trivial/mechanical steps (e.g. don't log "created a file" or "ran npm install" on its own).
2. Get the real current timestamp by running `date "+%Y-%m-%d %H:%M"` in the shell — never guess or reuse a stale date.
3. Compose a concise entry (roughly 3-6 lines, not a wall of text):
   - `## <timestamp> — <short title>`
   - **Decision:** what was decided/done, one line.
   - **Why:** the reasoning or trade-off behind it, one to two lines.
   - **Alternatives considered:** (omit this line entirely if there weren't any worth mentioning)
   - **Next:** what naturally follows, only if there's something concrete to say (omit otherwise).
4. If `DIARY.md` doesn't exist yet, create it with the standard header below before adding the first entry.
5. Insert the new entry directly below the header, above all existing entries (reverse-chronological — newest first), separated by `---`.
6. Keep entries honest and specific — write as if a reviewer will read every one to judge the thought process, not as marketing copy. Skip entries for purely mechanical actions with no real decision behind them.

## Standard header (only when creating DIARY.md for the first time)

```
# Development Diary

A reverse-chronological log of the decisions and reasoning behind this project, kept so reviewers can see the AI-assisted thought process rather than just the final diff. Entries are added via the `/diary` Claude Code skill (see `.claude/skills/diary/SKILL.md`).

---
```

## Style rules

- Never fabricate a decision that wasn't actually discussed or made — the diary must reflect what really happened in the session.
- One entry per invocation. Don't batch multiple unrelated decisions into a single entry.
- Do not edit or delete past entries; the diary is append-only (fixing a typo in your own most-recent entry is fine).
