import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Check if user is authenticated by verifying the token exists
  const isAuthenticated = localStorage.getItem('accessToken') !== null;
  
  // If authenticated, render the child routes
  // If not, redirect to 404 page
  return isAuthenticated ? <Outlet /> : <Navigate to="/404" replace />;
};

export default ProtectedRoute;