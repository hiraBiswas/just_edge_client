import React, { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const CreateBatch = ({ onBatchCreated }) => {
  // State management
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    selectedCourse: "",
    selectedCourseName: "",
    batchNumber: "",
    startDate: "",
    endDate: "",
    seat: "",
  });
  const [loading, setLoading] = useState({
    courses: true,
    batchNumber: false,
    submission: false,
  });
  const [error, setError] = useState(null);

  // Constants
  const today = new Date().toISOString().split("T")[0];
  const axiosSecure = useAxiosSecure();

  // Data fetching
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosSecure.get("/courses?isDeleted=false");
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Error fetching courses. Please try again later.");
        setError("Failed to load courses");
      } finally {
        setLoading((prev) => ({ ...prev, courses: false }));
      }
    };

    fetchCourses();
  }, [axiosSecure]);

  // Helper functions
  const fetchNextBatchNumber = async (courseId) => {
    if (!courseId) {
      toast.error("Please select a course first.");
      return "001";
    }

    try {
      setLoading((prev) => ({ ...prev, batchNumber: true }));
      const response = await axiosSecure.get(`/next-batch-number/${courseId}`);
      return response.data.nextBatchNumber || "001";
    } catch (error) {
      console.error("Error:", error);
      toast.error("Using default batch number");
      return "001";
    } finally {
      setLoading((prev) => ({ ...prev, batchNumber: false }));
    }
  };

  // Event handlers
  const handleCourseSelect = async (e) => {
    const selectedCourseId = e.target.value;
    const course = courses.find((c) => c._id === selectedCourseId);

    setFormData({
      ...formData,
      selectedCourse: selectedCourseId,
      selectedCourseName: course?.courseName || "",
    });

    if (selectedCourseId) {
      const nextBatch = await fetchNextBatchNumber(selectedCourseId);
      setFormData((prev) => ({ ...prev, batchNumber: nextBatch }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.selectedCourse) {
      toast.error("Please select a course.");
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, submission: true }));

      const batchName = `${formData.selectedCourseName} - ${formData.batchNumber}`;
      const batchData = {
        course_id: formData.selectedCourse,
        batchName,
        batchNumber: formData.batchNumber,
        startDate: formData.startDate,
        endDate: formData.endDate,
        seat: parseInt(formData.seat),
        isDeleted: false,
        occupiedSeat: 0,
        status: "Upcoming",
      };

      const response = await axiosSecure.post("/batches", batchData);

      if (response.status === 201 || response.data.insertedId) {
        toast.success("Batch created successfully!");

        // Reset form
        setFormData({
          selectedCourse: "",
          selectedCourseName: "",
          batchNumber: "",
          startDate: "",
          endDate: "",
          seat: "",
        });

        // Call callbacks
        onBatchCreated?.();
      } else {
        throw new Error(response.data?.error || "Failed to create batch");
      }
    } catch (error) {
      console.error("Error submitting batch:", error);
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Failed to create batch. Please try again."
      );
    } finally {
      setLoading((prev) => ({ ...prev, submission: false }));
    }
  };

  return (
    <div className="p-6 bg-white">
      <h2 className="text-2xl text-center font-bold mb-4">Create New Batch</h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Course Selection */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Course Name
          </label>
          <select
            name="selectedCourse"
            className="select select-bordered w-full"
            required
            value={formData.selectedCourse}
            onChange={handleCourseSelect}
            disabled={loading.courses}
          >
            <option value="" disabled>
              Select a course
            </option>
            {loading.courses ? (
              <option>Loading courses...</option>
            ) : (
              courses
                .filter((course) => !course.isDeleted)
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
            value={loading.batchNumber ? "Generating..." : formData.batchNumber}
            placeholder="Will be generated"
            disabled
          />
          <p className="text-sm text-gray-500 mt-1">
            Batch number is generated automatically
          </p>
        </div>

        {/* Batch Name Preview */}
        {formData.selectedCourseName && formData.batchNumber && (
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Batch Name Preview
            </label>
            <div className="py-2 px-4 bg-gray-100 rounded">
              {formData.selectedCourseName} - {formData.batchNumber}
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
            value={formData.seat}
            onChange={handleInputChange}
            placeholder="Enter seat count"
            required
            min="1"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              className="input input-bordered w-full"
              value={formData.startDate}
              onChange={handleInputChange}
              min={today}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              className="input input-bordered w-full"
              value={formData.endDate}
              onChange={handleInputChange}
              min={formData.startDate || today}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn bg-blue-950 text-white w-full"
          disabled={loading.submission || !formData.selectedCourse}
        >
          {loading.submission ? "Creating..." : "Create Batch"}
        </button>
      </form>

      <Toaster position="top-center" />
    </div>
  );
};

export default CreateBatch;
