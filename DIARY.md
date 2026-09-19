# Development Diary

A reverse-chronological log of the decisions and reasoning behind this project, kept so reviewers can see the AI-assisted thought process rather than just the final diff. Entries are added via the `/diary` Claude Code skill (see `.claude/skills/diary/SKILL.md`).

---

## 2026-09-19 08:14 — Starting the clock, scoping as a first-class constraint

**Decision:** Logging 8:00 as the start time. The assignment explicitly states this "should not take more than 2-3 hours" — treating adherence to that time-box as part of what's being evaluated, not just the code. First commit (~8:06) was the bare TypeScript project init (git + npm + tsc). At 8:11, wrote a `/diary` skill so decisions and trade-offs made during the session are visible to a reviewer, not just the final diff.

**Why:** For a scoped take-home, disciplined scoping and transparent reasoning are as much the deliverable as the code itself.

**Next:** Define what's actually in scope for the 2-3 hour window before writing more code.
