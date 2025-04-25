const mongoose = require("mongoose");

const passwordResetTokenSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true, expires: 0 } // Automatically delete after expiration
});

module.exports = mongoose.model("PasswordResetToken", passwordResetTokenSchema);