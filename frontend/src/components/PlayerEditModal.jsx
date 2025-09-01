import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const PlayerEditModal = ({ profile, onClose, onUpdate }) => {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        skillLevel: profile.skillLevel,
        emergencyContactName: profile.emergencyContactName,
        emergencyContactNumber: profile.emergencyContactNumber,
        phoneNumber: profile.phoneNumber
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`/api/players/profile/${profile._id}`, formData, config);
            alert("Update successful!");
            onUpdate();
            onClose();
        } catch (error) {
            alert("Update failed!");
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Edit Registration for {profile.sportName}</h2>
                 {/* ... form fields for skillLevel, phoneNumber, emergency contacts ... */}
                <div className="flex justify-end space-x-2 mt-4">
                    <button type="button" onClick={onClose}>Cancel</button>
                    <button type="submit">Save Changes</button>
                </div>
            </form>
        </div>
    );
};
export default PlayerEditModal;