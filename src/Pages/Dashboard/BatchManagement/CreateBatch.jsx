import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateBatch = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedCourseName, setSelectedCourseName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [fetchingBatchNumber, setFetchingBatchNumber] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("http://localhost:5000/courses");
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError("Error fetching courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const fetchNextBatchNumber = async () => {
    setFetchingBatchNumber(true);
    setError(null); // Clear any previous errors

    try {
      console.log("Requesting next batch number...");
      const response = await fetch(
        "http://localhost:5000/batches/next-batch-number"
      );
      console.log("Response received:", response.status);

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      console.log("Batch number data:", data);

      if (data.error) {
        throw new Error(data.error);
      }

      setBatchNumber(data.nextBatchNumber);
      return data.nextBatchNumber; // Return the batch number for use in submit
    } catch (error) {
      console.error("Error fetching next batch number:", error);
      setError("Failed to generate batch number. Please try again.");
      toast.error("Failed to generate batch number. Please try again later.");
      return null;
    } finally {
      setFetchingBatchNumber(false);
    }
  };

  const handleCourseSelect = (e) => {
    const selectedCourseId = e.target.value;
    setSelectedCourse(selectedCourseId);

    // Find the selected course name from the courses array
    const course = courses.find((course) => course._id === selectedCourseId);
    if (course) {
      setSelectedCourseName(course.courseName);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If we don't have a batch number yet, fetch it first
    let currentBatchNumber = batchNumber;
    if (!currentBatchNumber) {
      currentBatchNumber = await fetchNextBatchNumber();
      if (!currentBatchNumber) return; // Exit if batch number generation failed
    }

    const formData = new FormData(e.target);
    const selectedCourseId = formData.get("courseName");
    const seatCount = formData.get("seat");

    // Create batchName by concatenating course name with batch number
    const batchName = `${selectedCourseName} - ${currentBatchNumber}`;

    const data = {
      course_id: selectedCourseId,
      batchName: batchName,
      batchNumber: currentBatchNumber,
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      seat: seatCount,
      isDeleted: false,
      occupiedSeat: 0,
      status: "Upcoming",
    };

    try {
      const response = await fetch("http://localhost:5000/batches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create batch");
      }

      const result = await response.json();
      toast.success("Batch created successfully!");
      e.target.reset();
      setSelectedCourse("");
      setSelectedCourseName("");
      setBatchNumber(""); // Clear batch number after successful submission

      console.log("Batch created:", result);
    } catch (error) {
      console.error("Error submitting batch:", error);
      setError("Failed to create batch. Please try again later.");
      toast.error("Failed to create batch. Please try again later.");
    }
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  // Since we want to auto-generate the batch number with form submission only,
  // let's remove the separate button and adjust the form accordingly
  return (
    <div className="p-6 bg-white">
      <ToastContainer position="bottom-right" />
      <h2 className="text-2xl text-center font-bold mb-4">Create New Batch</h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Course Name */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Course Name
          </label>
          <select
            name="courseName"
            className="select select-bordered w-full"
            required
            defaultValue=""
            onChange={handleCourseSelect}
          >
            <option value="" disabled>
              Select a course
            </option>
            {loading ? (
              <option>Loading courses...</option>
            ) : (
              courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.courseName}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Batch Number */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Batch Number
          </label>
          <input
            type="text"
            name="batchNumber"
            className="input input-bordered w-full"
            value={fetchingBatchNumber ? "Generating..." : batchNumber}
            placeholder="Will be generated on submit"
            disabled // Disable input, as it's auto-generated
          />
          <p className="text-sm text-gray-500 mt-1">
            Batch number will be generated automatically when you submit the
            form.
          </p>
        </div>

        {/* Display Batch Name preview */}
        {selectedCourseName && batchNumber && (
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Batch Name Preview
            </label>
            <div className="py-2 px-4 bg-gray-100 rounded">
              {selectedCourseName} - {batchNumber}
            </div>
          </div>
        )}

        {/* Seat */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Seat</label>
          <input
            type="number"
            name="seat"
            className="input input-bordered w-full"
            placeholder="Enter seat count"
            required
            min="1"
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Start Date
          </label>
          <input
            type="date"
            name="startDate"
            className="input input-bordered w-full"
            min={today}
            onChange={handleStartDateChange}
          />
        </div>

        {/* Estimated End Date */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Estimated End Date
          </label>
          <input
            type="date"
            name="endDate"
            className="input input-bordered w-full"
            min={startDate || today}
          />
        </div>

        <button
          type="submit"
          className="btn bg-blue-950 text-white mt-4"
          disabled={fetchingBatchNumber || !selectedCourse}
        >
          Create Batch
        </button>
      </form>
    </div>
  );
};

export default function CreateBatchWrapper() {
  return <CreateBatch />;
}
