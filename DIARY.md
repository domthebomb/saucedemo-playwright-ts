# Development Diary

A reverse-chronological log of the decisions and reasoning behind this project, kept so reviewers can see the AI-assisted thought process rather than just the final diff. Entries are added via the `/diary` Claude Code skill (see `.claude/skills/diary/SKILL.md`).

---

## 2026-09-19 08:18 — Scope ticket: Sauce Demo login + 3 critical flows, Playwright + TS

**Decision:** Read the full assignment brief and had it written up as a ticket, so scope is fixed before code starts:

> **Ticket: Sauce Demo E2E automation (Playwright + TypeScript)**
> Automate the login flow plus the 3 other scenarios most critical to this app, against https://www.saucedemo.com/, in a public GitHub repo with a README covering setup, run instructions, a ToDo list, and AI-usage notes.
>
> **Acceptance criteria:**
> - [ ] Project scaffolded with Playwright Test + TypeScript; `npx playwright test` runs clean.
> - [ ] Page Object Model for Login, Inventory, Cart, and Checkout pages — no raw selectors in spec files.
> - [ ] Login spec: successful login (`standard_user`), invalid-credentials error, `locked_out_user` error.
> - [ ] Add-to-cart spec: adding item(s) updates the cart badge count and the inventory page's own "Remove" state.
> - [ ] End-to-end checkout spec: login → add item → checkout → fill customer info → complete order → assert the "Thank you for your order!" confirmation.
> - [ ] Cart management spec: removing an item updates the cart badge and item list correctly.
> - [ ] Every spec uses specific, meaningful assertions (exact text/state), not just "element is visible."
> - [ ] README.md: setup, how to run tests, ToDo (what I'd automate/improve with more time), and an explanation of AI usage + any skills/agents used.
> - [ ] Pushed to a public GitHub repo with a shareable link.
> - [ ] Explicitly out of scope for this time-box (goes in the ToDo instead): CI pipeline, cross-browser matrix, visual regression, a11y testing, parallel sharding, data-driven/multi-user login matrix beyond the 3 cases above.

**Why:** Framework choice is Playwright over Cypress — first-class TypeScript support out of the box, auto-waiting, and a built-in assertion/test-runner story mean less boilerplate for a from-scratch project under a hard time-box. The brief itself says this is "less about coverage, more about expectations" (structure, maintainability, thought process), so the acceptance criteria are deliberately scoped to 4 specs + POM + docs, not exhaustive coverage — anything beyond that is explicitly parked in the README ToDo rather than attempted now.

**Alternatives considered:** Cypress — also viable and arguably has a gentler DX for pure UI flows, but Playwright's native TS templates and multi-tab/network-friendly API made it the better fit here.

**Next:** Scaffold the Playwright + TypeScript project (`npm init playwright@latest`) and build out the Page Object Model.

---

## 2026-09-19 08:14 — Starting the clock, scoping as a first-class constraint

**Decision:** Logging 8:00 as the start time. The assignment explicitly states this "should not take more than 2-3 hours" — treating adherence to that time-box as part of what's being evaluated, not just the code. First commit (~8:06) was the bare TypeScript project init (git + npm + tsc). At 8:11, wrote a `/diary` skill so decisions and trade-offs made during the session are visible to a reviewer, not just the final diff.

**Why:** For a scoped take-home, disciplined scoping and transparent reasoning are as much the deliverable as the code itself.

**Next:** Define what's actually in scope for the 2-3 hour window before writing more code.
