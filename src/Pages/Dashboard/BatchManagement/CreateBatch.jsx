import React, { useEffect, useState } from "react";
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import useAxiosSecure from "../../../hooks/useAxiosSecure"; 

const CreateBatch = ({ onBatchCreated, onCloseModal }) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedCourseName, setSelectedCourseName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [fetchingBatchNumber, setFetchingBatchNumber] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosSecure.get("/courses?isDeleted=false");
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Error fetching courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [axiosSecure]);

  const fetchNextBatchNumber = async (courseId) => {
    if (!courseId) {
      toast.error("Please select a course first.");
      return "001";
    }

    try {
      const response = await axiosSecure.get(`/next-batch-number/${courseId}`);
      return response.data.nextBatchNumber || "001";
    } catch (error) {
      console.error("Error:", error);
      toast.error("Using default batch number");
      return "001";
    }
  };

  const handleCourseSelect = async (e) => {
    const selectedCourseId = e.target.value;
    setSelectedCourse(selectedCourseId);

    const course = courses.find((course) => course._id === selectedCourseId);
    if (course) {
      setSelectedCourseName(course.courseName);
    }

    const nextBatch = await fetchNextBatchNumber(selectedCourseId);
    setBatchNumber(nextBatch);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!selectedCourse) {
      toast.error("Please select a course.");
      return;
    }
  
    try {
      setFetchingBatchNumber(true);
      let currentBatchNumber = batchNumber;
      if (!currentBatchNumber) {
        currentBatchNumber = await fetchNextBatchNumber(selectedCourse);
        if (!currentBatchNumber) return;
      }
  
      const batchName = `${selectedCourseName} - ${currentBatchNumber}`;
  
      const batchData = {
        course_id: selectedCourse,
        batchName,
        batchNumber: currentBatchNumber,
        startDate: e.target.startDate.value,
        endDate: e.target.endDate.value,
        seat: parseInt(e.target.seat.value),
        isDeleted: false,
        occupiedSeat: 0,
        status: "Upcoming",
      };
  
      const response = await axiosSecure.post("/batches", batchData);
      
      // Updated success condition check
      if (response.status === 201 || response.data.insertedId) {
        toast.success("Batch created successfully!");
        e.target.reset();
        setSelectedCourse("");
        setSelectedCourseName("");
        setBatchNumber("");


          onBatchCreated?.();
     onCloseModal?.(); 
        
        return response.data;
      } else {
        throw new Error(response.data?.error || "Failed to create batch");
      }
    } catch (error) {
      console.error("Error submitting batch:", error);
      toast.error(error.response?.data?.error || error.message || "Failed to create batch. Please try again.");
    } finally {
      setFetchingBatchNumber(false);
    }
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };



  return (
    <div className="p-6 bg-white">

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
              courses
                .filter((course) => course.isDeleted === false) // Only show non-deleted courses
                .map((course) => (
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
  className="btn bg-blue-950 text-white w-full"
  disabled={fetchingBatchNumber || !selectedCourse }
>
  {fetchingBatchNumber ? "Creating..." : "Create Batch"}
</button>
      </form>
      
      <Toaster position="top-center" />
    </div>
  );
};

export default function CreateBatchWrapper() {
  return <CreateBatch />;
}
