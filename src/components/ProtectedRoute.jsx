import { Navigate, useLocation } from 'react-router-dom';
import { checkToken } from '../utils/auth';

const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    
    // Only check token for the main /admin route
    if (location.pathname === '/admin' && !checkToken()) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute; 