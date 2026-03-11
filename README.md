# Flatpay Retention Dashboard

Small internal tool for retention agents to monitor merchant activity, review customer context, and log retention interactions.

## Live Demo

Live app:
https://flatpay-retention-backend.onrender.com

- Frontend + backend are deployed together on Render
- PostgreSQL is hosted on Neon

## Setup

### 1. Create the database

```bash
createdb data_solutions_project
```

### 2. Load the provided seed data

```bash
psql -U postgres -d data_solutions_project -f database/seed.sql
```

### 3. Create the retention calls table

Run this command from the project root:

```bash
psql -U postgres -d data_solutions_project <<'SQL'
CREATE TABLE IF NOT EXISTS retention_calls (
    id BIGSERIAL PRIMARY KEY,
    merchant_id BIGINT NOT NULL REFERENCES dim_customer(merchant_id),
    call_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    outcome VARCHAR(50) NOT NULL,
    notes TEXT,
    agent_name VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_retention_calls_merchant_id
ON retention_calls(merchant_id);
SQL
```


### 4. Install backend dependencies

```bash
cd backend
npm install
```

### 5. Start the backend

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:3000
```

### 6. Open a second terminal and install frontend dependencies

```bash
cd frontend
npm install
```

### 7. Start the frontend

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL

## Features

- Customer overview page:
  - total transaction volume for the last 90 days
  - number of transactions for the last 90 days
  - days since last transaction
  - status classification
- Customer detail page:
  - daily transaction trend
  - aggregated monthly transaction volume
  - full transaction history
  - retention interaction history
- Retention interaction logging without page refresh
- Merchant search
- Sorting on key activity columns

## Customer Risk Classification Logic

The status logic is based on transaction recency relative to the latest transaction date in the dataset, not the real current date.

This is important because the provided data is historical. Using the dataset reference date keeps the classification stable and meaningful.

Rules:

- `Active`: the merchant has had at least one transaction within the last 7 days
- `At Risk`: the merchant has had no transactions for 8 to 30 days
- `Inactive`: the merchant has had no transactions for more than 30 days

`days_since_last_transaction` is calculated from:

- `customer.last_transaction_at`
- compared against
- `MAX(transaction_timestamp)` from `fct_transactions`

## Architecture

The project is split into three parts:

- `frontend/`: React application
- `backend/`: Express API
- `database/`: SQL schema and seed data

### Backend

The backend follows a lightweight MVC-style structure with an additional service layer for business logic. It is also organized by feature:

```text
backend/src/
├── app.js
├── index.js
├── config/
│   └── db.js
├── customers/
│   ├── customers.controller.js
│   ├── customers.model.js
│   ├── customers.router.js
│   └── customers.service.js
└── retention-calls/
    ├── retention-calls.controller.js
    ├── retention-calls.model.js
    └── retention-calls.router.js
```

Responsibilities:

- `router`: defines endpoints
- `controller`: handles request/response flow
- `model`: runs SQL queries
- `service`: applies business logic such as customer status classification

The React frontend acts as the view layer.

### Frontend

The frontend uses React Router and is split into:

- `pages/`: page-level state and data fetching
- `components/`: reusable UI components
- `router/`: route definitions

Main pages:

- `OverviewPage`
- `DetailPage`

## Database

The provided seed data includes:

- `dim_customer`
- `fct_transactions`

The app adds its own table:

- `retention_calls`

Fields used for retention logging:

- `merchant_id`
- `call_timestamp`
- `outcome`
- `notes`
- `agent_name`

## API Endpoints

- `GET /api/customers`
- `GET /api/customers/:customerId`
- `GET /api/retention-calls/:customerId`
- `POST /api/retention-calls`

## Notes on Data Handling

- `transaction_amount_eur` is displayed as EUR after dividing by `100` for presentation
- this is based on the observed value distribution in the dataset, which strongly suggests minor-unit storage
- daily trend data is zero-filled up to the dataset reference date so inactivity periods remain visible in the chart

## Trade-offs

- The biggest trade-off has definitely been to keep the risk logic simple and explainable rather than building a more complex churn model. I considered making At Risk status depend on a 20% decline in transaction count over the last 14 days compared with the previous 14 days, but chose not to use that rule because of the complexity. I believe the the simpler, current classification is easier to understand and defend for this dataset.

- I added an `agent_name` field to `retention_calls` so retention logs are attributable to a specific colleague.
````
