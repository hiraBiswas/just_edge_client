import React, { useState, useEffect } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

// Helper: Convert time string to minutes for easier comparison
const timeToMinutes = (timeStr) => {
  console.log(`Converting time string to minutes: ${timeStr}`);
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

// Helper: Check if two time ranges overlap
const hasTimeOverlap = (start1, end1, start2, end2) => {
  console.log(
    `Checking time overlap between ${start1}-${end1} and ${start2}-${end2}`
  );
  const start1Mins = timeToMinutes(start1);
  const end1Mins = timeToMinutes(end1);
  const start2Mins = timeToMinutes(start2);
  const end2Mins = timeToMinutes(end2);

  const result =
    (start1Mins >= start2Mins && start1Mins < end2Mins) ||
    (end1Mins > start2Mins && end1Mins <= end2Mins) ||
    (start1Mins <= start2Mins && end1Mins >= end2Mins) ||
    (start2Mins <= start1Mins && end2Mins >= end1Mins);

  console.log(`Overlap result: ${result}`);
  return result;
};

const CreateRoutine = ({ batchId, closeModal, onSuccess }) => {
  console.log("CreateRoutine component rendering with batchId:", batchId);
  const [users, setUsers] = useState([]);
  const [batchName, setBatchName] = useState("");
  const [existingSchedules, setExistingSchedules] = useState({});
  const [numDays, setNumDays] = useState(2);
  const [errorsCleared, setErrorsCleared] = useState(false);
  const [schedule, setSchedule] = useState(
    Array.from({ length: numDays }, () => ({
      day: "",
      startTime: "",
      endTime: "",
    }))
  );
  const [loading, setLoading] = useState(false);
  const [instructorIds, setInstructorIds] = useState([]);
  const [availableInstructors, setAvailableInstructors] = useState([]);
  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const [errors, setErrors] = useState([]);
  const [instructorConflicts, setInstructorConflicts] = useState([]);
  const [validationMessages, setValidationMessages] = useState([]);
  const [instructorAssignmentStep, setInstructorAssignmentStep] = useState(true);
  const axiosSecure = useAxiosSecure();

  // Days of week array
  const daysOfWeek = [
    "Saturday",
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ];

  // Function to get instructor name by userId
  const getInstructorName = (instructorId) => {
    const instructor = availableInstructors.find((i) => i._id === instructorId);
    if (!instructor) return "Unknown Instructor";

    const user = users.find((u) => u._id === instructor.userId);
    return user ? user.name : "Unknown Instructor";
  };

  // Fetch batch data and available instructors
  useEffect(() => {
    console.log("useEffect for fetching batch data running");
    const fetchBatchData = async () => {
      try {
        console.log("Fetching batch data for batchId:", batchId);
        const response = await axiosSecure.get(`/batches/${batchId}`);
        console.log("Batch data response:", response.data);
        const batchData = response.data;
        setBatchName(batchData.batchName);

        // If batch already has instructors, set them
        if (batchData.instructorIds && batchData.instructorIds.length > 0) {
          setInstructorIds(batchData.instructorIds);
          setSelectedInstructors(batchData.instructorIds);
        }

        console.log("Set batchName to:", batchData.batchName);
      } catch (error) {
        console.error("Error fetching batch data:", error);
        setValidationMessages(["Failed to load batch data"]);
      }
    };

    const fetchAvailableInstructors = async () => {
      try {
        const response = await axiosSecure.get("/instructors");
        setAvailableInstructors(response.data);
      } catch (error) {
        console.error("Error fetching available instructors:", error);
        setValidationMessages(["Failed to load available instructors"]);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axiosSecure.get("/users");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchBatchData();
    fetchAvailableInstructors();
    fetchUsers();
  }, [batchId, axiosSecure]);

  // Handle change in the number of days
  const handleDaysChange = (event) => {
    const value = parseInt(event.target.value, 10);
    console.log("Number of days changed to:", value);
    setNumDays(value);
    setSchedule(
      Array.from({ length: value }, () => ({
        day: "",
        startTime: "",
        endTime: "",
      }))
    );
    console.log("Reset schedule for", value, "days");
    // Reset errors when changing days
    setErrors([]);
    setInstructorConflicts([]);
    setValidationMessages([]);
    console.log("Cleared errors and conflicts");
  };

  // Perform local validation without API checks
  const validateLocalSchedule = () => {
    console.log("Running local schedule validation");
    const newErrors = [];

    // Basic field validation
    schedule.forEach(({ day, startTime, endTime }, index) => {
      if (!day || !startTime || !endTime) {
        console.log(`Validation error: Day ${index + 1} missing fields`);
        newErrors.push(`Day ${index + 1}: All fields are required`);
        return;
      }

      if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
        console.log(
          `Validation error: Day ${index + 1} end time not after start time`
        );
        newErrors.push(`Day ${index + 1}: End time must be after start time`);
      }
    });

    // Check duplicate days in current schedule
    const days = schedule.map((s) => s.day).filter((d) => d !== "");
    const uniqueDays = new Set(days);
    if (uniqueDays.size !== days.length) {
      console.log("Validation error: Duplicate days found");
      newErrors.push("Cannot have multiple classes on the same day");
    }

    console.log("Local validation complete. Found errors:", newErrors);
    return newErrors;
  };

  // Update the checkInstructorAvailability function to use instructor names
  const checkInstructorAvailability = async () => {
    console.log("Checking instructor availability");
    const newConflicts = [];
    const allExistingSchedules = {};

    try {
      // Check each instructor
      for (const instructorId of instructorIds) {
        console.log(`Checking availability for instructor ${instructorId}`);
        const response = await axiosSecure.get(
          `/instructors/${instructorId}/classes`
        );

        if (response.data.success) {
          const instructorSchedule = response.data.schedule;
          const classCounts = response.data.classCounts || {};

          // Check each day in the schedule for conflicts
          schedule.forEach((scheduleEntry) => {
            const { day, startTime, endTime } = scheduleEntry;
            if (!day || !startTime || !endTime) return;

            // Check for max class limit first
            if (classCounts[day] >= 2) {
              const conflict = `${getInstructorName(
                instructorId
              )} already has maximum classes (2) on ${day}`;
              if (!newConflicts.includes(conflict)) {
                newConflicts.push(conflict);
              }
              return;
            }

            // Check for time conflicts
            if (instructorSchedule[day]) {
              instructorSchedule[day].forEach((existingClass) => {
                if (
                  hasTimeOverlap(
                    startTime,
                    endTime,
                    existingClass.startTime,
                    existingClass.endTime
                  )
                ) {
                  const conflict =
                    `${getInstructorName(
                      instructorId
                    )} has time conflict on ${day}: ` +
                    `Existing class at ${existingClass.startTime}-${existingClass.endTime} ` +
                    `conflicts with ${startTime}-${endTime}`;

                  if (!newConflicts.includes(conflict)) {
                    newConflicts.push(conflict);
                  }
                }
              });
            }
          });
        }
      }
    } catch (error) {
      console.error("Error checking instructor availability:", error);
      newConflicts.push("Failed to verify instructor availability");
    }

    return { conflicts: newConflicts, existingSchedules: allExistingSchedules };
  };

  // Enhanced validation function
  const validateAll = async () => {
    console.log("Running complete validation");
    const validationErrors = validateLocalSchedule();
    setErrors(validationErrors);
    console.log("Set validation errors:", validationErrors);

    // Only check instructor conflicts if local validation passes
    if (validationErrors.length === 0) {
      console.log("Local validation passed, checking instructor conflicts");
      const result = await checkInstructorAvailability();
      const conflicts = result.conflicts;
      setInstructorConflicts(conflicts);
      console.log("Set instructor conflicts:", conflicts);

      const isValid = conflicts.length === 0;
      console.log("Validation complete. Is valid?", isValid);
      return isValid;
    }

    console.log("Validation failed due to local errors");
    return false;
  };

  const handleChange = (index, field, value) => {
    console.log(
      `Handling change for index ${index}, field ${field}, value ${value}`
    );
    const updatedSchedule = [...schedule];
    
    // Store previous value for comparison
    const previousValue = updatedSchedule[index][field];
    updatedSchedule[index][field] = value;
  
    // Update the schedule state first for UI responsiveness
    setSchedule(updatedSchedule);
    
    // Clear errors and validation messages when a field changes
    // This ensures errors disappear as soon as the user starts fixing them
    setValidationMessages([]);
    setErrors([]);
    setInstructorConflicts([]);
    setErrorsCleared(true); // Set flag to prevent immediate re-validation
  
    // Validate day selection (only checking for duplicates and max classes)
    if (field === "day" && value) {
      // Check for duplicate days in current form immediately
      const isDuplicateInForm = updatedSchedule.some(
        (entry, i) => i !== index && entry.day === value && value !== ""
      );
  
      if (isDuplicateInForm) {
        console.log("Duplicate day in form detected");
        setValidationMessages([`Already has a class scheduled for ${value} in this form`]);
        return;
      }
  
      // Check if day has reached maximum classes
      const checkMaxClasses = async () => {
        try {
          if (instructorIds.length > 0) {
            // Check all instructors, not just the first one
            for (const instructorId of instructorIds) {
              const response = await axiosSecure.get(
                `/instructors/${instructorId}/classes`
              );
  
              if (
                response.data.success &&
                response.data.classCounts[value] >= 2
              ) {
                console.log(`Maximum classes detected for ${value}`);
                setValidationMessages([
                  `${getInstructorName(
                    instructorId
                  )} already has maximum classes (2) on ${value}`
                ]);
                break;
              }
            }
          }
        } catch (error) {
          console.error("Error checking day class count:", error);
        }
      };
  
      checkMaxClasses();
    }
  
    // Immediate time validation for both start and end time
    if (
      (field === "startTime" || field === "endTime") &&
      updatedSchedule[index].day &&
      updatedSchedule[index].startTime &&
      updatedSchedule[index].endTime
    ) {
      // First check if end time is after start time
      if (
        timeToMinutes(updatedSchedule[index].endTime) <=
        timeToMinutes(updatedSchedule[index].startTime)
      ) {
        console.log("End time validation failed");
        setValidationMessages(["End time must be after start time"]);
        return;
      }
  
      // Then check for time conflicts with existing classes
      const checkTimeConflicts = async () => {
        try {
          if (instructorIds.length > 0) {
            const day = updatedSchedule[index].day;
            const startTime = updatedSchedule[index].startTime;
            const endTime = updatedSchedule[index].endTime;
  
            for (const instructorId of instructorIds) {
              const response = await axiosSecure.get(
                `/instructors/${instructorId}/classes`
              );
  
              if (response.data.success && response.data.schedule[day]) {
                const existingClasses = response.data.schedule[day];
  
                for (const existingClass of existingClasses) {
                  if (
                    hasTimeOverlap(
                      startTime,
                      endTime,
                      existingClass.startTime,
                      existingClass.endTime
                    )
                  ) {
                    setValidationMessages([
                      `${getInstructorName(
                        instructorId
                      )} has time conflict on ${day}: ` +
                        `Existing class at ${existingClass.startTime}-${existingClass.endTime} ` +
                        `conflicts with ${startTime}-${endTime}`
                    ]);
                    return; // Stop checking after first conflict
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error("Error checking time conflicts:", error);
        }
      };
  
      checkTimeConflicts();
    }
  }

  // Enhanced validation useEffect
  useEffect(() => {
    // Skip validation if in instructor assignment step or if errors were just cleared
    if (instructorAssignmentStep || errorsCleared) {
      setErrorsCleared(false);
      return;
    }
  
    // Check if there's substantial data to validate
    const hasSubstantialData = schedule.some(
      ({ day, startTime, endTime }) => day !== "" || startTime !== "" || endTime !== ""
    );
  
    if (!hasSubstantialData || instructorIds.length === 0) {
      setValidationMessages([]);
      setErrors([]);
      setInstructorConflicts([]);
      return;
    }
  
    console.log("Running validation useEffect");
  
    // Keep track of whether the component is mounted
    let isMounted = true;
  
    const validateEntries = async () => {
      // Run local validation checks
      const localErrors = validateLocalSchedule();
  
      // Update errors only if component is still mounted
      if (isMounted) {
        setErrors(localErrors);
  
        // Only check with API if there are no local errors and all required fields are filled
        const allRequiredFieldsFilled = schedule.every(
          ({ day, startTime, endTime }) => day && startTime && endTime
        );
  
        if (localErrors.length === 0 && allRequiredFieldsFilled) {
          try {
            const { conflicts, existingSchedules: schedules } =
              await checkInstructorAvailability();
  
            // Only update state if component is still mounted
            if (isMounted) {
              setInstructorConflicts(conflicts);
              setExistingSchedules(schedules);
              setValidationMessages(conflicts);
            }
          } catch (error) {
            console.error("Error in validation:", error);
            if (isMounted) {
              setValidationMessages(["Failed to validate schedule"]);
            }
          }
        } else if (localErrors.length > 0) {
          // Show local errors if any
          setValidationMessages(localErrors);
        } else {
          // Clear messages if no errors and not all fields are filled
          setValidationMessages([]);
        }
      }
    };
  
    // Use debounce to avoid excessive validation calls
    const timeoutId = setTimeout(() => {
      validateEntries();
    }, 500); // 500ms debounce delay
  
    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [schedule, instructorIds, instructorAssignmentStep, errorsCleared]);



  // Updated handleSubmit to prevent submission if there are errors
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submission started");
    setLoading(true);
    setValidationMessages([]); // Clear previous messages

    try {
      // Ensure there's at least one instructor
      if (instructorIds.length === 0) {
        setValidationMessages(["At least one instructor must be assigned to the batch"]);
        setLoading(false);
        return;
      }

      // Perform local validation
      console.log("Validating before submission");
      const validationErrors = validateLocalSchedule();
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setValidationMessages(validationErrors);
        setLoading(false);
        return;
      }

      // Check instructor conflicts
      const { conflicts } = await checkInstructorAvailability();
      if (conflicts.length > 0) {
        setInstructorConflicts(conflicts);
        setValidationMessages(conflicts);
        setLoading(false);
        return;
      }

      // Prepare data for batch submission
      const routineData = {
        batchId,
        schedules: schedule.map((entry) => ({
          day: entry.day,
          startTime: entry.startTime,
          endTime: entry.endTime,
        })),
      };

      console.log("Submitting batch routine data:", routineData);
      const response = await axiosSecure.post("/routine", routineData);

      // Check for successful status code (2xx) instead of response.data.success
      if (response.status >= 200 && response.status < 300) {
        console.log("Routine submission successful");
        
        // Notify parent component of success
        if (onSuccess) onSuccess(response.data.message || "Routine created successfully!");
        
        // Close the modal
        closeModal();
      } else {
        throw new Error(response.data.message || "Failed to create routine");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setValidationMessages([
        error.response?.data?.message ||
          error.message ||
          "Failed to create routine"
      ]);

      if (error.response?.data?.error?.code === 11000) {
        setValidationMessages(["Duplicate routine detected. Please check your entries."]);
      }
    } finally {
      console.log("Submission process complete");
      setLoading(false);
    }
  };

  return (
    <form className="text-black p-5" onSubmit={handleSubmit}>
      <h3 className="text-center font-semibold text-black text-xl">
        Create Routine
      </h3>

      <div className="mb-4 mt-4 flex items-center gap-3">
        <label htmlFor="numDays" className="block text-sm font-medium">
          Number of Days:
        </label>
        <select
          id="numDays"
          value={numDays}
          onChange={handleDaysChange}
          className="mt-1 px-4 py-2 border border-gray-300 rounded-sm"
        >
          {[2, 3, 4].map((num) => (
            <option key={num} value={num}>
              {num} Days
            </option>
          ))}
        </select>
      </div>

      {/* Validation messages display */}
      {validationMessages.length > 0 && (
        <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
          {validationMessages.map((message, index) => (
            <p key={index} className="text-sm mb-1 last:mb-0">
              {message}
            </p>
          ))}
        </div>
      )}

      {schedule.map((daySchedule, index) => (
        <div key={index} className="mb-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label
                htmlFor={`day-${index}`}
                className="block text-sm font-medium"
              >
                Day {index + 1}
              </label>
              <select
                id={`day-${index}`}
                value={daySchedule.day}
                onChange={(e) => handleChange(index, "day", e.target.value)}
                className="mt-1 p-2 border border-gray-300 rounded-sm"
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
              <label
                htmlFor={`startTime-${index}`}
                className="block text-sm font-medium"
              >
                Start Time
              </label>
              <input
                type="time"
                id={`startTime-${index}`}
                value={daySchedule.startTime}
                onChange={(e) =>
                  handleChange(index, "startTime", e.target.value)
                }
                className="mt-1 p-2 border border-gray-300 rounded-sm"
                required
              />
            </div>

            <div>
              <label
                htmlFor={`endTime-${index}`}
                className="block text-sm font-medium"
              >
                End Time
              </label>
              <input
                type="time"
                id={`endTime-${index}`}
                value={daySchedule.endTime}
                onChange={(e) => handleChange(index, "endTime", e.target.value)}
                className="mt-1 p-2 border border-gray-300 rounded-sm"
                required
              />
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-center">
        <button
          type="submit"
          className="btn bg-blue-950 text-white"
          disabled={
            loading || errors.length > 0 || instructorConflicts.length > 0
          }
        >
          {loading ? (
            <>
              Saving <span className="loading loading-dots loading-md"></span>
            </>
          ) : (
            "Save Routine"
          )}
        </button>
      </div>
    </form>
  );
};

export default CreateRoutine;