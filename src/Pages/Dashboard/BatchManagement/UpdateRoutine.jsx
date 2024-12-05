import React, { useState, useEffect } from "react";
import useAxiosSecure from "./../../../hooks/useAxiosSecure";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const UpdateRoutine = ({ batchId, closeModal }) => {
  const [localSchedule, setLocalSchedule] = useState([]); // Store schedule data
  const [loading, setLoading] = useState(false); // Manage loading state
  const [error, setError] = useState(null); // Track error
  const axiosSecure = useAxiosSecure();
  // Validate batchId before sending the request
const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);


  const daysOfWeek = [
    "Saturday",
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ];

  // Function to fetch routine when component mounts or batchId changes
  useEffect(() => {
    if (batchId) {
      fetchRoutine();
    }
  }, [batchId]);

  // Function to fetch routine manually
  const fetchRoutine = async () => {
    if (!batchId) return; // Don't fetch if batchId is not provided

    setLoading(true);
    setError(null); // Reset error state before fetching

    try {
      const response = await axiosSecure.get(`/routine/${batchId}`);
      console.log('Response Data:', response.data); // Log response for debugging
      setLocalSchedule(response.data.schedule || []); // Store the schedule if found
    } catch (error) {
      console.error('Error fetching routine:', error);
      setError(error.message); // Set error state if fetching fails
    } finally {
      setLoading(false); // Set loading to false after the fetch
    }
  };

  // Handle changes in form fields (local state)
  const handleChange = (index, field, value) => {
    const updatedSchedule = [...localSchedule];
    updatedSchedule[index][field] = value;
    setLocalSchedule(updatedSchedule);
  };



const handleSubmit = async (e) => {
  e.preventDefault();

  if (!isValidObjectId(batchId)) {
    console.error('Invalid batchId format');
    alert('Invalid batchId format');
    return; // Exit the function if batchId is invalid
  }

  const fullUrl = `http://localhost:5000/routine/${batchId}`;  // Construct the full URL

  const updatedRoutineData = {
    schedule: localSchedule  // This should be passed to the backend
  };

  try {
    console.log('Full Request URL:', fullUrl);
    console.log('Request Payload:', updatedRoutineData);

    const response = await fetch(fullUrl, {
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedRoutineData)
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log('Full Response:', responseData);

      closeModal();
      toast.success("Routine updated successfully!");
    } else {
      const errorData = await response.json();
      console.error('Failed to update routine:', errorData);
      alert('Failed to update the routine. Check console for details.');
    }
  } catch (error) {
    console.error('Comprehensive Error:', {
      message: error.message,
      stack: error.stack
    });
    alert('An error occurred while updating the routine. Please check console for details.');
  }
};

  
  
  if (loading) {
    return <div>Loading...</div>; // Show loader while fetching
  }

  if (error) {
    return <div>Error: {error}</div>; // Display error if any occurs
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="p-5">
        <h3 className="text-xl font-semibold mb-4">Update Routine</h3>

        {/* Dynamically generate input fields for each schedule */}
        {localSchedule.map((daySchedule, index) => (
          <div key={index} className="mb-4">
            <div className="grid grid-cols-3 gap-4">
              {/* Day Selector */}
              <div>
                <label htmlFor={`day-${index}`} className="block text-sm font-medium">
                  Day {index + 1}
                </label>
                <select
                  id={`day-${index}`}
                  value={daySchedule.day}
                  onChange={(e) => handleChange(index, "day", e.target.value)}
                  className="mt-1 p-2 border border-gray-300 rounded"
                  required
                >
                  <option value="">Select a day</option>
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Time Input */}
              <div>
                <label htmlFor={`startTime-${index}`} className="block text-sm font-medium">
                  Start Time
                </label>
                <input
                  type="time"
                  id={`startTime-${index}`}
                  value={daySchedule.startTime}
                  onChange={(e) => handleChange(index, "startTime", e.target.value)}
                  className="mt-1 p-2 border border-gray-300 rounded"
                  required
                />
              </div>

              {/* End Time Input */}
              <div>
                <label htmlFor={`endTime-${index}`} className="block text-sm font-medium">
                  End Time
                </label>
                <input
                  type="time"
                  id={`endTime-${index}`}
                  value={daySchedule.endTime}
                  onChange={(e) => handleChange(index, "endTime", e.target.value)}
                  className="mt-1 p-2 border border-gray-300 rounded"
                  required
                />
              </div>
            </div>
          </div>
        ))}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-950 text-white rounded-md hover:bg-blue-900"
          >
            Update Routine
          </button>
        </div>
      </form>
      
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ width: '300px', height: 'auto', margin: '3px' }}
      />
    </div>
  );
};

export default UpdateRoutine;
