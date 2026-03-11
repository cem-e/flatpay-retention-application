import pool from "../config/db.js";

async function getCustomerOverview() {
  const query = `
    WITH dataset_reference AS (
      SELECT MAX(transaction_timestamp) AS dataset_as_of
      FROM fct_transactions
    )
    SELECT
      c.merchant_id AS customer_id,
      c.company_name,
      c.country,
      c.product_type,
      ref.dataset_as_of,
      MAX(t.transaction_timestamp) AS last_transaction_at,
      COALESCE(
        SUM(t.transaction_amount_eur) FILTER (
          WHERE t.transaction_timestamp >= ref.dataset_as_of - INTERVAL '90 days'
        ),
        0
      ) AS total_volume_last_90_days,
      COALESCE(
        COUNT(t.transaction_id) FILTER (
          WHERE t.transaction_timestamp >= ref.dataset_as_of - INTERVAL '90 days'
        ),
        0
      ) AS transaction_count_last_90_days
    FROM dim_customer c
    CROSS JOIN dataset_reference ref
    LEFT JOIN fct_transactions t ON t.merchant_id = c.merchant_id
    GROUP BY
      c.merchant_id,
      c.company_name,
      c.country,
      c.product_type,
      ref.dataset_as_of
    ORDER BY c.company_name ASC
  `;

  const { rows } = await pool.query(query);
  return rows;
}

async function getCustomerDetail(customerId) {
  const query = `
    WITH dataset_reference AS (
      SELECT MAX(transaction_timestamp) AS dataset_as_of
      FROM fct_transactions
    )
    SELECT
      c.merchant_id AS customer_id,
      c.company_name,
      c.contact_person,
      c.phone_number,
      c.address,
      c.country,
      c.product_type,
      c.merchant_segment,
      c.merchant_created_at,
      ref.dataset_as_of,
      MAX(t.transaction_timestamp) AS last_transaction_at,
      COALESCE(
        SUM(t.transaction_amount_eur) FILTER (
          WHERE t.transaction_timestamp >= ref.dataset_as_of - INTERVAL '90 days'
        ),
        0
      ) AS total_volume_last_90_days,
      COALESCE(
        COUNT(t.transaction_id) FILTER (
          WHERE t.transaction_timestamp >= ref.dataset_as_of - INTERVAL '90 days'
        ),
        0
      ) AS transaction_count_last_90_days
    FROM dim_customer c
    CROSS JOIN dataset_reference ref
    LEFT JOIN fct_transactions t ON t.merchant_id = c.merchant_id
    WHERE c.merchant_id = $1
    GROUP BY
      c.merchant_id,
      c.company_name,
      c.contact_person,
      c.phone_number,
      c.address,
      c.country,
      c.product_type,
      c.merchant_segment,
      c.merchant_created_at,
      ref.dataset_as_of
  `;

  const { rows } = await pool.query(query, [customerId]);
  return rows[0] || null;
}

async function getCustomerMonthlyVolume(customerId) {
  const query = `
    SELECT
      DATE_TRUNC('month', transaction_timestamp) AS month,
      COUNT(*) AS transaction_count,
      SUM(transaction_amount_eur) AS total_volume
    FROM fct_transactions
    WHERE merchant_id = $1
    GROUP BY DATE_TRUNC('month', transaction_timestamp)
    ORDER BY month DESC
  `;

  const { rows } = await pool.query(query, [customerId]);
  return rows;
}

async function getCustomerDailyTrend(customerId) {
  const query = `
    WITH dataset_reference AS (
      SELECT DATE_TRUNC('day', MAX(transaction_timestamp)) AS dataset_as_of_day
      FROM fct_transactions
    ),
    customer_bounds AS (
      SELECT
        DATE_TRUNC('day', MIN(transaction_timestamp)) AS first_transaction_day
      FROM fct_transactions
      WHERE merchant_id = $1
    ),
    calendar AS (
      SELECT GENERATE_SERIES(
        (SELECT first_transaction_day FROM customer_bounds),
        (SELECT dataset_as_of_day FROM dataset_reference),
        INTERVAL '1 day'
      ) AS day
    ),
    daily_totals AS (
      SELECT
        DATE_TRUNC('day', transaction_timestamp) AS day,
        COUNT(*) AS transaction_count,
        SUM(transaction_amount_eur) AS total_volume
      FROM fct_transactions
      WHERE merchant_id = $1
      GROUP BY DATE_TRUNC('day', transaction_timestamp)
    )
    SELECT
      calendar.day,
      COALESCE(daily_totals.transaction_count, 0) AS transaction_count,
      COALESCE(daily_totals.total_volume, 0) AS total_volume
    FROM calendar
    LEFT JOIN daily_totals ON daily_totals.day = calendar.day
    ORDER BY calendar.day ASC
  `;

  const { rows } = await pool.query(query, [customerId]);
  return rows;
}

async function getCustomerTransactions(customerId) {
  const query = `
    SELECT
      transaction_id,
      payment_id,
      transaction_timestamp,
      card_type,
      transaction_amount_eur,
      currency,
      country
    FROM fct_transactions
    WHERE merchant_id = $1
    ORDER BY transaction_timestamp DESC
  `;

  const { rows } = await pool.query(query, [customerId]);
  return rows;
}

export {
  getCustomerOverview,
  getCustomerDetail,
  getCustomerDailyTrend,
  getCustomerMonthlyVolume,
  getCustomerTransactions,
};
