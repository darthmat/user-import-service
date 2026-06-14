# User Import Service

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Environment files](#1-environment-files)
  - [2. Run everything](#2-run-everything)
- [Architecture](#architecture)
- [Tests](#tests)
- [CSV Import — Why CSV, What Can Go Wrong, and What I Did About It](#csv-import--why-csv-what-can-go-wrong-and-what-i-did-about-it)
  - [Why CSV in the first place](#why-csv-in-the-first-place)
  - [What actually goes wrong with CSV imports](#what-actually-goes-wrong-with-csv-imports-and-how-i-dealt-with-it-here)
- [What I deliberately didn't solve](#what-i-deliberately-didnt-solve)
- [A note on AI usage](#a-note-on-ai-usage)

---

A small monorepo with a NestJS API and a Next.js frontend. The API exposes two
endpoints — creating a single user, and importing users from a CSV file — and
the frontend gives you a couple of simple forms and a results table for the
CSV import.

This project is built as a working MVP: small in scope, but structured the
way I'd structure something meant to grow.

---

## Getting started

### Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose
- Node.js (for running things outside Docker, e.g. tests)
- pnpm

### 1. Environment files

You'll need three `.env` files. Examples are provided for each — copy and
adjust as needed:

```bash
cp .env.example .env                     # root: DB_USER, DB_PASSWORD, DB_NAME
cp apps/api/.env.example apps/api/.env   # API config
cp apps/web/.env.example apps/web/.env   # frontend config
```

A couple of notes on the values:

- The root `.env` only holds the Postgres credentials (`DB_USER`,
  `DB_PASSWORD`, `DB_NAME`) — these are shared between `docker-compose.yml`
  and the API.
- `apps/web/.env.example` ships with `API_URL=http://localhost:4000`, which
  is the correct default for running the frontend outside Docker against a
  locally running API. Inside `docker-compose.yml`, this is overridden to
  `http://app:4000` so the `web` container can reach the `app` container by
  its service name.

### 2. Run everything

```bash
docker compose up -d --build
```

This starts three services, in order:

1. `postgres` — waits until healthy
2. `app` (NestJS API) — waits for `postgres`, waits until healthy
3. `web` (Next.js frontend) — waits for `app`

Once everything is up:

- API: `http://localhost:4000`
- Web: `http://localhost:3000`

---

## Architecture

The API follows a hexagonal-ish layout: `controller` → `port` (abstract
class used as a DI token) → `service` → `domain model` → `repository`, all wired
together with NestJS's dependency injection. The point of this isn't
ceremony for its own sake — it's that every layer can be swapped or tested in
isolation. The service never talks to Kysely directly, and the controller
never talks to the service's concrete class, only its port.

A few things worth calling out specifically:

- **Rich domain model.** `User` isn't just a data bag — it has `create()` and
  `fromData()` methods that enforce basic business rules (is this a valid
  username, is this a valid email) before anything ever reaches the database.
- **Validation happens twice, on purpose.** NestJS DTOs validate the
  "transport" layer — is the request shaped correctly, is the delimiter one
  of the allowed values, is the file actually present. The domain model
  validates business rules — is this actually a usable username/email. These
  are different concerns and I wanted them to stay different, rather than
  cramming everything into one giant DTO validator.
- **Custom error handling.** Nothing gets thrown as a generic `Error`. Every
  domain error is its own class, and a central error handler maps these to
  HTTP responses. This keeps stack traces out of API responses and makes it
  obvious, when something fails, exactly what went wrong and where.
- **Environment validation with Zod.** If a required env var is missing or
  malformed, the app fails fast on startup with a clear message, instead of
  failing later in some unrelated request.
- **Database layer.** Postgres + Kysely, fully typed, repository pattern. The
  `users` table is `id` (UUIDv7), `username` and `email` (both unique), and
  `created_at`.

On the frontend: Next.js App Router, a thin BFF layer
(`UserServiceImpl`) with server actions for both forms, and shadcn/Tailwind
for the UI. The service takes `fetch` as a constructor parameter with a
default value (`customFetch = fetch`) — nothing actually overrides it today,
but it means the HTTP client can be swapped for a mock in tests without
mocking the global `fetch` or any modules. There are three main
pieces: a single-user creation form, a CSV upload form (with delimiter
selection), and a results table showing which rows succeeded and which
failed. Server-side errors surface as toasts.

---

## Tests

- **Unit tests** on the services, using a fake repository built on a `Map`
  instead of mocks — this keeps the tests close to "real" behaviour without
  needing a database. This is where most of the import logic is actually
  tested: batching (500 rows per `saveMany` call), row numbering, sorting
  failed rows, and the "re-importing the same file produces a conflict"
  scenario — all against `FakeUserRepository` and `FakeCsvParser`.
- **Integration tests** on the repository layer, using Testcontainers to spin
  up a real Postgres instance. This is where the things that only make sense
  against a real database get verified — most importantly, that
  `ON CONFLICT DO NOTHING` actually behaves the way the import service
  assumes it does.
- The domain model (`User`) has its own unit tests covering its full
  behaviour — validation, normalization (trimming, lowercasing emails), and
  the `create()`/`fromData()` factory methods described below.

```bash
pnpm test:api
```

---

## CSV import — why CSV, what can go wrong, and what I did about it

### Why CSV in the first place

CSV wasn't just the path of least resistance here — it's a pattern I've seen
work well in practice. At a previous job, we built a system that ingested
huge keyword files from SEMrush (50k-100k+ rows), validated them against
other services, and loaded them into the database, with users getting a
dashboard showing what succeeded and what didn't. CSV upload was the entry
point. Later on, the project grew to include cronjobs that pulled data
directly from external APIs too, but we kept the CSV upload option around —
because:

- it doesn't require any API integration on the user's side, exporting from
  Excel, Google Sheets, or any CRM/ERP is one click,
- non-technical people (ops, sales, HR) can use it without any onboarding,
- it's a handy manual override even once "proper" automated pipelines exist.

So in this project I'm treating CSV import the same way: a simple, working
MVP that has an obvious path to grow into something bigger if the project
needs it.

### What actually goes wrong with CSV imports (and how I dealt with it here)

**The file might just be too big.** My parser (`fast-csv`) is technically
stream-based, but I'm still collecting every row into an array before doing
anything with it (`rows.push(row)`). So even though the parsing itself
happens row-by-row, memory usage still grows with file size — a 100k-row file
would sit fully in memory before validation even starts. To keep this honest,
I added a hard cap of 1000 rows (`CsvTooLargeException`). It's a blunt tool,
but it's an honest one: it stops the app from quietly choking on a huge file
instead of pretending it can handle anything.

If this needed to scale to the SEMrush-sized files I mentioned above, the
real fix isn't "raise the limit" — it's moving the whole thing to a
background worker: accept the upload, hand it off to a queue, and process it
with a true streaming pipeline that never holds the whole file in memory.

**People upload files with the wrong delimiter.** If someone picks
"semicolon" but the file is actually comma-separated, `fast-csv` doesn't fail
outright — it just reads the entire first line as a single column header. I
catch that specific case (`headers.length === 1`) and throw a
`DelimiterMismatchException` instead of a generic "missing headers" error.
It's a small thing, but it's the difference between telling someone "your
file is broken" and telling them "try a different delimiter" — which is
usually all they need to fix it themselves.

**One bad row shouldn't kill the whole import.** This is probably the most
important decision in here. A 1000-row file with one row that has a malformed
email shouldn't mean all 999 good rows fail too. So validation happens in two
separate stages:

1. **Format validation, in memory, before touching the database.** Each row
   gets turned into a `User` domain object via `User.create()`, which checks
   things like "is this actually an email" and "is this username valid".
   Rows that fail this check go straight into the `failed` list with the
   reason — no database round-trip needed.
2. **Uniqueness validation, at the database level, during insert.** Rather
   than checking "does this email already exist?" for every row before
   inserting (which would mean a lot of extra queries), I insert everything
   that passed step 1 in one batch with `ON CONFLICT DO NOTHING`, then
   compare which IDs actually came back. Anything that didn't make it back
   gets reported as "already exists".

This second part also quietly handles a case people often forget about:
duplicates _within the same file_. If the file itself has the same email
twice, the first one inserts fine and the second one collides with it — same
`ON CONFLICT DO NOTHING` mechanism catches it, no extra code needed.

There's a related edge case worth mentioning: emails are case-insensitive in
practice (`John@test.com` and `john@test.com` are the same mailbox), but a
plain unique constraint on the raw string wouldn't treat them as duplicates.
`User.create()` trims and lowercases the email (and trims the username)
before validation, so both rows end up with the same value before they ever
reach the database — and the same `ON CONFLICT DO NOTHING` path catches it
like any other duplicate.

**Users need to know exactly which rows failed and why.** Throwing a single
error for the whole import isn't useful — if 3 out of 1000 rows are bad, the
user needs a list of those 3, with the actual row numbers as they'd see them
in Excel (accounting for the header row), and a plain-English reason for
each. That's what the `failed`/`succeeded` split in the response is for, and
it's what powers the results table on the frontend.

**Inserts happen in batches of 500, not all at once.** With
`ON CONFLICT DO NOTHING` and up to 1000 rows, doing it as a single insert
would probably still work fine, but batching keeps each query reasonably
sized and is the kind of thing that matters more as row limits grow — so I
built it in now rather than as an afterthought later.

### What I deliberately didn't solve

A few things are out of scope for this version, but worth being upfront
about:

- **No real streaming to the database.** As mentioned above, the row cap is
  doing the job that a streaming pipeline would do at scale. Fine for 1000
  rows, not fine for 100k.
- **No background processing.** The whole import happens synchronously
  within the request. For small files this is fine and actually gives a
  nicer UX (immediate results), but it means the request has to stay open for
  the duration of the import — not great if row limits ever go up
  significantly.
- **Re-uploading the same file isn't "smart".** If someone fixes 2 rows out
  of 1000 and re-uploads the whole file, the 998 already-imported rows will
  just show up as "already exists" again. That's not wrong, exactly — it's
  accurate — but it's not a great experience. A production version of this
  would probably track import batches/status so users could re-run "just the
  failed rows".

None of these are bugs — they're just the next things I'd tackle if this
needed to handle the SEMrush-scale volumes I mentioned earlier, where the CSV
upload became one input feeding a much bigger pipeline rather than the whole
pipeline itself.

---

## A note on AI usage

I used AI assistance while working on this project and while writing this
README — mainly for structuring my thoughts and for going back and forth on
trade-offs. The reasoning, the decisions, and the "why" behind them above are
mine; the writing process just helped me get them down clearly.
