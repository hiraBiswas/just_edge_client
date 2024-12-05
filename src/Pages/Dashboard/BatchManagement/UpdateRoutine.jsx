import React, { useState, useEffect } from "react";

const UpdateRoutine = ({ batchId, routine, closeModal, updateRoutine }) => {
  const [localSchedule, setLocalSchedule] = useState([]);
  const daysOfWeek = [
    "Saturday",
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ];

  useEffect(() => {
    // Initialize local schedule with the existing routine
    if (routine) {
      setLocalSchedule(routine.schedule || []);
    }
  }, [routine]);

  // Handle changes in form fields (local state)
  const handleChange = (index, field, value) => {
    const updatedSchedule = [...localSchedule];
    updatedSchedule[index][field] = value;
    setLocalSchedule(updatedSchedule);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Send the updated schedule to the parent (BatchDetails) via the updateRoutine function
    updateRoutine(localSchedule);  // This sends data back to BatchDetails only when "Update Routine" is clicked
    closeModal(); // Close the modal after update
  };

  return (
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
  );
};

export default UpdateRoutine;
