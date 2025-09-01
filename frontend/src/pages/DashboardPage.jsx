// frontend/src/pages/DashboardPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PlayerEditModal from '../components/PlayerEditModal';

const DashboardPage = () => {
    // Hooks and states from your existing code
    const { user, logout, login } = useContext(AuthContext); 
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeView, setActiveView] = useState('accountDetails');

    // Data fetching function
    const fetchProfileData = async () => {
        setLoading(true);
        setError('');
        
        try {
            // Tries to get the token from localStorage even if context isn't ready
            const token = user?.token || JSON.parse(localStorage.getItem('userInfo'))?.token;

            if (!token) {
                // If the token doesn't exist anywhere, the user is not logged in
                logout(); // Clean up as a precaution
                navigate('/login');
                return;
            }

            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('/api/members/my-profile', config);
            
            setProfileData(data); // Set state on successful data fetch

        } catch (err) {
            console.error("Dashboard - Profile Fetch Error:", err);
            setError('Failed to fetch your profile data.');
            if (err.response?.status === 401) { // If the token is invalid (Unauthorized)
                logout();
                navigate('/login');
            }
        } finally {
            // Always stops loading, whether it succeeds or fails
            setLoading(false);
        }
    };
    
    // useEffect Hook to fetch data on component mount
    useEffect(() => {
        // Fetches data only once when the component mounts
        fetchProfileData();
    }, []); // Empty dependency array ensures this runs only once

    // Function to handle profile updates
    const onProfileUpdate = (updatedUserData) => {
        login(updatedUserData); 
        fetchProfileData(); // Refetch data to show updated info
    };

    // Function to handle user logout
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    
    // --- Render Logic ---

    // 1. First, check the loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <h1 className="text-2xl font-bold">Loading Your Profile...</h1>
            </div>
        );
    }

    // 2. Then, check the error state
    if (error) {
        return <div className="text-center text-red-500 p-10 font-bold">{error}</div>;
    }

    // 3. Finally, check if data and its memberDetails exist
    if (!profileData || !profileData.memberDetails) {
        return <div className="text-center p-10 font-bold">Could not display profile information. Please try again.</div>;
    }

    // Renders the full UI only after all the above checks pass
    return (
        <div className="flex flex-col md:flex-row gap-8 p-4 md:p-8 bg-gray-50 min-h-screen">
            {/* --- Left Sidebar --- */}
            <aside className="w-full md:w-64 flex-shrink-0">
                <div className="bg-white p-6 rounded-lg shadow-md h-full">
                    <div className="text-center mb-6">
                        <img src={profileData.memberDetails.profilePicture || "https://i.pravatar.cc/150"} alt="Profile" className="w-24 h-24 rounded-full mx-auto mb-2 border-4 border-gray-200" />
                        <h2 className="text-xl font-bold">{profileData.memberDetails.firstName} {profileData.memberDetails.lastName}</h2>
                        <p className="text-sm text-gray-500 capitalize">{profileData.memberDetails.role}</p>
                    </div>
                    <nav className="space-y-2">
                        <button onClick={() => setActiveView('accountDetails')} className={`w-full text-left p-3 rounded font-semibold transition-colors ${activeView === 'accountDetails' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-100'}`}>Account Details</button>
                        <button onClick={handleLogout} className="w-full text-left p-3 rounded font-semibold transition-colors text-red-600 hover:bg-red-50">Logout</button>
                    </nav>
                </div>
            </aside>

            {/* --- Main Content Area --- */}
            <main className="flex-grow">
                <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
                    {activeView === 'accountDetails' && 
                        <AccountDetails 
                            profile={profileData} 
                            onProfileUpdate={onProfileUpdate} 
                            refetchSports={fetchProfileData} 
                        />
                    }
                </div>
            </main>
        </div>
    );
};


// --- Account Details Sub-component (Error Fixed and Fully Implemented) ---
const AccountDetails = ({ profile, onProfileUpdate, refetchSports }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    
    const [formData, setFormData] = useState({
        firstName: profile.memberDetails.firstName || '',
        lastName: profile.memberDetails.lastName || '',
        email: profile.memberDetails.email || '',
        age: profile.memberDetails.age || '',
        gender: profile.memberDetails.gender || '',
        nic: profile.memberDetails.nic || ''
    });

    const handleMemberUpdate = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put('/api/members/my-profile', formData, config);
            alert("Profile updated successfully!");
            onProfileUpdate(data);
            setIsEditing(false);
        } catch (error) {
            console.error("Profile update failed:", error);
            alert("Update failed. Please try again.");
        }
    };
    
    const handleDeleteSport = async (profileId) => {
        if (window.confirm("Are you sure you want to delete this sport profile?")) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.delete(`/api/players/profile/${profileId}`, config);
                alert("Sport profile deleted successfully.");
                refetchSports(); // Refetch all data to update the UI
            } catch (error) {
                console.error("Failed to delete sport profile:", error);
                alert("Failed to delete sport profile.");
            }
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("Are you sure you want to delete your account permanently? This action cannot be undone.")) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.delete('/api/members/my-profile', config);
                alert("Your account has been deleted successfully.");
                logout();
                navigate('/register');
            } catch (error) {
                console.error("Failed to delete account:", error);
                alert("Failed to delete account.");
            }
        }
    };

    return (
        <div>
            {/* Member details edit section */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Account Details</h2>
                <button 
                    onClick={() => setIsEditing(!isEditing)} 
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
            </div>
            
            <form onSubmit={handleMemberUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <input type="text" disabled={!isEditing} value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input type="text" disabled={!isEditing} value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" disabled={!isEditing} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100" />
                    </div>
                     {user?.clubId && (
                         <div>
                             <p>Club ID</p>
                             <span>{user.clubId}</span>
                         </div>
                    )}
                </div>
                {isEditing && (
                    <button type="submit" className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors">
                        Save Changes
                    </button>
                )}
            </form>

            
            {/* Replaced placeholder (...) with actual JSX to display player profiles */}
            {profile.playerProfiles && profile.playerProfiles.length > 0 && (
                <div className="mt-8 border-t pt-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Your Player Profiles</h3>
                    <div className="space-y-4">
                        {profile.playerProfiles.map((p) => (
                            <div key={p._id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center shadow-sm">
                                <div>
                                    <p className="font-semibold text-lg capitalize">{p.sport}</p>
                                    <p className="text-sm text-gray-600">Position: {p.position}</p>
                                    <p className="text-sm text-gray-600">Skill Level: {p.skillLevel}</p>
                                </div>
                                <button
                                    onClick={() => handleDeleteSport(p._id)}
                                    className="text-red-500 hover:text-red-700 font-semibold"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Delete Account Section */}
            <div className="mt-8 border-t-2 border-red-200 pt-6">
                <h3 className="text-xl font-bold text-red-600">Delete Account</h3>
                <p className="text-gray-600 mt-2 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                </p>
                <button
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                    Delete My Account Permanently
                </button>
            </div>
        </div>
    );
};

export default DashboardPage;