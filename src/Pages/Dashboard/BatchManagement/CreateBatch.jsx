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

  const fetchNextBatchNumber = async (courseId) => {
    if (!courseId) {
      toast.error("Please select a course first.");
      return "001"; // Default fallback
    }
  
    try {
      const response = await fetch(
        `http://localhost:5000/next-batch-number/${courseId}`
      );
      
      if (!response.ok) throw new Error("Failed to fetch batch number");
      
      const data = await response.json();
      return data.nextBatchNumber || "001"; // Fallback to "001" if empty
    } catch (error) {
      console.error("Error:", error);
      toast.error("Using default batch number");
      return "001"; // Default fallback
    }
  };
  

  const handleCourseSelect = async (e) => {
    const selectedCourseId = e.target.value;
    setSelectedCourse(selectedCourseId);
  
    // Find course name from the selected course
    const course = courses.find((course) => course._id === selectedCourseId);
    if (course) {
      setSelectedCourseName(course.courseName);
    }
  
    // Fetch batch number for the selected course
    const nextBatch = await fetchNextBatchNumber(selectedCourseId);
    setBatchNumber(nextBatch || "001"); // Default to "001" if fetching fails
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!selectedCourse) {
      toast.error("Please select a course.");
      return;
    }
  
    let currentBatchNumber = batchNumber;
    if (!currentBatchNumber) {
      currentBatchNumber = await fetchNextBatchNumber(selectedCourse);
      if (!currentBatchNumber) return;
    }
  
    const formData = new FormData(e.target);
    const seatCount = formData.get("seat");
  
    const batchName = `${selectedCourseName} - ${currentBatchNumber}`;
  
    const data = {
      course_id: selectedCourse,
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
  
      toast.success("Batch created successfully!");
      e.target.reset();
      setSelectedCourse("");
      setSelectedCourseName("");
      setBatchNumber("");
  
    } catch (error) {
      console.error("Error submitting batch:", error);
      toast.error("Failed to create batch. Please try again.");
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
