// frontend/src/pages/RegisterPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// ★★★ NIC එකෙන් වයස ගණනය කරන සහායක function එක ★★★
const calculateAgeFromNIC = (nic) => {
    let year, dayOfYear;
    if (nic.length === 12 && /^\d+$/.test(nic)) {
        year = parseInt(nic.substring(0, 4), 10);
        dayOfYear = parseInt(nic.substring(4, 7), 10);
    } else if (nic.length === 10 && /^\d{9}[vVxX]$/.test(nic)) {
        year = 1900 + parseInt(nic.substring(0, 2), 10);
        dayOfYear = parseInt(nic.substring(2, 5), 10);
    } else {
        return null; // Invalid format
    }

    if (dayOfYear > 500) { dayOfYear -= 500; }

    const birthDate = new Date(year, 0); 
    birthDate.setDate(dayOfYear);
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age >= 0 ? age : null;
};


const RegisterPage = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
   
    useEffect(() => {
        if (user) navigate('/dashboard');
    }, [user, navigate]);
    
    // ★★★ නව contactNumber πεδය සමඟ යාවත්කාලීන කළ State ★★★
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        age: '',
        nic: '',
        gender: 'Male',
        role: 'Member',
        email: '',
        contactNumber: '', // Contact number field එක එකතු කරන ලදී
        password: '',
        confirmPassword: ''
    });

    // ★★★ දෝෂ පණිවිඩ සඳහා නව State එක ★★★
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ★★★ NIC එක වෙනස් වන විට Age එක auto update කිරීම ★★★
    useEffect(() => {
        const calculatedAge = calculateAgeFromNIC(formData.nic);
        if (calculatedAge !== null) {
            setFormData(prev => ({ ...prev, age: calculatedAge.toString() }));
            if (errors.nic) setErrors(prev => ({ ...prev, nic: '' }));
        } else if (formData.nic) {
             setFormData(prev => ({ ...prev, age: '' }));
        }
    }, [formData.nic]);

    // ★★★ ඔබ ඉල්ලා සිටි සියලුම Validation නීති අඩංගු function එක ★★★
    const validateField = (name, value) => {
        switch (name) {
            case 'firstName':
            case 'lastName':
                return /^[A-Za-z\s]+$/.test(value) ? '' : 'Name must contain only letters and spaces.';
            case 'nic':
                const age = calculateAgeFromNIC(value);
                return age !== null ? '' : 'Invalid NIC format (e.g., 200212345678 or 991234567V).';
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Please enter a valid email address.';
            case 'contactNumber':
                return /^(0\d{9})$/.test(value) ? '' : 'Please enter a valid 10-digit number starting with 0.';
            case 'password':
                if (value.length !== 8) return 'Password must be exactly 8 characters long.';
                const passRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8}$/;
                return passRegex.test(value) ? '' : 'Must contain letters, numbers, and one special character.';
            case 'confirmPassword':
                return value === formData.password ? '' : 'Passwords do not match.';
            default:
                return '';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };
    
    const handleBlur = (e) => {
        const { name, value } = e.target;
        if(value) { // Only validate if the field is not empty
            const errorMessage = validateField(name, value);
            setErrors(prev => ({ ...prev, [name]: errorMessage }));
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // ★★★ Submit කිරීමට පෙර සම්පූර්ණ form එකම Validation කිරීම ★★★
        const validationErrors = {};
        Object.keys(formData).forEach(name => {
            const fieldElement = document.querySelector(`[name=${name}]`);
            if (fieldElement?.required && !formData[name]) {
                validationErrors[name] = 'This field is required.';
            } else {
                const errorMessage = validateField(name, formData[name]);
                if (errorMessage) validationErrors[name] = errorMessage;
            }
        });
        
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        setIsSubmitting(true);
        try {
            const response = await axios.post('/api/members/register', formData);
            if (response.status === 201) {
                alert('Registration Successful! Please proceed to login.');
                navigate('/login');
            }
        } catch (err) {
            setErrors({ form: err.response?.data?.message || 'Registration failed. Please check your details.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-4xl" noValidate>
                 <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create Your Account</h2>
                {errors.form && <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded mb-4 text-sm">{errors.form}</div>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <input name="firstName" value={formData.firstName} onChange={handleChange} onBlur={handleBlur} required className="mt-1 w-full px-3 py-2 border rounded-md" />
                        {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input name="lastName" value={formData.lastName} onChange={handleChange} onBlur={handleBlur} required className="mt-1 w-full px-3 py-2 border rounded-md" />
                        {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">NIC Number</label>
                        <input name="nic" value={formData.nic} onChange={handleChange} onBlur={handleBlur} required className="mt-1 w-full px-3 py-2 border rounded-md" />
                        {errors.nic && <p className="text-red-500 text-xs mt-1">{errors.nic}</p>}
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Age</label>
                        <input name="age" type="text" value={formData.age} readOnly required className="mt-1 w-full px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed" />
                        {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} className="mt-1 w-full px-3 py-2 border rounded-md bg-white"><option>Male</option><option>Female</option></select>
                     </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <select name="role" value={formData.role} onChange={handleChange} className="mt-1 w-full px-3 py-2 border rounded-md bg-white">
                           <option>Member</option>
                           <option>Player</option>
                           <option>Coach</option>
                        </select>
                     </div>
                     
                     {/* ★★★ Contact Number සඳහා නව input πεδය ★★★ */}
                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                        <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} onBlur={handleBlur} required className="mt-1 w-full px-3 py-2 border rounded-md" />
                        {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>}
                     </div>

                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} placeholder="you@example.com" required className="mt-1 w-full px-3 py-2 border rounded-md" />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} onBlur={handleBlur} required className="mt-1 w-full px-3 py-2 border rounded-md" />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur} required className="mt-1 w-full px-3 py-2 border rounded-md" />
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                     </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline disabled:bg-gray-400">
                    {isSubmitting ? 'Registering...' : 'Register'}
                </button>
            </form>
        </div>
    );
};
export default RegisterPage;