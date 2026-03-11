import { Navigate, Route, Routes } from "react-router-dom";
import OverviewPage from "../pages/OverviewPage";
import DetailPage from "../pages/DetailPage";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<OverviewPage />} />
      <Route path="/customers/:customerId" element={<DetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
