import { useState } from "react";

function formatLabel(timestamp) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(new Date(timestamp));
}

export default function TrendChart({ dailyTrend, formatCurrency }) {
  const [activePointIndex, setActivePointIndex] = useState(null);
  const pointsSource = dailyTrend;

  const counts = pointsSource.map((item) =>
    Number(item.transaction_count || 0),
  );
  const maxCount = Math.max(...counts, 1);
  const width = 760;
  const height = 280;
  const padding = 28;
  const chartLeft = padding;

  let inactivityStreak = 0;
  const points = pointsSource.map((item, index) => {
    const transactionCount = Number(item.transaction_count || 0);
    inactivityStreak = transactionCount === 0 ? inactivityStreak + 1 : 0;

    const x =
      pointsSource.length === 1
        ? width / 2
        : chartLeft +
          (index / (pointsSource.length - 1)) * (width - chartLeft - padding);
    const y =
      height - padding - (transactionCount / maxCount) * (height - padding * 2);

    let tone = "active";

    if (inactivityStreak > 30) {
      tone = "inactive";
    } else if (inactivityStreak > 7) {
      tone = "at_risk";
    }

    return { x, y, item, tone, inactivityStreak };
  });

  const recentLabels = pointsSource
    .filter((_, index) => index === 0 || index === pointsSource.length - 1)
    .map((item) => formatLabel(item.day));
  const activePoint =
    activePointIndex === null ? null : points[activePointIndex] || null;
  const tooltipX = activePoint ? (activePoint.x / width) * 100 : 0;
  const tooltipClassName =
    tooltipX < 18
      ? "chart-tooltip chart-tooltip--left"
      : tooltipX > 82
        ? "chart-tooltip chart-tooltip--right"
        : "chart-tooltip";

  function handleChartMove(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - bounds.left;
    const svgX = (mouseX / bounds.width) * width;

    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    points.forEach((point, index) => {
      const distance = Math.abs(point.x - svgX);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActivePointIndex(closestIndex);
  }

  return (
    <div className="graph-panel">
      <h3>Daily Transaction Trend</h3>
      <p className="panel-copy">
        This chart shows how the merchant’s daily transaction activity changes
        over time and helps highlight signs of decline.
      </p>

      <div className="line-chart-shell">
        {activePoint && (
          <div
            className={tooltipClassName}
            style={{
              left: `${tooltipX}%`,
              top: `${(activePoint.y / height) * 100}%`,
            }}
          >
            {`${formatLabel(activePoint.item.day)}: ${
              activePoint.item.transaction_count
            } transactions (${formatCurrency(activePoint.item.total_volume)})`}
          </div>
        )}

        <svg
          className="line-chart"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Transaction trend chart"
          onMouseMove={handleChartMove}
          onMouseLeave={() => setActivePointIndex(null)}
        >
          <defs>
            <linearGradient id="trendGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#35d07f" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#35d07f" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0.2, 0.4, 0.6, 0.8].map((ratio) => {
            const y = padding + ratio * (height - padding * 2);
            return (
              <line
                key={ratio}
                x1={chartLeft}
                x2={width - padding}
                y1={y}
                y2={y}
                className="chart-grid-line"
              />
            );
          })}

          {points.slice(1).map((point, index) => {
            const previousPoint = points[index];

            return (
              <line
                key={`${previousPoint.item.day}-${point.item.day}`}
                x1={previousPoint.x}
                y1={previousPoint.y}
                x2={point.x}
                y2={point.y}
                className={`chart-line chart-line--${point.tone}`}
              />
            );
          })}

          {points.map((point, index) => (
            <circle
              key={`${point.item.day}-${index}`}
              cx={point.x}
              cy={point.y}
              r={activePointIndex === index ? "5" : "3"}
              className={`chart-point ${
                activePointIndex === index ? "is-active" : ""
              } chart-point--${point.tone}`}
            ></circle>
          ))}
        </svg>
      </div>

      <div className="chart-meta">
        <span>{recentLabels[0]}</span>
        <span>{recentLabels[recentLabels.length - 1]}</span>
      </div>
    </div>
  );
}
