const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name: String,
  calories: Number,
  quantity: Number,
});

const foodLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  foodItems: [foodItemSchema],
});

const FoodLog = mongoose.model('FoodLog', foodLogSchema);

module.exports = FoodLog;
