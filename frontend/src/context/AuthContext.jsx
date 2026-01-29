import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if token exists
        const token = localStorage.getItem('token');
        if (token) {
            // Decode token to get user role/id if possible, or just assume logged in for now.
            // Ideally we would hit a /me endpoint, but we can decode the JWT locally or trust it until 401.
            // For this MVP, we'll try to decode assuming standard structure or just set user state.
            // Let's implement a simple decode or just store user info in localStorage on login.
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        // Step 1: Login to get OTP flow started
        const res = await api.post('/auth/login', { username, password });
        return res.data; // Should return "OTP Sent" or error
    };

    const verifyOtp = async (otp) => {
        const res = await api.post('/auth/verify-otp', { otp });
        const { token } = res.data;
        if (token) {
            localStorage.setItem('token', token);
            // We need to know who the user is. The token has it.
            // Let's decode it safely without library if possible, or just rely on backend response if we change it.
            // For now, we will interpret the token payload BASE64.
            const payload = JSON.parse(atob(token.split('.')[1]));
            const userData = { id: payload.id, role: payload.role };

            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return userData.role;
        }
        return null;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, verifyOtp, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
