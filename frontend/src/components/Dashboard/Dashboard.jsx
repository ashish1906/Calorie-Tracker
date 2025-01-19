import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AddFoodForm from "./AddFoodForm"; // Assuming this component exists

const Dashboard = ({ setIsAuthenticated }) => {
  const [logs, setLogs] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // New state for delete confirmation modal
  const [currentItem, setCurrentItem] = useState(null);
  const [currentLogId, setCurrentLogId] = useState(null); 
  const [foodItemToDelete, setFoodItemToDelete] = useState(null); // Track the item to delete
  const token = localStorage.getItem("calorie");
  const navigate = useNavigate();

  const fetchLogs = async () => {
    if (!token) {
      setError("No token found!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`https://calorie-tracker-2.onrender.com/api/logs/${date}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch logs. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("calorie");
    setIsAuthenticated(false);
    navigate("/login");
  };

  const handleUpdateFoodItem = async (logId, foodItemId, updatedData) => {
    if (!token) {
      setError("No token found!");
      return;
    }
    try {
      const response = await axios.patch(
        `https://calorie-tracker-2.onrender.com/api/logs/${logId}/${foodItemId}`,
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchLogs(); 
      setIsModalOpen(false); 
    } catch (err) {
      setError("Failed to update food item. Please try again later.");
      console.error(err);
    }
  };

  const calculateTotalCalories = () => {
    return logs.reduce((total, log) => {
      return (
        total +
        log.foodItems.reduce((logTotal, item) => {
          return logTotal + item.calories * item.quantity;
        }, 0)
      );
    }, 0);
  };

  const handleDeleteFoodItem = async () => {
    if (!token || !foodItemToDelete) return;

    try {
      const { logId, foodItemId } = foodItemToDelete;
      const response = await axios.delete(
        `https://calorie-tracker-2.onrender.com/api/logs/${logId}/${foodItemId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchLogs();
      setIsDeleteModalOpen(false); // Close the delete confirmation modal
    } catch (err) {
      setError("Failed to delete food item. Please try again later.");
      console.error(err);
    }
  };

  const openDeleteModal = (logId, foodItemId) => {
    setFoodItemToDelete({ logId, foodItemId });
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setFoodItemToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const openModal = (logId, item) => {
    setCurrentLogId(logId); 
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
    setCurrentLogId(null);
  };

  useEffect(() => {
    fetchLogs();
  }, [date]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Calorie Tracker Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 focus:ring-2 focus:ring-red-400"
          >
            Logout
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={fetchLogs}
            className="mt-4 md:mt-0 md:ml-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 focus:ring-2 focus:ring-blue-400"
          >
            Refresh Logs
          </button>
        </div>

        <AddFoodForm date={date} onLogAdded={fetchLogs} />

        {loading && <p className="text-center text-blue-500 mt-4">Loading logs...</p>}
        {error && <p className="text-center text-red-500 mt-4">{error}</p>}
        {!loading && !error && logs.length === 0 && (
          <p className="text-center text-gray-500 mt-4">No logs found for this date.</p>
        )}

        <ul className="space-y-4 mt-6">
          {logs.map((log) => (
            <li
              key={log._id}
              className="bg-gray-100 rounded-lg shadow p-4 hover:bg-gray-200 transition"
            >
              <h3 className="text-lg font-semibold text-gray-700">{log.date}</h3>
              <div className="mt-2 space-y-2">
                {log.foodItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm"
                  >
                    <p className="text-gray-700 font-medium">{item.name}</p>
                    <p className="text-gray-600">
                      {item.calories} calories (x{item.quantity})
                    </p>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => openModal(log._id, item)} 
                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-400"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => openDeleteModal(log._id, item._id)} // Open delete confirmation modal
                        className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 focus:ring-2 focus:ring-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>

        {!loading && !error && logs.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-700 text-center">
              Total Calories Consumed: {calculateTotalCalories()} kcal
            </h2>
          </div>
        )}

        {/* Modal for Update */}
        {isModalOpen && currentItem && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-2xl font-semibold mb-4">Update Food Item</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    id="name"
                    type="text"
                    defaultValue={currentItem.name}
                    onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                    className="border border-gray-300 rounded-lg p-2 w-full"
                  />
                </div>
                <div>
                  <label htmlFor="calories" className="block text-sm font-medium text-gray-700">Calories</label>
                  <input
                    id="calories"
                    type="number"
                    defaultValue={currentItem.calories}
                    onChange={(e) => setCurrentItem({ ...currentItem, calories: e.target.value })}
                    className="border border-gray-300 rounded-lg p-2 w-full"
                  />
                </div>
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    id="quantity"
                    type="number"
                    defaultValue={currentItem.quantity}
                    onChange={(e) => setCurrentItem({ ...currentItem, quantity: e.target.value })}
                    className="border border-gray-300 rounded-lg p-2 w-full"
                  />
                </div>
                <div className="flex justify-end mt-4 space-x-4">
                  <button
                    onClick={closeModal}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() =>
                      handleUpdateFoodItem(currentLogId, currentItem._id, { 
                        name: currentItem.name,
                        calories: currentItem.calories,
                        quantity: currentItem.quantity,
                      })
                    }
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Delete Confirmation */}
        {isDeleteModalOpen && foodItemToDelete && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-2xl font-semibold mb-4">Are you sure you want to delete this food item?</h2>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={closeDeleteModal}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteFoodItem}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
