const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
    name: String,
    description: String,
    icon: String, // URL icon
    type: {
        type: String,
        enum: ["spent", "orders"],
        required: true,
        default: "spent",
    },
    threshold: { type: Number, required: true },
});

module.exports = mongoose.model('Badge', badgeSchema);
