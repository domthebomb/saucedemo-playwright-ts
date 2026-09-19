# Development Diary

A reverse-chronological log of the decisions and reasoning behind this project, kept so reviewers can see the AI-assisted thought process rather than just the final diff. Entries are added via the `/diary` Claude Code skill (see `.claude/skills/diary/SKILL.md`).

---

## 2026-09-19 10:29 — Reversing the single-PR decision: stacked PRs instead

**Decision:** The 09:42 entry below explicitly decided one PR was the right size for the critical-path tests and that stacking would be "process for its own sake" here. Reversing that now: split the accumulated work into a 3-layer stack instead — `fix/product-list-locator-scoping` → `chore/eslint-playwright-hardening` → `feature/critical-path-tests` — using GitHub's native stacked-PR feature (public preview since 2026-07-30) via the `gh-stack` CLI extension, rather than one PR.

**Why:** The original call wasn't wrong given what was known at the time — it assumed the branch would contain roughly what the ticket described. What actually happened is that *writing* the tests surfaced a real locator-scoping bug (via an independent Opus review) and a genuine lint gap, neither of which existed as known scope when that decision was made. That's a sharper version of an old problem: AI-assisted sessions can generate a lot of surface area very quickly, so a scope decision made once up front doesn't hold — it has to be revisited as new information actually appears, or a single PR quietly balloons into three unrelated concerns (a bugfix, a tooling change, and the actual deliverable) bundled as one diff, which is exactly the kind of PR that's hard to review well regardless of its line count. Splitting them means a reviewer can evaluate "is the bug fix correct," "is the tooling change reasonable," and "are these the right tests" as three separate, smaller questions instead of one entangled one.

The GitHub Copilot review plan from the 09:42 entry still stands — requesting it on the stack's PRs once opened, for the same reason as before: an independent model reviewing code this session wrote is worth more than this session reviewing itself.

**Next:** Run `gh stack submit` to push all three branches and open the linked PRs, then request Copilot review.

---

## 2026-09-19 10:28 — Hardened lint/config as its own change, separate from the bugfix

**Decision:** Split the tooling hardening (ESLint's `recommendedTypeChecked` + `eslint-plugin-playwright`, `playwright.config.ts` trace/reporter tweaks) into its own change on top of the locator-scoping fix, rather than bundling it into that same commit/PR.

**Why:** The two are related but not the same decision: the bugfix addresses one specific bug; the lint upgrade addresses the *class* of bug — specifically enabling `@typescript-eslint/no-floating-promises`, which is the rule that would have flagged a missing `await` on an `expect()` call, the exact failure mode that let the locator bug's specs pass for the wrong reason. Reviewing them separately means a reviewer can evaluate "is this fix correct" independently from "is this tooling change reasonable," instead of one diff doing both jobs.

**Next:** Layer the actual new test specs on top of this — the deliverable, now sitting on a verified-correct, better-linted foundation.

---

## 2026-09-19 10:26 — Independent Opus review found a real locator-scoping bug

**Decision:** Requested a fresh Opus-model agent, deliberately with no context from this session, to review the POM and specs cold against the assignment brief before committing them. It found a genuine correctness bug, not just style feedback: `data-test="inventory-item"` is reused by Sauce Demo across the inventory grid, the cart rows, and the checkout order summary, and every page object queried it from the bare page rather than a scoped container — so `CartPage.items` and `InventoryPage.items` were, structurally, the same locator. Verified this myself rather than taking the report on faith: 8/8 runs of "click cart link → wait for cart URL → query the locator `CartPage.items` used" returned the 6 inventory cards, not the 2 cart rows, because the site is a client-routed SPA where the URL updates before React re-renders. Existing specs passed anyway only because retrying `expect()` calls waited out the race; `cart-management.spec.ts`'s item-removal calls had no such gate and could silently act on the wrong page.

Fixed by extracting a `ProductList` component rooted at each page's own container, which also collapsed three copies of near-identical item-lookup logic into one — the review separately flagged that duplication as undercutting the "promote reuse" rationale already documented for the Header/BurgerMenu split. Also trimmed a real pile of dead POM surface the review found: several page-object methods and two fixture users with zero call sites anywhere in the specs.

**Why:** The review was deliberately a fresh agent with no session context, not a fork of this conversation — the reasoning is the same as requesting a GitHub Copilot review: the same model reviewing its own output shares its own blind spots, so an independent pass is only worth something if it's actually independent.

**Next:** Harden lint/type-check config so this class of bug is caught automatically next time, as its own change — logged separately below.

---

## 2026-09-19 09:31 — Credential management: fine as hardcoded here, would use 1Password CLI in an enterprise framework

**Decision:** A separate note from the test-strategy entry above, since it's a distinct decision rather than part of choosing which 4 tests to write.

For this take-home, the Sauce Demo test credentials (`standard_user` / `secret_sauce`, etc.) are published in plain text on the login page itself — they aren't secrets. Hardcoding them directly in `tests/fixtures/users.ts` is correct as-is; introducing `.env` files or a secrets manager to protect already-public demo credentials would be overengineering for this specific repo.

Worth recording anyway how this would differ in a real enterprise framework, since real environments carry actual sensitive credentials: the pattern to avoid is every developer hand-maintaining their own `.env` file, which rots in predictable ways — someone's goes stale, someone commits one by accident, someone leaves the team and their copy is still floating around on a laptop.

The fix would be 1Password CLI (`op`). The repo would hold only a `.env` template of `op://vault/item/field` references, never real values, so there's nothing sensitive to accidentally commit. Locally, developers run tests via `op run -- npm test`, which resolves those references to real secret values as environment variables for that process only — nobody creates or maintains their own `.env`. In CI, a scoped 1Password Service Account would replace long-lived repo/org secrets, centrally rotatable and revocable in one place instead of duplicated across every pipeline that needs them. Net effect: no secrets at rest in the repo or scattered across CI secret stores, one source of truth.

**Why:** Matching the security response to the actual risk — these credentials carry zero risk since Sauce Demo publishes them itself, so protecting them would be theater, not security. The value here is demonstrating the enterprise-grade pattern is understood, not applying it where it isn't needed.

**Next:** Goes in the README's ToDo section as a production-readiness consideration, not as something to implement here.

---

## 2026-09-19 09:31 — Risk-based test selection for a B2C app, reviewed against the live site

**Decision:** ~1 hour into the time-box, now thinking carefully about which tests actually matter — deliberately delayed until after scaffolding, since strategy needs something to build on rather than being an oversight. Framed the AUT as what it actually is — a B2C e-commerce site — because that's what should drive "critical" vs merely useful, not exhaustive feature coverage. Before finalizing, reviewed the live site rather than relying on assumptions, which sharpened the plan in a few places. Landed on:

- **Login, success path**: if this doesn't work, nothing else in the app matters, so it's the first gate.
- **Login, failure path — as two distinct cases, not one**: the site returns different error messages for different failure reasons (`"Username and password do not match any user in this service"` for bad credentials vs `"Sorry, this user has been locked out."` for `locked_out_user`), meaning these exercise different logic — credential matching vs. an account-status check. Testing only one would let a regression in the other slip through. This matters because it's a public B2C app: an auth defect is a reputational and security risk, not just a UX bug, and since revenue is the core driver here, both directions are critical.
- **One end-to-end purchase journey** (login → add two items to cart → checkout), using Playwright's `test.step()` to break it into named steps for failure localization in the report/trace viewer — getting the BDD benefit of "which step broke" natively, without adopting BDD tooling for a take-home. The highest-value assertion in this test isn't "did checkout complete" but the price math: confirmed a single $29.99 item produces tax $2.40 (an 8% rate) and total $32.39, so the test will assert the exact computed total for the two-item cart rather than just the confirmation banner. A silently wrong subtotal/tax/total is a direct revenue-integrity bug on a commerce site.
- **Cart management** (remove an item, confirm price/count updates correctly) as the fourth test — the same "money must be correct" risk as the checkout math, just on the subtraction side. This gives the suite a consistent theme: login gates access, and two tests independently verify the app never gets a customer's cart total wrong.

Also noted the site actually has 6 test users (`standard_user`, `locked_out_user`, `problem_user`, `performance_glitch_user`, `error_user`, `visual_user`) — the last three are classic intentionally-broken accounts (broken images/sort, broken cart behavior, visual glitches), good bug-hunting/visual-regression material but not core-critical by this bar, same treatment as the decision not to test sorting. Both go in the README ToDo as future work.

**Why:** Considered decomposing the E2E journey into separate BDD-style scenarios (login / add-to-cart / checkout as discrete steps) — real merit, since a narrow failing scenario localizes a defect faster than a failure buried inside one long E2E test. Rejected the BDD framework for this take-home in favor of `test.step()`, which gets the same localization benefit for free.

Also considered snapshot/visual regression testing (Playwright's `toHaveScreenshot()`) as an assertion strategy — confirmed this was already ruled out of scope in the original ticket alongside CI/cross-browser/a11y, and revisiting it holds up: baseline images are brittle across OS/font-rendering and CI vs. local, so they're an ongoing maintenance cost, not a one-time setup, and don't fit a 2-3 hour window. It's the natural tool for the `problem_user`/`visual_user` follow-up already in the ToDo, since those accounts exist specifically to introduce visual bugs — so it's parked in the same bucket rather than treated as a separate new idea.

**Next:** Implement the 4 specs: login (success + two failure modes), the 2-item E2E purchase journey with exact price assertions, and cart management.

---

## 2026-09-19 09:09 — POM design is the "clean, maintainable, reusable" requirement, made concrete

**Decision:** Calling out explicitly that the POM work isn't just structure for its own sake — it's a direct answer to the assignment's "Clean, maintainable, and reusable code" expectation. The BasePage/AuthenticatedPage hierarchy exists to promote reuse and keep locators/logic out of individual tests: if something on the site changes, the fix happens once in the relevant page object, and every spec that uses it benefits automatically instead of the same fix needing to be repeated across tests. While reviewing the site I also noticed a component shared across every authenticated page (the header: burger menu + cart), so that got extracted into its own `Header` component (wrapping the burger menu and the cart link/badge together) rather than duplicated per page or modelled inconsistently with the rest of the header.

This also connects back to the POM-generator/"healer" skill designed (but deliberately not built) earlier — see the "Designed, but deliberately did not build, a POM-generator skill" entry further down. That skill is where ongoing maintenance of this POM would eventually live: it could run as a GitHub Actions workflow step in CI, triggered on a schedule or on site changes, invoking Claude plus the deterministic crawler to detect drift between the live site and the existing POM and self-heal the affected locators/tests, rather than a human having to notice a broken selector and chase it down by hand.

**Why:** The brief weights "expectations" (structure, maintainability, thought process) over raw test coverage, so it's worth being explicit that the architecture choices here are the deliverable, not just scaffolding around it. The CI-healer framing also gives a concrete "next step" for the ToDo section that ties the two design decisions (POM structure now, POM-generator skill later) into one coherent story rather than two disconnected ideas.

**Next:** Carry the CI self-healing idea into the README's ToDo section alongside the POM-generator design.

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
