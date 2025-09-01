// frontend/src/pages/LoginPage.jsx

import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { user, login } = useContext(AuthContext);

   //log and naviigate dashboard
    useEffect(() => {
        if (user) navigate('/dashboard');
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            const config = { headers: { 'Content-Type': 'application/json' } };
            const { data } = await axios.post('/api/members/login', { email, password }, config);
            if (data && data.token) {
                login(data);
                navigate('/dashboard');
            } else {
                setError('Login failed. Invalid response from server.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
                {error && <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
                
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                        placeholder="you@example.com"
                    />
                </div>
                
                <div className="mb-6">
                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    />
                </div>
                
                <button type="submit" disabled={isSubmitting} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors disabled:bg-gray-400">
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                </button>

                <div className="text-center mt-6">
                    <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                        Forgot Password?
                    </Link>
                </div>
            </form>
        </div>
    );
};
export default LoginPage;