# Ledger

A privacy-first expense tracker. Upload a bank statement CSV, and Ledger parses it, categorizes every transaction, and turns it into a real spending dashboard. No bank-linking, no third-party financial APIs, and nothing leaves your own database.

**Live demo:** [https://ledger-711c.onrender.com/](https://ledger-711c.onrender.com/)

---

## The problem

Budgeting tools generally force a choice between two bad options: manual entry in a spreadsheet, or handing your real banking credentials to a third-party service like Plaid so an app can read your transactions for you. Neither is great. One is tedious, and the other means trusting a company with direct access to your bank account.

Every bank already lets you export your own transaction history as a CSV, straight from your own online banking, with zero third-party involvement. Ledger works from that instead: you export it yourself, you upload it yourself, and it never touches a server you don't control.

## How it works

1. **Upload:** a CSV export from your bank (date, description, amount) is sent to the backend.
2. **Parse:** the backend reads it line by line, strips the header, and turns messy real-world merchant text (`TST* TIM HORTONS #4211`) into structured records.
3. **Categorize:** a deterministic, keyword-based rule engine sorts each transaction into a category (Food & Dining, Transport, Subscriptions, etc.), falling back to "Uncategorized" when nothing matches.
4. **Aggregate:** the backend computes category totals and monthly totals on demand.
5. **Visualize:** the frontend dashboard fetches that data and renders it as live charts and stats, with no page reload required.

## Why rule-based categorization instead of AI?

It would be easy to route every transaction through an LLM and call it "AI-powered." That's the wrong tool here, for a few reasons.

Sending transaction data to an external API for every upload defeats the whole point of the project, since the financial data is supposed to stay local and private. Additionally, an AI will not be of much help because an AI would not have enough information from the CSV exports to make a correct interpretation of the transaction and successfully categorize it. As a result, an AI would guess, which is worse for a finance tool than an honest "Uncategorized." Furthermore, a CSV with hundreds of rows would mean hundreds of API calls, adding real latency and cost for something a few lines of string matching already solves.

The rule engine isn't a limitation. It's a deliberate choice, with a clear extension path (see Roadmap).

## Tech stack

- **Backend:** Java, Spring Boot, Spring Data JPA
- **Database:** PostgreSQL (Neon, in production), H2 (local development)
- **Frontend:** Vanilla JavaScript, HTML, CSS, Chart.js
- **Deployment:** Docker, Render

## Key design decisions

- **Privacy-first architecture:** no OAuth bank-linking, no third-party financial data APIs. The only data source is a file the user explicitly chose to upload.
- **Environment-variable configuration:** database credentials are never hardcoded. They're injected via environment variables both locally (through the IDE run configuration) and in production (through Render's dashboard). Real secrets never live in source control.
- **Docker packaging:** the app is containerized, so it isn't tied to any one hosting provider. Moving it elsewhere later is a config change, not a rewrite.
- **One dominant metric on the dashboard:** instead of four equal-weight stat cards, "Total spent" is visually prioritized above the rest, following the same hierarchy pattern used by real financial dashboards (Mercury, Ramp, Wealthsimple) rather than treating every number as equally important.

## Local setup

```bash
git clone https://github.com/saarish08-cmd/expense-tracker
cd expense-tracker
```

Set four environment variables: `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.

Then run:
```bash
./mvnw spring-boot:run
```

The app serves both the API and the frontend from `localhost:8080`.

## Screenshots

![Landing page](./assets/landing.png)
![Dashboard overview](./assets/dashboard-overview.png)
![Recent activity, default view](./assets/activity-default.png)
![Recent activity, filtered](./assets/activity-filtered.png)


## Roadmap

- **Field-level encryption** for stored transaction data at rest
- **Multi-format CSV parsing:** support additional bank statement CSV layouts by adding dedicated parsers per bank format
- **AI-assisted fallback categorization** for transactions the rule engine can't match. The deterministic engine stays primary, and AI only gets involved for the genuinely ambiguous leftover cases, keeping the privacy-first design intact.
- **Manual transaction editing & recategorization:** allow users to edit transactions directly on the dashboard so they can manually categorize "Uncategorized" items or override existing category assignments
- **Formatted spreadsheet export (.xlsx):** export spending summaries, category totals, and structured transaction tables directly into a formatted Excel workbook, ready for Google Sheets or Excel
