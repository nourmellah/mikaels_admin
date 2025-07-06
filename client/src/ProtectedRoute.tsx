import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const token = localStorage.getItem('accessToken');
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

// This component checks if the user is authenticated by looking for an access token in localStorage.
// If the token exists, it renders the child components (using <Outlet />).
// If the token does not exist, it redirects the user to the sign-in page using <Navigate />.
// The `replace` prop ensures that the navigation does not leave a history entry, preventing the user from going back to the protected route after being redirected.