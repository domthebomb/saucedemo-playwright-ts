# Sauce Demo E2E Tests

End-to-end tests for [saucedemo.com](https://www.saucedemo.com/), written in TypeScript with [Playwright](https://playwright.dev/).

## Setup

1. Use the pinned Node version (matches `.nvmrc`):
   ```bash
   nvm use
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Install the Chromium browser binary Playwright needs:
   ```bash
   npx playwright install chromium
   ```

## Running the tests

```bash
npm test              # run the full suite headless
npm run test:headed   # run with a visible browser
npm run test:ui       # Playwright's interactive UI mode
npm run report        # open the HTML report from the last run
```

Code quality checks:

```bash
npm run typecheck     # tsc --noEmit
npm run lint          # eslint .
npm run format        # prettier --write .
```

## What's covered

Four critical-path areas, chosen by treating this as what it is — a B2C e-commerce app, where the highest-risk failures are "can't log in" and "gets a customer's money wrong," not exhaustive feature coverage. The full reasoning for this selection (and what was deliberately left out) is in [`DIARY.md`](./DIARY.md).

- **Login** (`tests/login.spec.ts`) — successful login, invalid credentials, and a locked-out account as two distinct failure cases (different error messages, different underlying checks), plus logging out.
- **Purchase journey** (`tests/purchase-journey.spec.ts`) — a single end-to-end flow (login → add two items → checkout → confirmation), asserting the exact price math (subtotal/tax/total), not just that checkout completed. Uses `test.step()` for per-step failure localization and attaches screenshots/a price breakdown to the report as evidence.
- **Cart management** (`tests/cart-management.spec.ts`) — removing one item updates the badge/list correctly; removing every item clears the badge.

## Project structure

```
tests/
  pages/        Page Object Model — one class per screen
  components/   Reusable pieces shared across pages (Header, BurgerMenu, ProductList)
  fixtures/     Test data (users, products, customer, messages) and the custom
                 Playwright test fixtures that inject ready-to-use page objects
  *.spec.ts     The actual test specs
```

`BasePage` → `AuthenticatedPage` is the only inheritance in the POM: `AuthenticatedPage` centralises the header (burger menu + cart) that every logged-in page renders identically, so each concrete page object only describes what's unique to it. `ProductList` is a small component (not a page) because the same "list of product cards" markup is reused across the inventory grid, the cart, and the checkout summary — and, on Sauce Demo, all three are tagged with the same `data-test` value, so a locator built for one must stay scoped to its own container rather than querying the page globally.

## To Do

Given more time, in roughly this order:

- **CI**: a GitHub Actions workflow running the suite on every PR — deliberately out of scope for this time-box.
- **Cross-browser matrix**: currently Chromium only; Firefox/WebKit projects are a one-line addition to `playwright.config.ts`.
- **Visual regression**: `toHaveScreenshot()` baselines, specifically for the `problem_user`/`visual_user` accounts Sauce Demo ships for exactly this purpose (intentionally broken images/layout). Considered and deliberately deferred — baseline images are an ongoing maintenance cost (OS/font-rendering drift), not a one-time setup, so they don't fit a 2-3 hour window.
- **Accessibility testing**: `@axe-core/playwright` against the key pages.
- **A POM-generator/"healer" skill**: designed but not built (see `DIARY.md`) — a deterministic crawler that logs in, visits every page (plus a seed list for flow-gated pages like cart/checkout), and dumps each page's accessibility tree; a separate skill would turn those dumps into idiomatic POM classes, matched to existing ones by page identity rather than regenerated wholesale. Envisioned as a CI step that keeps the POM in sync with the live site automatically. The validation approach for the deterministic half was also designed: Vitest unit tests on its pure-logic helpers at 100% coverage, plus a Stryker mutation-testing run at a 100% kill threshold, since a silent scraper bug becomes a wrong locator several steps downstream.
- **Credential management for a real environment**: Sauce Demo's test credentials are published in plaintext on the login page itself, so hardcoding them in `tests/fixtures/users.ts` is correct here. In an environment with real credentials, the equivalent would be 1Password CLI (`op run`) with `op://` references in a committed template — no per-developer `.env` files, no secrets at rest in the repo.
- **A broader login matrix**: data-driven coverage of the remaining seeded accounts (`problem_user`, `performance_glitch_user`, `error_user`) as their own bug-hunting/regression specs, once there's a specific behaviour of theirs worth locking down.

## AI usage

This project was built with [Claude Code](https://claude.com/claude-code) (Claude Sonnet 5) as an active collaborator throughout — planning and reviewing, not just generating code. Specifically:

- **A custom `/diary` skill** (`.claude/skills/diary/SKILL.md`) was written for this project to keep a reviewer-facing decision log. [`DIARY.md`](./DIARY.md) is the result: a timestamped, append-only record of the actual reasoning behind scope decisions, test selection, trade-offs considered and rejected, and mistakes found and fixed — not a marketing summary written after the fact.
- Before writing any locators, Claude drove the live site directly (via Playwright, outside the test suite) to verify actual `data-test` attributes and behaviour rather than assuming them, which caught several things that would otherwise have been guessed wrong (e.g. the burger menu's toggle buttons being decorative `<img>` overlays over the real accessible controls).
- After the initial implementation, a **fresh Claude Opus agent with no session context** was deliberately spun up to independently review the code against this assignment brief — specifically to avoid the same model reviewing its own output and sharing its own blind spots. It found a genuine correctness bug (a locator scoped to the wrong page's DOM under certain conditions), which was verified independently and then fixed. See `DIARY.md` for the full account.

The full decision trail — including things designed but deliberately not built, and why — is in `DIARY.md`, which is intended to be read alongside this README.
