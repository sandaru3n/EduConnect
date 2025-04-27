const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    senderRole: { type: String }, // Removed required: true
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const supportTicketSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userRole: { type: String }, // Removed required: true
    email: { type: String, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "SupportCategory", required: true },
    subcategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "SupportSubcategory", required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["Open", "Responded", "Closed"], default: "Open" },
    messages: [messageSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SupportTicket", supportTicketSchema);