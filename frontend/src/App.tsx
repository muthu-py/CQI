import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { RequireAuth } from './components/auth/RequireAuth';
import { SubjectAnalysisPage } from './pages/SubjectAnalysis/SubjectAnalysisPage';
import { CohortAnalysisPage } from './pages/CohortAnalysis/CohortAnalysisPage';
import { BatchAnalysisPage } from './pages/BatchAnalysis/BatchAnalysisPage';
import { LoginPage } from './pages/LoginPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<DashboardLayout />}>
            <Route path="/subject" element={<SubjectAnalysisPage />} />
            <Route path="/cohort" element={<CohortAnalysisPage />} />
            <Route path="/batch" element={<BatchAnalysisPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
