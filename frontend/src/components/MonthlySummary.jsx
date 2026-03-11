export default function MonthlySummary({ monthlyVolume, formatCurrency }) {
  const orderedVolume = [...monthlyVolume].reverse();

  if (orderedVolume.length === 0) {
    return <p className="panel-copy">No monthly summary is available yet.</p>;
  }

  return (
    <div className="summary-list">
      {orderedVolume.map((item) => (
        <div className="summary-row" key={item.month}>
          <div>
            <strong>
              {new Intl.DateTimeFormat("en-GB", {
                month: "long",
                year: "numeric",
              }).format(new Date(item.month))}
            </strong>
            <p>{item.transaction_count} transactions</p>
          </div>
          <span>{formatCurrency(item.total_volume)}</span>
        </div>
      ))}
    </div>
  );
}
