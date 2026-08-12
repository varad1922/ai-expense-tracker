# Contributing to Nexus Expense AI

This guide covers the git workflow, branching strategy, commit conventions, and PR process for this project.

---

## Table of Contents
1. [Branching Strategy](#branching-strategy)
2. [Commit Message Conventions](#commit-message-conventions)
3. [Pull Request Process](#pull-request-process)
4. [Environment Setup](#environment-setup)
5. [Running Locally](#running-locally)

---

## Branching Strategy

We follow a simplified **GitHub Flow**:

```
main
 └── feature/<short-description>
 └── fix/<short-description>
 └── chore/<short-description>
 └── docs/<short-description>
```

| Branch prefix | When to use |
|---|---|
| `feature/` | New features or enhancements |
| `fix/` | Bug fixes |
| `chore/` | Dependency bumps, tooling, CI config |
| `docs/` | Documentation-only changes |

**Rules:**
- `main` is always deployable. Never push directly to `main`.
- Create a new branch from `main` for every piece of work.
- Keep branches short-lived — open a PR as soon as you have a working draft.
- Delete branches after they are merged.

**Example:**
```bash
git checkout main
git pull origin main
git checkout -b feature/add-csv-export
# ... do your work ...
git push -u origin feature/add-csv-export
# then open a PR on GitHub
```

---

## Commit Message Conventions

We follow the **Conventional Commits** specification: `https://www.conventionalcommits.org`

Format:
```
<type>(<scope>): <short description>

[optional body]

[optional footer(s)]
```

**Types:**

| Type | Meaning |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only |
| `style` | Formatting, missing semicolons, etc. (no logic change) |
| `refactor` | Code restructuring without feature or bug change |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `chore` | Build tooling, dependency updates, CI |
| `revert` | Reverts a previous commit |

**Scopes** (optional, use the area of the codebase):
`auth`, `expenses`, `ai`, `ui`, `db`, `api`, `socket`, `analytics`

**Examples:**
```
feat(expenses): add CSV export to Analytics page
fix(auth): remove insecure JWT_SECRET fallback
chore(deps): bump @google/genai to 2.17.0
docs: add CONTRIBUTING guide and PR template
refactor(ai): extract structured output schema to separate module
perf(db): add compound index on userId + date in Expense schema
```

**Rules:**
- Use the imperative mood in the subject: "add feature" not "added feature".
- Subject line must be 72 characters or fewer.
- If the commit introduces a breaking change, append `!` after the type and add a `BREAKING CHANGE:` footer.

---

## Pull Request Process

1. **Open a draft PR early** — this signals work-in-progress and allows early feedback.
2. **Fill in the PR template** — every PR must answer: what changed, why, and how it was tested.
3. **Self-review your diff** before requesting review. Check for:
   - No committed `.env` files or secrets.
   - No `console.log` debug statements left in production code.
   - All new environment variables documented in `.env.example`.
4. **Request at least one reviewer** before merging.
5. **Squash and merge** is preferred to keep `main` history clean.
6. **Delete the branch** after the PR is merged.

### What makes a good PR?
- Small and focused — one logical change per PR.
- Descriptive title following the commit convention format.
- Clear description of *why* the change is needed, not just what it does.
- Screenshots for UI changes.

---

## Environment Setup

### Prerequisites
- Node.js >= 18
- MongoDB running locally (or a MongoDB Atlas connection string)
- A Gemini API key from https://aistudio.google.com/app/apikey

### Server
```bash
cd server
cp .env.example .env          # fill in real values
npm install
npx prisma generate           # generate Prisma client
npx prisma db push            # sync schema to dev.db
npm run dev                   # starts nodemon on :5000
```

### Client
```bash
cd client
cp .env.example .env          # set VITE_API_URL if needed
npm install
npm run dev                   # starts Vite on :5173
```

---

## Running Locally

Both the server and client must run simultaneously for the app to work:

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Security Notes

- **Never commit `.env` files.** They are in `.gitignore` for a reason.
- Always add new environment variables to `.env.example` with placeholder values and a comment.
- JWT secrets must be at least 64 random bytes. Generate with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
