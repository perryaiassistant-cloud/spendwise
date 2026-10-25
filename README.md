# Spendwise

A lightweight React + Vite personal expense tracker. All amounts use GBP and are stored as integer pence. Expenses stay in this browser's localStorage; no account or backend is required. Fonts are bundled locally.

## Run locally

Requires Node.js 18 or later.

```sh
npm ci
npm run dev
```

## Build and preview

```sh
npm run build
npm run preview
```

## Browser smoke tests

```sh
npx playwright install chromium
npm test
```

Tests run against the production preview in desktop Chromium and a mobile Chromium viewport. They cover adding, editing, cancelling deletion, deleting, category/date/search filters, monthly totals, reload persistence, malformed storage, invalid amounts, and horizontal page overflow. Browser runtime libraries must be available on the host.

For the sandbox used during implementation, Chromium and its missing libraries were downloaded and extracted under `/tmp`, without system installation. The test command was:

```sh
LD_LIBRARY_PATH=/tmp/spendwise-libs/extracted/usr/lib/x86_64-linux-gnu PLAYWRIGHT_BROWSERS_PATH=/tmp/spendwise-browsers npm test
```

The dashboard summarises the current calendar month; transactions and filters cover all recorded dates. Daily average uses elapsed calendar days in the month. Data is initially empty. Deleting expenses requires confirmation. Clearing browser data removes saved expenses; different browsers and devices do not share data.
