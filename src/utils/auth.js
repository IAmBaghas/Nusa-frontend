export const checkToken = () => {
    const token = sessionStorage.getItem('token');
    const tokenExpires = sessionStorage.getItem('tokenExpires');

    if (!token || !tokenExpires) {
        return false;
    }

    // Check if token has expired
    const now = new Date();
    const expiryDate = new Date(tokenExpires);
    
    if (now >= expiryDate) {
        // Clear expired token
        clearToken();
        return false;
    }

    return true;
};

export const clearToken = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('tokenExpires');
};

export const setToken = (token, expiresIn = 7200) => { // 2 Jam
    sessionStorage.setItem('token', token);
    const expiresAt = new Date(new Date().getTime() + expiresIn * 1000);
    sessionStorage.setItem('tokenExpires', expiresAt.toISOString());
}; 