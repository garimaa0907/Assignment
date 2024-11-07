const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim:true
    },
    lastName: {
        type: String,
        required: true,
        trim:true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim:true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        trim:true
    },
    password: {
        type: String,
        required: true,
        trim:true
    },
    status: {
        type : String,
        enum: ['approve', 'reject', 'block', 'active', 'delete', 'pending'], // Enum values
    },
    role: {
        type: String
    }

}, { timestamps: true })

module.exports = mongoose.model("User", userSchema)