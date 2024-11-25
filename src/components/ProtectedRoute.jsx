import { Navigate } from 'react-router-dom';
import { checkToken } from '../utils/auth';

const ProtectedRoute = ({ children }) => {
    if (!checkToken()) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute; 