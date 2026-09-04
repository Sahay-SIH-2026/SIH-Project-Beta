# Contributing to SAHAY

Thank you for contributing to SAHAY. Please read this guide before opening a pull request.

---

## Getting Started

```bash
# 1. Clone the repository
git clone git@github.com:Sahay-SIH-2026/SIH-Project-Beta.git
cd SIH-Project-Beta

# 2. Install dependencies
npm install

# 3. Set up environment variables (no secrets required for Phase 1)
cp .env.example .env.local

# 4. Start the development server
npm run dev
```

---

## Branch Naming

Use a consistent prefix:

| Type       | Pattern              | Example                    |
|------------|----------------------|----------------------------|
| Feature    | `feature/<name>`     | `feature/counselor-alerts` |
| Bug fix    | `fix/<name>`         | `fix/nav-active-state`     |
| Docs       | `docs/<name>`        | `docs/update-readme`       |
| Refactor   | `refactor/<name>`    | `refactor/types-cleanup`   |

---

## Pull Requests

When opening a PR, please:

- **Keep changes focused.** One concern per PR.
- **Explain what changed and why** in the PR description.
- **Test affected functionality** before requesting review.
- **Run type checks and linting** — the PR should not introduce new errors:

  ```bash
  npx tsc --noEmit
  npx eslint .
  ```

- **Avoid unnecessary dependencies.** Discuss new packages in an issue first.
- **Keep secrets out of commits.** See the Privacy section below.

---

## Privacy & Sensitive Data

> **Use synthetic/demo data only during development and hackathon demonstrations.**

The following must **never** be committed to this repository:

- Real victim or survivor information of any kind
- Personally identifiable information (PII)
- Psychological, health, or welfare records
- Production database exports or dumps
- API keys or service credentials
- Passwords or authentication tokens
- `.env` files containing real secrets (`.env.local`, `.env.production`, etc.)

If you accidentally commit sensitive data, notify the maintainers immediately and follow GitHub's [guide to removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository).

---

## Product Safety

SAHAY is a support-tool for human counselors — not an autonomous system.

Contributors must **not** add functionality that turns SAHAY into:

- an autonomous counseling system
- a clinical diagnostic or mental-health assessment tool
- an automated emergency intervention system
- an AI replacement for human support workers or caseworkers

AI-assisted features must preserve **mandatory human review** at every decision point. Support signals are for prioritization only — never for diagnosis or autonomous action.

---

## Unimplemented Features

If a feature is planned but not yet built, use the `<ComingSoon />` component rather than adding placeholder buttons that appear functional.

---

## Questions

Open an issue with the `question` label or start a discussion on the repository.
