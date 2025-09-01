

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');



const {
    registerMember,
    loginMember,
    getMyUserProfile,
    updateMyUserProfile,
    deleteMyUserProfile,
    getAllMembers,
    forgotPassword,
    resetPassword
} = require('../Controllers/memberController');


// PUBLIC ROUTES
router.post('/register', registerMember);
router.post('/login', loginMember);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// PROTECTED ROUTES
router.route('/my-profile')
    .get(protect, getMyUserProfile)
    .put(protect, updateMyUserProfile)
    .delete(protect, deleteMyUserProfile);

// ADMIN ROUTES
router.get('/', getAllMembers);


module.exports = router;