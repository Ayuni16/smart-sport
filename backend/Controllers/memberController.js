

const Member = require('../Models/memberModel');
const Player = require('../Models/PlayerModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/email'); // Assuming you have this utility for password reset

// Helper function to generate a JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};


const generateNextClubId = async () => {
    let clubId;
    let isUnique = false;

    
    while (!isUnique) {
        
        const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
        
        
        clubId = `C-${randomNumber}`;
        
       
        const existingMember = await Member.findOne({ clubId });
        
       
        if (!existingMember) {
            isUnique = true;
        }
    }
    return clubId;
};
// =================================================================================


// 1. CREATE a new member (Register)
const registerMember = async (req, res) => {
   const { 
        firstName, lastName, age, nic, gender, role, email, contactNumber, password, confirmPassword 
    } = req.body;

    if (!firstName || !lastName || !email || !contactNumber|| !password || !nic ) {
        return res.status(400).json({ message: 'Please fill all required fields' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match!' });
    }
    try {
        const userExists = await Member.findOne({ $or: [{ email }, { nic }] });
        if (userExists) {
            return res.status(400).json({ message: 'Member with this Email or NIC already exists' });
        }
        
        // new Club ID 
        const clubId = await generateNextClubId();

        const newMember = new Member({
            firstName, lastName, gender, age, nic, email, contactNumber, password, role, clubId, 
        });
        
        const savedMember = await newMember.save();

        if (savedMember) {
            res.status(201).json({ message: 'Registration Successful! Please log in.' });
        } else {
             res.status(400).json({ message: 'Invalid member data' });
        }
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

// 2. Login a member
const loginMember = async (req, res) => {
    const { email, password } = req.body;
    try {
        const member = await Member.findOne({ email });
        
        if (member && (await member.matchPassword(password))) {
             res.status(200).json({
                _id: member._id,
                clubId: member.clubId,
                name: `${member.firstName} ${member.lastName}`,
                email: member.email,
                role: member.role,
                contactNumber: member.contactNumber,
                token: generateToken(member._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid Email or Password' });
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error while logging in.' });
    }
};

// 3. Get logged-in user's full profile (Member + Player data)
const getMyUserProfile = async (req, res) => {
    try {
        const memberDetails = await Member.findById(req.user.id).select('-password');
        const playerProfiles = await Player.find({ member: req.user.id });
        if (!memberDetails) return res.status(404).json({ message: "User not found." });
        res.status(200).json({ memberDetails, playerProfiles });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Server error while fetching profile data." });
    }
};

// 4. Update logged-in user's basic details (Member-level info)
const updateMyUserProfile = async (req, res) => {
    try {
        const member = await Member.findById(req.user.id);
        if (member) {
            member.firstName = req.body.firstName || member.firstName;
            member.lastName = req.body.lastName || member.lastName;
            member.email = req.body.email || member.email;
            
            const updatedMember = await member.save({ validateModifiedOnly: true });

            res.status(200).json({
                _id: updatedMember._id,
                clubId: updatedMember.clubId,
                name: `${updatedMember.firstName} ${updatedMember.lastName}`,
                email: updatedMember.email,
                role: updatedMember.role,
                token: generateToken(updatedMember._id)
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ message: 'Server error while updating profile.' });
    }
};

// 5. Delete the logged-in user's entire account
const deleteMyUserProfile = async (req, res) => {
    try {
        const member = await Member.findById(req.user.id);
        if (!member) return res.status(404).json({ message: "User not found." });

        await Player.deleteMany({ member: req.user.id }); // Delete associated player profiles
        await member.deleteOne(); // Delete the member

        res.status(200).json({ message: "Account has been permanently deleted." });
    } catch (error) {
        console.error("Error deleting user profile:", error);
        res.status(500).json({ message: "Server error while deleting account." });
    }
};

// 6. READ all members (for admin use)
const getAllMembers = async (req, res) => {
    try {
        const members = await Member.find({});
        res.status(200).json(members);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- PASSWORD RESET FUNCTIONS (Future implementation) ---
// 7. FORGOT PASSWORD
const forgotPassword = async (req, res) => {
    res.status(501).json({ message: "Forgot Password feature is not implemented yet." });
};
// 8. RESET PASSWORD
const resetPassword = async (req, res) => {
    res.status(501).json({ message: "Reset Password feature is not implemented yet." });
};

// Final exports for all functions
module.exports = {
    registerMember,
    loginMember,
    getMyUserProfile,
    updateMyUserProfile,
    deleteMyUserProfile,
    getAllMembers,
    forgotPassword,
    resetPassword
};