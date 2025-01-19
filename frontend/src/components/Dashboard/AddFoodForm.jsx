import React, { useState } from 'react';
import axios from 'axios';

const AddFoodForm = ({ date, onLogAdded }) => {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [quantity, setQuantity] = useState('');
  const token = localStorage.getItem('calorie');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(token);
    try {
      const foodItem = { name, calories: Number(calories), quantity: Number(quantity) };
      await axios.post(
        'https://calorie-tracker-2.onrender.com/api/logs',
        { date, foodItems: [foodItem] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onLogAdded(); // Refresh the logs
      setName('');
      setCalories('');
      setQuantity('');
    } catch (err) {
      console.error('Failed to add food log:', err);
    }
  };

  return (
    <form
      className="bg-white shadow-md rounded-lg p-6 w-full max-w-md mx-auto border border-gray-200"
      onSubmit={handleSubmit}
    >
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Add Food Item</h3>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Food Name</label>
        <input
          type="text"
          placeholder="Enter food name"
          className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Calories</label>
        <input
          type="number"
          placeholder="Enter calories"
          className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Quantity</label>
        <input
          type="number"
          placeholder="Enter quantity"
          className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white font-medium rounded-lg p-3 w-full hover:bg-blue-600 transition duration-200"
      >
        Add Food
      </button>
    </form>
  );
};

export default AddFoodForm;
