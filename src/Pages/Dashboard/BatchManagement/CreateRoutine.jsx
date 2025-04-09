import React, { useState, useEffect } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { toast as parentToast } from "react-toastify";
import { Toaster, toast } from "react-hot-toast";

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

  const [batchName, setBatchName] = useState("");
  const [existingSchedules, setExistingSchedules] = useState({});
  const [numDays, setNumDays] = useState(2);
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
  const [instructorAssignmentStep, setInstructorAssignmentStep] =
    useState(true);
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
        toast.error("Failed to load batch data");
      }
    };

    const fetchAvailableInstructors = async () => {
      try {
        const response = await axiosSecure.get("/instructors");
        setAvailableInstructors(response.data);
      } catch (error) {
        console.error("Error fetching available instructors:", error);
        toast.error("Failed to load available instructors");
      }
    };

    fetchBatchData();
    fetchAvailableInstructors();
  }, [batchId, axiosSecure]);

  // Handle instructor selection
  const handleInstructorSelection = (instructorId, isSelected) => {
    if (isSelected) {
      setSelectedInstructors((prev) => [...prev, instructorId]);
    } else {
      setSelectedInstructors((prev) =>
        prev.filter((id) => id !== instructorId)
      );
    }
  };

  // Submit instructor assignments
  const assignInstructorsToBatch = async () => {
    if (selectedInstructors.length === 0) {
      toast.error("Please select at least one instructor");
      return;
    }

    try {
      setLoading(true);
      const response = await axiosSecure.patch(`/batches/${batchId}`, {
        instructorIds: selectedInstructors,
      });

      if (response.data.success) {
        toast.success("Instructors assigned successfully");
        setInstructorIds(selectedInstructors);
        setInstructorAssignmentStep(false);
      } else {
        toast.error(response.data.message || "Failed to assign instructors");
      }
    } catch (error) {
      console.error("Error assigning instructors:", error);
      toast.error("Failed to assign instructors to batch");
    } finally {
      setLoading(false);
    }
  };

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

  const checkInstructorAvailability = async () => {
    console.log("Checking instructor availability");
    const newConflicts = [];
    const allExistingSchedules = {}; // Store existing schedules by day
    const daysWithMaxClasses = new Set(); // Track days that have max classes

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

          // Store existing schedule data
          Object.entries(instructorSchedule).forEach(([day, classes]) => {
            if (!allExistingSchedules[day]) {
              allExistingSchedules[day] = [];
            }
            allExistingSchedules[day].push(...classes);
          });

          // Check each day in the schedule for conflicts
          schedule.forEach((scheduleEntry) => {
            const { day, startTime, endTime } = scheduleEntry;
            if (!day || !startTime || !endTime) return;

            // Check for max class limit first
            if (classCounts[day] >= 2) {
              const conflict = `Instructor already has maximum classes (2) on ${day}`;
              if (!newConflicts.includes(conflict)) {
                newConflicts.push(conflict);
                daysWithMaxClasses.add(day);
              }
              return; // Skip time conflict check if max classes reached
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
                    `Instructor has time conflict on ${day}: ` +
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

      // Show toast for each conflict
      conflicts.forEach((conflict) => {
        console.log("Showing conflict toast:", conflict);
        toast.error(conflict, { duration: 5000 });
      });

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

    // Validate day selection (only checking for duplicates and max classes)
    if (field === "day" && value) {
      // Check for duplicate days in current form immediately
      const isDuplicateInForm = updatedSchedule.some(
        (entry, i) => i !== index && entry.day === value && value !== ""
      );

      if (isDuplicateInForm) {
        console.log("Duplicate day in form detected");
        toast.error(`Already has a class scheduled for ${value} in this form`);
        return;
      }

      // Check if day has reached maximum classes
      const checkMaxClasses = async () => {
        try {
          if (instructorIds.length > 0) {
            const instructorId = instructorIds[0];
            const response = await axiosSecure.get(
              `/instructors/${instructorId}/classes`
            );

            if (
              response.data.success &&
              response.data.classCounts[value] >= 2
            ) {
              console.log(`Maximum classes detected for ${value}`);
              toast.error(
                `Instructor already has maximum classes (2) on ${value}`
              );
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
        toast.error("End time must be after start time");
        return;
      }

      // Then check for time conflicts with existing classes
      const checkTimeConflicts = async () => {
        try {
          if (instructorIds.length > 0) {
            const day = updatedSchedule[index].day;
            const startTime = updatedSchedule[index].startTime;
            const endTime = updatedSchedule[index].endTime;

            const instructorId = instructorIds[0];
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
                  console.log(`Time conflict detected on ${day}`);
                  toast.error(
                    `Instructor has time conflict on ${day}: ` +
                      `Existing class at ${existingClass.startTime}-${existingClass.endTime} ` +
                      `conflicts with ${startTime}-${endTime}`
                  );
                  break;
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
  };

  // Enhanced validation useEffect
  useEffect(() => {
    // Skip validation if in instructor assignment step or if the form is not substantially filled
    if (instructorAssignmentStep) {
      return;
    }

    const hasSubstantialData = schedule.some(
      ({ day, startTime, endTime }) =>
        day !== "" || startTime !== "" || endTime !== ""
    );

    if (!hasSubstantialData || instructorIds.length === 0) {
      return;
    }

    console.log("Running validation useEffect");

    // Keep track of whether the component is mounted
    let isMounted = true;

    const validateEntries = async () => {
      // Run validation checks
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

              // Show toast notifications for conflicts
              conflicts.forEach((conflict) => {
                toast.error(conflict);
              });
            }
          } catch (error) {
            console.error("Error in validation:", error);
            if (isMounted) {
              toast.error("Failed to validate schedule");
            }
          }
        }
      }
    };

    // Use debounce to avoid excessive validation calls
    const timeoutId = setTimeout(() => {
      validateEntries();
    }, 300); // Shorter timeout for better responsiveness

    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [schedule, instructorIds, instructorAssignmentStep]);

  // Updated handleSubmit to prevent submission if there are errors
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submission started");
    setLoading(true);

    try {
      // Ensure there's at least one instructor
      if (instructorIds.length === 0) {
        toast.error("At least one instructor must be assigned to the batch");
        setLoading(false);
        return;
      }

      // Perform local validation
      console.log("Validating before submission");
      const validationErrors = validateLocalSchedule();
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
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
        console.log("Batch submission successful");
        parentToast.success(
          response.data.message || "Routine created successfully!"
        );
        onSuccess(); // Refresh routines
        closeModal(); // Close modal
      } else {
        throw new Error(response.data.message || "Failed to create routine");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create routine"
      );

      if (error.response?.data?.error?.code === 11000) {
        toast.error("Duplicate routine detected. Please check your entries.");
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

      {/* Display validation errors */}
      {/* {(errors.length > 0 || instructorConflicts.length > 0) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-sm text-sm">
          <h3 className="text-red-600 font-medium mb-1">
            Please correct the following:
          </h3>
          <ul className="list-disc pl-5">
            {errors.map((error, i) => (
              <li key={`error-${i}`} className="text-red-600">
                {error}
              </li>
            ))}
            {instructorConflicts.map((conflict, i) => (
              <li key={`conflict-${i}`} className="text-red-600">
                {conflict}
              </li>
            ))}
          </ul>
        </div>
      )} */}

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

      <Toaster position="top-center" reverseOrder={false} />
    </form>
  );
};

export default CreateRoutine;
