import { useEffect, useState, useContext } from "react";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";
import { AuthContext } from "../../../../Providers/AuthProvider";
import toast from "react-hot-toast";

const EnrollmentRequests = () => {
  const { user } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();
  const [studentData, setStudentData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [availableBatches, setAvailableBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");

  useEffect(() => {
    if (user?._id) {
      axiosSecure.get("/students").then((res) => {
        const foundStudent = res.data.find((s) => s.userId === user._id);
        if (foundStudent) {
          setStudentData(foundStudent);

          axiosSecure.get("/users").then((userRes) => {
            const foundUser = userRes.data.find((u) => u._id === user._id);
            if (foundUser) {
              setUserData(foundUser);
            }
          });

          axiosSecure.get("/courses").then((courseRes) => {
            setCourses(courseRes.data);
          });

          axiosSecure.get("/batches").then((batchRes) => {
            setBatches(batchRes.data);

            // Find the current batch's course_id
            const currentBatch = batchRes.data.find(
              (batch) => batch._id === foundStudent.enrolled_batch
            );

            if (currentBatch) {
              const relatedBatches = batchRes.data.filter(
                (batch) =>
                  batch.course_id === currentBatch.course_id &&
                  batch._id !== foundStudent.enrolled_batch
              );
              setAvailableBatches(relatedBatches);
            }
          });
        }
      });
    }
  }, [user, axiosSecure]);


  const preferredCourseName =
    courses.find((course) => course._id === studentData?.prefCourse)
      ?.courseName || "N/A";

  const enrolledBatchName =
    batches.find((batch) => batch._id === studentData?.enrolled_batch)
      ?.batchName || "N/A";

  const handleSaveCourse = () => {
    if (!selectedCourse) return;

    axiosSecure
      .patch(`/students/${studentData._id}`, { prefCourse: selectedCourse })
      .then(() => {
        setStudentData((prev) => ({ ...prev, prefCourse: selectedCourse }));
        toast.success("Preferred course updated successfully!");
        document.getElementById("my_modal_3").close(); // Close modal after saving
      })
      .catch((err) => {
        console.error("Error updating preferred course:", err);
        toast.error("Failed to update preferred course!");
      });
  };




  const handleChangeBatch = () => {
    if (!selectedBatch) return;

    axiosSecure.get("/students").then((res) => {
      const foundStudent = res.data.find((s) => s.userId === user._id);
      if (foundStudent) {
        const batchRequest = {
          studentId: foundStudent._id,
          requestedBatch: selectedBatch,
          status: "Pending",
          timestamp: new Date().toISOString(),
        };

        axiosSecure
          .post("/batch-change-requests", batchRequest)
          .then(() => {
            toast.success("Batch change request submitted successfully!");
            document.getElementById("batch_modal").close();
          })
          .catch((err) => {
            console.error("Error submitting batch change request:", err);
            toast.error("Failed to submit batch change request!");
          });
      }
    });
  };


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Enrollment</h1>

      {studentData && userData ? (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Name</th>
              <th className="border border-gray-300 p-2">Student ID</th>
              <th className="border border-gray-300 p-2">Preferred Course</th>
              <th className="border border-gray-300 p-2">Enrolled Batch</th>
              <th className="border border-gray-300 p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">{userData.name}</td>
              <td className="border border-gray-300 p-2">
                {studentData.studentID}
              </td>
              <td className="border border-gray-300 p-2">
                {preferredCourseName}
              </td>
              <td className="border border-gray-300 p-2">
                {enrolledBatchName}
              </td>
              <td className="border border-gray-300 p-2">
                {studentData.enrolled_batch ? (
                  <>
                    <button className="btn btn-primary mr-2">
                      Change Course
                    </button>
                    <button
                  className="btn btn-secondary"
                  onClick={() =>
                    document.getElementById("batch_modal").showModal()
                  }
                >
                  Change Batch
                </button>
                  </>
                ) : (
                  <button
                    className="btn btn-warning"
                    onClick={() =>
                      document.getElementById("my_modal_3").showModal()
                    }
                  >
                    Change Preferred Course
                  </button>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      ) : (
        <p>Loading student data...</p>
      )}

      {/* Modal */}
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg mb-4">
            Select New Preferred Course
          </h3>
          <select
            className="w-full p-2 border rounded mb-4"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">Select a course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.courseName}
              </option>
            ))}
          </select>
          <div className="flex justify-end">
            <button
              className="btn btn-secondary mr-2"
              onClick={() => document.getElementById("my_modal_3").close()}
            >
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSaveCourse}>
              Save
            </button>
          </div>
        </div>
      </dialog>

       {/* Change Batch Modal */}
       <dialog id="batch_modal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg mb-4">Select New Batch</h3>
          <select
            className="w-full p-2 border rounded mb-4"
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
          >
            <option value="">Select a batch</option>
            {availableBatches.map((batch) => (
              <option key={batch._id} value={batch._id}>
                {batch.batchName}
              </option>
            ))}
          </select>
          <div className="flex justify-end">
            <button
              className="btn btn-secondary mr-2"
              onClick={() => document.getElementById("batch_modal").close()}
            >
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleChangeBatch}>
              Submit Request
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default EnrollmentRequests;