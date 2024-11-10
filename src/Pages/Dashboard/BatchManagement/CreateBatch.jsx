import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify'; // Import ToastContainer here
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS for the toast notifications

const CreateBatch = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  // Error handling state
  const [startDate, setStartDate] = useState("");  // To track the selected start date
  
  // Get the current date in the format YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0]; // Get today's date

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:5000/courses');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const selectedCourseId = formData.get('courseName');
    const batchNumberInput = formData.get('batchNumber');
    
    // Find the selected course object to retrieve its name
    const course = courses.find(course => course._id === selectedCourseId);
    const courseName = course ? course.courseName : "Unknown Course";
    
    // Format the batch name as "CourseName - BatchName"
    const formattedBatchName = `${courseName} - ${batchNumberInput}`;
    
    // Prepare data to send to backend
    const data = {
      course_id: selectedCourseId,  // Use course_id instead of courseId
      batchName: formattedBatchName,
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      isDeleted: false,
      enrolledStudentNumber: 0,
      status: "Soon to be started"
    };
  
    try {
      // Sending data to the backend (POST request to /batches)
      const response = await fetch('http://localhost:5000/batches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        throw new Error('Failed to create batch');
      }
  
      const result = await response.json();
      
      // Show success toast notification
      toast.success("Batch created successfully!"); 
  
      // Clear the form
      e.target.reset(); // Reset form fields
      
      // Reset the selected course state
      setSelectedCourse(""); 
  
      console.log("Batch created:", result);
    } catch (error) {
      console.error("Error submitting batch:", error);
      setError("Failed to create batch. Please try again later.");
      
      // Show error toast notification
      toast.error("Failed to create batch. Please try again later.");
    }
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);  // Update start date when changed
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Create New Batch</h2>
      
      {error && <div className="text-red-500">{error}</div>}  {/* Display error message */}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Course Name */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Course Name</label>
          <select
            name="courseName"
            className="select select-bordered w-full"
            required
            defaultValue=""
            onChange={(e) => setSelectedCourse(e.target.value)}
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
          <label className="block text-gray-700 font-medium mb-2">Batch Number</label>
          <input
            type="text"
            name="batchNumber"
            className="input input-bordered w-full"
            placeholder="Enter batch number"
            required
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Start Date</label>
          <input
            type="date"
            name="startDate"
            className="input input-bordered w-full"
            required
            min={today}  // Disable past dates
            onChange={handleStartDateChange}  // Update start date state
          />
        </div>

        {/* Estimated End Date */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Estimated End Date</label>
          <input
            type="date"
            name="endDate"
            className="input input-bordered w-full"
            required
            min={startDate || today}  // Ensure end date is >= start date
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn bg-blue-950 text-white mt-4">
          Create Batch
        </button>
      </form>
    </div>
  );
};

// Add ToastContainer to show toast messages
export default function CreateBatchWrapper() {
  return (
    <>
      <CreateBatch />
      <ToastContainer />  {/* Add ToastContainer here */}
    </>
  );
}
