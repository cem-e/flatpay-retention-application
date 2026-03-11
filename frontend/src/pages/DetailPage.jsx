import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button";
import CustomerDetail from "../components/CustomerDetail";
import { API_BASE_URL } from "../config";

const euroFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
});

function formatCurrency(minorUnits) {
  return euroFormatter.format(Number(minorUnits || 0) / 100);
}

export default function DetailPage() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customerDetail, setCustomerDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    async function loadCustomerDetail() {
      try {
        setDetailLoading(true);
        setDetailError("");

        const response = await fetch(
          `${API_BASE_URL}/api/customers/${customerId}`,
        );

        if (!response.ok) {
          throw new Error("Failed to load customer detail");
        }

        const data = await response.json();
        setCustomerDetail(data);
      } catch (error) {
        setDetailError(error.message);
      } finally {
        setDetailLoading(false);
      }
    }

    loadCustomerDetail();
  }, [customerId]);

  function goToOverview() {
    navigate("/");
  }

  function handleCallCreated(newCall) {
    setCustomerDetail((currentDetail) => {
      if (!currentDetail) {
        return currentDetail;
      }

      return {
        ...currentDetail,
        retentionCalls: [newCall, ...currentDetail.retentionCalls],
      };
    });
  }

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1>Merchant Details</h1>
          <Button onClick={goToOverview}>Back to merchants</Button>
        </div>
      </section>

      <section className="detail-card">
        <CustomerDetail
          customerDetail={customerDetail}
          detailLoading={detailLoading}
          detailError={detailError}
          formatCurrency={formatCurrency}
          onCallCreated={handleCallCreated}
        />
      </section>
    </>
  );
}
