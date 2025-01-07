const express = require("express");
const FoodLog = require("../models/FoodLog");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Extract token after 'Bearer'

  console.log("token....",token);
  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    const verified = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_secret_key"
    );
    req.user = verified;
    next();
  } catch (error) {
    console.log("Token verification failed:", error); // Log the error
    res.status(400).json({ error: "Invalid token" });
  }
};

// Add Food Log
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { date, foodItems } = req.body;
    const log = new FoodLog({ userId: req.user.id, date, foodItems });
    await log.save();
    res.status(201).json({ message: "Food log added" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add food log" });
  }
});

// Get Logs by Date
router.get("/:date", authenticateToken, async (req, res) => {
  try {
    const logs = await FoodLog.find({
      userId: req.user.id,
      date: req.params.date,
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

// Update a specific food item in the log
router.patch("/:logId/:foodItemId", authenticateToken, async (req, res) => {
  try {
    const { logId, foodItemId } = req.params;
    const { name, calories, quantity } = req.body;

    const log = await FoodLog.findById(logId);
    if (!log) return res.status(404).json({ error: "Log not found" });

    const foodItem = log.foodItems.id(foodItemId);
    if (!foodItem)
      return res.status(404).json({ error: "Food item not found" });

    foodItem.name = name || foodItem.name;
    foodItem.calories = calories || foodItem.calories;
    foodItem.quantity = quantity || foodItem.quantity;

    await log.save();
    res.json({ message: "Food item updated", log });
  } catch (err) {
    res.status(500).json({ error: "Failed to update food item" });
  }
});

// Delete a specific food item from the log
router.delete("/:logId/:foodItemId", authenticateToken, async (req, res) => {
  try {
    const { logId, foodItemId } = req.params;

    // Find the log by its ID
    const log = await FoodLog.findById(logId);
    if (!log) return res.status(404).json({ error: "Log not found" });

    // Filter out the food item to delete from the foodItems array
    const updatedFoodItems = log.foodItems.filter(item => item.id !== foodItemId);

    // Update the log's foodItems array
    log.foodItems = updatedFoodItems;

    // If no food items are left in the log, you may want to delete the log
    if (log.foodItems.length === 0) {
      await FoodLog.deleteOne({ _id: logId });  // Delete the entire log if no items remain
      return res.json({ message: "Food log deleted as it had no remaining items" });
    }

    // Save the updated log
    await log.save();
    res.json({ message: "Food item deleted", log });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete food item" });
  }
});



module.exports = router;
