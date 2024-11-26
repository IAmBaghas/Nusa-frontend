export const checkToken = () => {
    const token = localStorage.getItem('token');
    return !!token;
};

export const clearToken = () => {
    localStorage.removeItem('token');
}; 