import React, { useState, useEffect } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { toast as parentToast } from "react-toastify"; // Parent toast for success message
import { Toaster, toast } from "react-hot-toast";

// Helper: Convert time string to minutes for easier comparison
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

// Helper: Check if two time ranges overlap
const hasTimeOverlap = (start1, end1, start2, end2) => {
  const start1Mins = timeToMinutes(start1);
  const end1Mins = timeToMinutes(end1);
  const start2Mins = timeToMinutes(start2);
  const end2Mins = timeToMinutes(end2);

  return (
    (start1Mins >= start2Mins && start1Mins < end2Mins) ||
    (end1Mins > start2Mins && end1Mins <= end2Mins) ||
    (start1Mins <= start2Mins && end1Mins >= end2Mins) ||
    (start2Mins <= start1Mins && end2Mins >= end1Mins)
  );
};

const CreateRoutine = ({ batchId, closeModal, fetchRoutines }) => {
  const [batchName, setBatchName] = useState("");
  const [numDays, setNumDays] = useState(2);
  const [schedule, setSchedule] = useState(
    Array.from({ length: numDays }, () => ({ day: "", startTime: "", endTime: "" }))
  );
  const [loading, setLoading] = useState(false);
  const [instructorIds, setInstructorIds] = useState([]);
  const axiosSecure = useAxiosSecure();

  // Fetch batch data and instructor IDs
  useEffect(() => {
    const fetchBatchData = async () => {
      try {
        const response = await axiosSecure.get(`/batches/${batchId}`);
        const batchData = response.data;
        setBatchName(batchData.batchName);
        setInstructorIds(batchData.instructorIds);
      } catch (error) {
        console.error("Error fetching batch data:", error);
      }
    };

    fetchBatchData();
  }, [batchId, axiosSecure]);

  // Handle change in the number of days
  const handleDaysChange = (event) => {
    const value = parseInt(event.target.value, 10);
    setNumDays(value);
    setSchedule(
      Array.from({ length: value }, () => ({ day: "", startTime: "", endTime: "" }))
    );
  };

  // Check for duplicate days
  const isDuplicateDay = (day, index) => {
    return schedule.some((entry, i) => entry.day === day && i !== index);
  };

  const validateSchedule = async (currentSchedule = schedule) => {
    try {
      const response = await axiosSecure.get(`/instructors/${instructorIds[0]}/classes`);
      const instructorSchedule = response.data.schedule;
      const conflicts = [];
  
      currentSchedule.forEach((newClass) => {
        const { day: newDay, startTime: newStartTime, endTime: newEndTime } = newClass;
  
        if (!newDay || !newStartTime || !newEndTime) return;
  
        // Get all existing classes for the current day
        const existingClassesOnDay = Object.entries(instructorSchedule).filter(([key]) =>
          key.startsWith(newDay)
        );
  
        // Check time conflicts with existing classes
        existingClassesOnDay.forEach(([timeKey, classDetails]) => {
          const [existingStartTime, existingEndTime] = timeKey
            .replace(`${newDay} `, "")
            .split(" - ");
  
          if (hasTimeOverlap(newStartTime, newEndTime, existingStartTime, existingEndTime)) {
            conflicts.push({
              message: `Time conflict on ${newDay}.Adjust and try again`,
              day: newDay,
              timeRange: `${newStartTime}-${newEndTime}`,
              conflictsWith: `${existingStartTime}-${existingEndTime}`,
            });
          }
        });
      });
  
      console.log("Validation results:", { currentSchedule, conflicts });
      return conflicts;
    } catch (error) {
      console.error("Error validating schedule:", error);
      toast.error("Error validating schedule.");
      return [];
    }
  };

  
// Separate function to check maximum classes per day
const checkMaxClassesPerDay = async (day) => {
  try {
    const response = await axiosSecure.get(`/instructors/${instructorIds[0]}/classes`);
    const instructorSchedule = response.data.schedule;
    
    // Get all existing classes for the selected day
    const existingClassesOnDay = Object.entries(instructorSchedule).filter(([key]) =>
      key.startsWith(day)
    );

    if (existingClassesOnDay.length >= 2) {
      return {
        hasError: true,
        message: `Instructor is not available ${day}.`
      };
    }

    return {
      hasError: false,
      message: ''
    };
  } catch (error) {
    console.error("Error checking max classes:", error);
    return {
      hasError: false,
      message: ''
    };
  }
};

// Modified handleChange function
const handleChange = async (index, field, value) => {
  console.log(`Changing field ${field} for index ${index} to value:`, value);
  const updatedSchedule = [...schedule];
  updatedSchedule[index][field] = value;

  let hasError = false;

  // Check duplicate days
  if (field === "day" && isDuplicateDay(value, index)) {
    toast.error("Already has class on this day.");
    console.log("Duplicate day detected:", value);
    hasError = true;
  }

  // Check maximum number of classes per day immediately when day changes
  if (field === "day") {
    const maxClassesCheck = await checkMaxClassesPerDay(value);
    if (maxClassesCheck.hasError) {
      toast.error(maxClassesCheck.message);
      console.log("Max classes limit exceeded for day:", value);
      hasError = true;
    }
  }

  // Check invalid end time
  if (field === "endTime" && updatedSchedule[index].startTime) {
    const startTime = updatedSchedule[index].startTime;
    if (value < startTime) {
      toast.error("End time must be after the start time.");
      console.log("Invalid end time:", value, "is before start time:", startTime);
      hasError = true;
    }
  }

  // Validate time conflicts only when time fields change
  if ((field === "startTime" || field === "endTime") && 
      updatedSchedule[index].day && 
      updatedSchedule[index].startTime && 
      updatedSchedule[index].endTime) {
    console.log("Validating time conflicts...");
    const conflicts = await validateSchedule(updatedSchedule);
    const timeConflicts = conflicts.filter(conflict => 
      conflict.message.includes("Time conflict")
    );
    if (timeConflicts.length > 0) {
      timeConflicts.forEach((conflict) => {
        console.log("Time conflict detected:", conflict);
        toast.error(conflict.message);
      });
      hasError = true;
    }
  }

  if (!hasError) {
    setSchedule(updatedSchedule);
  }
};
  

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const conflicts = await validateSchedule();
    if (conflicts.length > 0) {
      conflicts.forEach((conflict) => toast.error(conflict.message));
      setLoading(false);
      return;
    }

    try {
      const scheduleData = { batchId, schedule };
      const response = await axiosSecure.post("/routine", scheduleData);

      if (response.status === 201 || response.status === 200) {
        parentToast.success("Routine created successfully!");
        closeModal();
        fetchRoutines();
      } else {
        toast.error("Failed to create routine. Please try again.");
      }
    } catch (error) {
      console.error("Error creating routine:", error);
      toast.error(error.response?.data?.message || "Error creating routine.");
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek = [
    "Saturday",
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ];

  const resetForm = () => {
    setBatchName("");
    setNumDays(2);
    setSchedule(
      Array.from({ length: 2 }, () => ({ day: "", startTime: "", endTime: "" }))
    );
  };

  useEffect(() => {
    return () => resetForm();
  }, []);

  return (
    <form className="text-black p-5" onSubmit={handleSubmit}>
      <h3 className="text-center font-semibold text-black text-xl">Create Routine</h3>

      <div className="mb-4 mt-4 flex items-center gap-3">
        <label htmlFor="numDays" className="block text-sm font-medium">
          Number of Days:
        </label>
        <select
          id="numDays"
          value={numDays}
          onChange={handleDaysChange}
          className="mt-1 px-4 py-2 border border-gray-300 rounded"
        >
          {[2, 3, 4].map((num) => (
            <option key={num} value={num}>
              {num} Days
            </option>
          ))}
        </select>
      </div>

      {schedule.map((daySchedule, index) => (
        <div key={index} className="mb-4">
          <div className="grid grid-cols-3 gap-4">
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

      <div className="flex justify-center">
        <button type="submit" className="btn bg-blue-950 text-white" disabled={loading}>
          {loading ? (
            <>Saving <span className="loading loading-dots loading-md"></span></>
          ) : (
            "Save Routine"
          )}
        </button>
      </div>

      <Toaster position="top-center" reverseOrder={false} />
    </form>
  );
};

export default CreateRoutine;
