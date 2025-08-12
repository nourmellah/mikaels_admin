import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const token = localStorage.getItem('accessToken');
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

// This component checks if the user is authenticated by looking for an access token in localStorage.
// If the token exists, it renders the child components (using <Outlet />).
// If the token does not exist, it redirects the user to the sign-in page using <Navigate />.