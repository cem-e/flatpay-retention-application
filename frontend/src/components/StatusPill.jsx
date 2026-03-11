export function formatStatus(status) {
  const labels = {
    active: "Active",
    at_risk: "At Risk",
    inactive: "Inactive",
  };

  return labels[status] || status;
}

export default function StatusPill({ status }) {
  return (
    <span className={`status-pill status-pill--${status}`}>
      {formatStatus(status)}
    </span>
  );
}
