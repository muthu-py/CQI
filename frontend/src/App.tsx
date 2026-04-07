import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { SubjectAnalysisPage } from './pages/SubjectAnalysis/SubjectAnalysisPage';
import { CohortAnalysisPage } from './pages/CohortAnalysis/CohortAnalysisPage';
import { BatchAnalysisPage } from './pages/BatchAnalysis/BatchAnalysisPage';
import { TeacherAnalysisPage } from './pages/TeacherAnalysis/TeacherAnalysisPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/subject" replace />} />
          <Route path="subject" element={<SubjectAnalysisPage />} />
          <Route path="cohort" element={<CohortAnalysisPage />} />
          <Route path="batch" element={<BatchAnalysisPage />} />
          <Route path="teacher" element={<TeacherAnalysisPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

