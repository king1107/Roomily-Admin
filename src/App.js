import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Layout from './components/Layout';
import Dashboard from './components/PagesChild/DashBoard';
import ManageRoom from './components/PagesChild/ManageRoom';
import ReportUserNotification from './components/PagesChild/ReportUserNotification';
import ManageUser from './components/PagesChild/ManageUser';
import ManageReportedUser from './components/PagesChild/ManageReportedUser';
import NotFoundPage from './components/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import ManageWithDraw from './components/PagesChild/ManageWithDraw';
import UserVerification from './components/PagesChild/UserVerification';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/404" element={<NotFoundPage />} />
        
        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<Layout />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/manage-room" element={<ManageRoom />} />
            <Route path="/admin/reportUser-notification" element={<ReportUserNotification />} />
            <Route path="/admin/manage-user" element={<ManageUser />} />
            <Route path="/admin/manage-reportedUser" element={<ManageReportedUser />} />
            <Route path="/admin/manage-withdraw" element={<ManageWithDraw />} />
            <Route path="/admin/user-verification" element={<UserVerification />} />
          </Route>
        </Route>
        
        {/* Catch all other routes and redirect to 404 */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Router>
  );
}

export default App;