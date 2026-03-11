export default function TransactionHistory({ transactions, formatCurrency }) {
  if (!transactions.length) {
    return <p className="panel-copy">No transaction history is available yet.</p>;
  }

  return (
    <div className="history-table-shell">
      <table className="history-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Amount</th>
            <th>Card Type</th>
            <th>Country</th>
            <th>Currency</th>
            <th>Transaction ID</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.transaction_id}>
              <td>
                {new Date(transaction.transaction_timestamp).toLocaleString("en-GB")}
              </td>
              <td>{formatCurrency(transaction.transaction_amount_eur)}</td>
              <td>{transaction.card_type}</td>
              <td>{transaction.country}</td>
              <td>{transaction.currency}</td>
              <td>{transaction.transaction_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
