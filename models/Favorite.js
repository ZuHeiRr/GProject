const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
    {
        // User: The user who added the item to favorites
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Item: The favorite item, which can be either a Product or a Course
        item: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "itemType", // Dynamically references  'Product'
        },

        // Item Type: Defines whether the item is a Product or a Course
        itemType: {
            type: String,
            required: true,
            enum: ["Product"],
        },
    },
    { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

module.exports = mongoose.model("Favorite", favoriteSchema);
