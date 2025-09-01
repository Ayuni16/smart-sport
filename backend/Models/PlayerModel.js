

const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    // Link to the original member in the 'members' collection
    member: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Member' },
    clubId: { type: String, required: true },
    fullName: { type: String, required: true },
    
    // The sport they are registering for
    sportName: { type: String, required: true },
    
    // New fields requested by you
    dateOfBirth: { type: Date, required: true },
    
   
    contactNumber: { type: String, required: true },

    emergencyContactName: { type: String, required: true },
    emergencyContactNumber: { type: String, required: true },
    skillLevel: { 
        type: String, 
        required: true,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Professional'] 
    },

    
    healthHistory: { type: String, required: false },

}, { timestamps: true });

const Player = mongoose.model('Player', playerSchema);
module.exports = Player;