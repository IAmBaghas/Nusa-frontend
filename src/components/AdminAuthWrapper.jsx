import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkToken } from '../utils/auth';

const AdminAuthWrapper = ({ children }) => {
    const navigate = useNavigate();

    useEffect(() => {
        // Check token on mount and set up interval
        const checkAuth = () => {
            if (!checkToken()) {
                navigate('/login');
            }
        };

        // Initial check
        checkAuth();

        // Set up periodic checks (every 30 seconds)
        const interval = setInterval(checkAuth, 30000);

        // Cleanup
        return () => clearInterval(interval);
    }, [navigate]);

    return children;
};

export default AdminAuthWrapper; 