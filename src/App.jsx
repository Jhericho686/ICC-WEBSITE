import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, SiteSettingsProvider, ToastProvider } from './lib/contexts';
import ToastContainer from './components/Toast';
import ScrollToTop from './components/ScrollToTop';
import PublicLayout from './components/PublicLayout';

// Public Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import HierarchyPage from './pages/HierarchyPage';
import MembersPage from './pages/MembersPage';
import MontagesPage from './pages/MontagesPage';
import GalleryPage from './pages/GalleryPage';
import EventsPage from './pages/EventsPage';
import AchievementsPage from './pages/AchievementsPage';
import RulesPage from './pages/RulesPage';
import JoinPage from './pages/JoinPage';
import CollaboratePage from './pages/CollaboratePage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminApplications from './pages/admin/AdminApplications';
import AdminCollaborations from './pages/admin/AdminCollaborations';
import AdminMembers from './pages/admin/AdminMembers';
import AdminMontages from './pages/admin/AdminMontages';
import AdminGallery from './pages/admin/AdminGallery';
import AdminEvents from './pages/admin/AdminEvents';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLogs from './pages/admin/AdminLogs';

export default function App() {
  return (
    <AuthProvider>
      <SiteSettingsProvider>
        <ToastProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              {/* Public Routes with Navbar and Footer */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/hierarchy" element={<HierarchyPage />} />
                <Route path="/members" element={<MembersPage />} />
                <Route path="/montages" element={<MontagesPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/achievements" element={<AchievementsPage />} />
                <Route path="/rules" element={<RulesPage />} />
                <Route path="/join" element={<JoinPage />} />
                <Route path="/collaborate" element={<CollaboratePage />} />
              </Route>

              {/* Admin Auth Route */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Admin Dashboard Protected Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="applications" element={<AdminApplications />} />
                <Route path="collaborations" element={<AdminCollaborations />} />
                <Route path="members" element={<AdminMembers />} />
                <Route path="montages" element={<AdminMontages />} />
                <Route path="gallery" element={<AdminGallery />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="logs" element={<AdminLogs />} />
              </Route>

              {/* Catch-all redirect to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Global Toasts */}
            <ToastContainer />
          </Router>
        </ToastProvider>
      </SiteSettingsProvider>
    </AuthProvider>
  );
}
