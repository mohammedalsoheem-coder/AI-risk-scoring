import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Facilities from './pages/Facilities';
import FacilityDetail from './pages/FacilityDetail';
import MapView from './pages/MapView';
import Violations from './pages/Violations';
import Inspections from './pages/Inspections';
import Reports from './pages/Reports';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="facilities" element={<Facilities />} />
          <Route path="facilities/:id" element={<FacilityDetail />} />
          <Route path="map" element={<MapView />} />
          <Route path="violations" element={<Violations />} />
          <Route path="inspections/new" element={<Inspections />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
