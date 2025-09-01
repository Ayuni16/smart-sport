// frontend/src/components/PlayerRegistrationModal.jsx

import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const PlayerRegistrationModal = ({ sportName, onClose }) => {
    const { user } = useContext(AuthContext); 
    const [formData, setFormData] = useState({
        fullName: '',
        clubId: '',
        dateOfBirth: '',
        contactNumber: '', 
        emergencyContactName: '',
        emergencyContactNumber: '',
        skillLevel: 'Beginner',
        healthHistory: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
   
    useEffect(() => {
        // ★★★ යාවත්කාලීන කළ කොටස ★★★
        // ලොග් වූ user ගේ තොරතුරු ලැබුණු විට, form එකේ අදාළ πεδ ස්වයංක්‍රීයව පිරවීම
        if(user) {
            setFormData(prev => ({
                ...prev, 
                fullName: user.name || '',
                clubId: user.clubId || '',
                contactNumber: user.contactNumber || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const registrationData = { ...formData, sportName };
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        
        try {
            const response = await axios.post('/api/players/register', registrationData, config);
            setSuccess(response.data.message || 'Successfully Registered!');
            setTimeout(() => {
                onClose(true); 
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4 text-center">Register for {sportName}</h2>
                
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">{error}</div>}
                {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-center">{success}</div>}

                {!success && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* ★★★ යාවත්කාලීන කළ Inputs ★★★ */}
                            {/* මෙම πεδ පරිශීලකයාට වෙනස් කළ නොහැකි ලෙස disabled කර ඇත */}
                            <div>
                               <label>Full Name*</label>
                               <input type="text" name="fullName" value={formData.fullName} required className="input-field bg-gray-100 cursor-not-allowed" disabled />
                            </div>
                            <div>
                               <label>Club ID*</label>
                               <input type="text" name="clubId" value={formData.clubId} required className="input-field bg-gray-100 cursor-not-allowed" disabled />
                            </div>
                            <div>
                               <label>Contact Number*</label>
                               <input type="tel" name="contactNumber" value={formData.contactNumber} required className="input-field bg-gray-100 cursor-not-allowed" disabled />
                            </div>
                            
                            {/* --- පහත πεδ පරිශීලකයා විසින් පිරවිය යුතුයි --- */}
                            <div>
                                <label>Date of Birth*</label>
                                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required className="input-field" />
                            </div>
                            <div>
                                <label>Emergency Contact Name*</label>
                                <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} required className="input-field" />
                            </div>
                            <div>
                                <label>Emergency Contact Number*</label>
                                <input type="tel" name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleChange} required className="input-field" />
                            </div>
                            <div>
                                <label>Skill Level*</label>
                                <select name="skillLevel" value={formData.skillLevel} onChange={handleChange} className="input-field">
                                    <option>Beginner</option>
                                    <option>Intermediate</option>
                                    <option>Advanced</option>
                                    <option>Professional</option>
                                </select>
                            </div>
                        </div>
                       <div>
    <label>Health History (Optional)</label>
    <textarea 
        name="healthHistory" 
        value={formData.healthHistory} 
        onChange={handleChange} 
        className="input-field" 
        rows="3"
        placeholder="your injuries or health issues" 
    ></textarea>
</div>
                        <div className="flex justify-end space-x-4 pt-4">
                            <button type="button" onClick={() => onClose(false)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded">Cancel</button>
                            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Submit Registration</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default PlayerRegistrationModal;