# Task API ? Codzee evaluation

A small HTTP task API built with Node.js standard libraries. No dependencies, account data, or credentials are included.

## Run

Requires Node.js 22 or newer. Run `npm test`, then `npm start`.
The server listens on `127.0.0.1:3000`; set `PORT` to change the port.

## API

- `GET /health`: readiness check.
- `POST /tasks`: create a task using JSON such as `{"title":"Review a PR"}`.
- `GET /tasks`: list tasks.
- `GET /tasks/:id`: retrieve one task.
- `DELETE /tasks/:id`: delete one task.

Tasks are held in memory and reset on restart. The baseline has no authentication and is for local development. Do not expose it publicly.

## Review evaluation

Three independent branches target the baseline so each PR has a focused diff:

1. `feature/task-search`: filtering, deterministic sorting, pagination.
2. `fix/request-validation`: bounded request bodies, media type checks, strict title validation.
3. `security/bearer-auth`: fail-closed bearer authentication and timing-safe comparison.

Install Codzee on this repository before opening these PRs. Keep the PRs open until reviews are recorded. These are independent evaluation branches; combine them only after integration testing.
See `docs/evaluation.md` for the evidence log. AI assistance was used to implement the project and tests; product feedback must come from actual Codzee reviews.

## Public assessment links

- [PR #1: Search](https://github.com/ss1290/codzee-task-api/pull/1)
- [PR #2: Validation](https://github.com/ss1290/codzee-task-api/pull/2)
- [PR #3: Authentication](https://github.com/ss1290/codzee-task-api/pull/3)
- [Observed reviews, fixes, feedback and suggestions](docs/evaluation.md)
