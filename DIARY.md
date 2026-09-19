# Development Diary

A reverse-chronological log of the decisions and reasoning behind this project, kept so reviewers can see the AI-assisted thought process rather than just the final diff. Entries are added via the `/diary` Claude Code skill (see `.claude/skills/diary/SKILL.md`).

---

## 2026-09-19 08:43 — Designed, but deliberately did not build, a POM-generator skill

**Decision:** Designed a two-stage tool for automatically generating Page Object Model classes from the live site, but chose not to implement it for this take-home.

The design: a plain deterministic script (no LLM involved) logs in, crawls same-origin links, and supplements that crawl with a seed list of URLs for flow-gated pages the crawler can't reach on its own (cart, checkout steps — pages that only exist after specific actions). For each page it visits, it dumps the accessibility tree to a slugged YAML file. Same input always produces the same output — no model judgment in this stage. A second, separate skill would then consume those YAML dumps and turn them into idiomatic POM classes: sensible naming, a component-object pattern for structures that repeat across pages (e.g. a cart-item row), and matching a new dump against existing POM files by page identity (URL/route) rather than by slug text, so re-running the crawl after a UI change updates the right class instead of creating a duplicate.

The validation I'd have written for the deterministic half: Vitest unit tests on the script's pure-logic helpers (slug encoding, link-exclusion rules, base-URL and relative-path resolution) at 100% coverage, plus a Stryker mutation testing run against that same file with a 100% kill threshold. The reasoning for going beyond line coverage: a silent bug in the scraper (e.g. a link-exclusion rule that's too broad, or a path-resolution edge case) doesn't fail loudly — it turns into a wrong or missing locator several steps downstream, in code a human may not think to double-check because "the generator wrote it." Coverage alone proves the lines ran, not that the tests would actually catch a mutated version of that logic; mutation testing is the check that closes that gap.

**Why:** The brief itself says this is "less about coverage, more about" structure, maintainability, and thought process, under a hard 2-3 hour time-box — and the ticket already scoped this session to 4 hand-written specs plus a POM, not tooling to generate POMs. Building the generator now would have eaten the entire time budget on infrastructure for a problem (4 pages, ~4 page objects) that doesn't yet justify automating. Recognizing that and stopping at the design is the same scope-control judgment call as the earlier decision not to run `npm init playwright@latest` — knowing when *not* to build something is being treated as a deliverable in its own right here, not as a corner cut.

**Alternatives considered:** Building a minimal version of just the crawler/dumper half without the generator skill — rejected because a crawler with no consumer produces YAML files nobody reads, which is effort spent with no payoff within this time-box.

**Next:** This stays out of scope for the submission itself, but goes in the README's ToDo section as future work, with this diary entry as the design record.

---

## 2026-09-19 08:35 — Scaffolded Playwright by hand instead of `npm init playwright@latest`

**Decision:** Set up the Playwright + TypeScript project manually — `npm install -D @playwright/test`, `npx playwright install chromium --with-deps`, then hand-wrote `playwright.config.ts` and a `tests/` layout with `pages/` and `fixtures/` folders for the upcoming Page Object Model — rather than running the official `npm init playwright@latest` scaffolding script.

**Why:** The init script is interactive and opinionated: it prompts for JS/TS, test folder naming, a GitHub Actions workflow, and generates its own `tsconfig.json`/`.gitignore`/example tests. This repo already had a `tsconfig.json`, ESLint, Prettier, and `.gitignore` from the earlier foundations work, and letting the wizard run would have meant it either overwrote that config or had to be reconciled with it afterwards. Doing it by hand kept full control over what got created and avoided fighting the wizard's defaults. One smoke spec (`tests/example.spec.ts`) was written to prove the config works end-to-end, instead of keeping the wizard's generated example tests.

**Alternatives considered:** Running the wizard and then diffing/cleaning up whatever it overwrote — rejected as more work and more risk than just writing the handful of config files directly.

**Next:** Build out the Page Object Model and the 4 planned specs (login, add-to-cart, checkout, cart management).

---

## 2026-09-19 08:33 — Foundations: ESLint enforcement + .nvmrc for reviewer friction

**Decision:** Before writing any test logic, laid the foundations for the codebase: ESLint (with typescript-eslint + Prettier) so the project has an enforced set of rules keeping it tidy, and `.nvmrc` pinning the exact Node version.

**Why:** A codebase needs some enforcement of its own rules to stay tidy over time — ESLint gives that, and as a side benefit it also gives Claude Code a consistent style contract to work within rather than improvising. `.nvmrc` is specifically for the reviewer: the goal is zero friction getting this repo running — with it, all they need is `nvm use` and the right Node version is guaranteed, no manual version-hunting or "works on my machine" issues.

**Next:** Scaffold the Playwright + TypeScript test project on top of these foundations.

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
