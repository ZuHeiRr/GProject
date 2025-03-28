const express = require("express");

const router = express.Router();
const { protect } = require("../middelwares/authMiddleware");
const {
    addFavorite,
    getFavorites,
    removeFavorite,
} = require("../services/favoriteService");

// @desc    Add to favorites
// @route   POST /api/v1/favorites
router.post("/", protect, addFavorite);

// @desc    Get user favorites
// @route   GET /api/v1/favorites
router.get("/", protect, getFavorites);

// @desc    Remove from favorites
// @route   DELETE /api/v1/favorites/:id
router.delete("/:id", protect, removeFavorite);

module.exports = router;
