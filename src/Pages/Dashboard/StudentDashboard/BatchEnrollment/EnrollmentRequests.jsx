import { useEffect, useState, useContext } from "react";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";
import { AuthContext } from "../../../../Providers/AuthProvider";
import toast from "react-hot-toast";

const EnrollmentRequests = () => {
  const { user } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();
  const [studentData, setStudentData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [availableBatches, setAvailableBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [currentCourseId, setCurrentCourseId] = useState("");
  const [currentPrefCourse, setCurrentPrefCourse] = useState("");
  const [routineData, setRoutineData] = useState([]);
  const [instructorData, setInstructorData] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (user?._id) {
      axiosSecure.get("/students").then((res) => {
        const foundStudent = res.data.find((s) => s.userId === user._id);
        if (foundStudent) {
          setStudentData(foundStudent);
          setCurrentPrefCourse(foundStudent.prefCourse);

          axiosSecure.get("/courses").then((courseRes) => {
            setCourses(courseRes.data);
          });

          axiosSecure.get("/batches").then((batchRes) => {
            setBatches(batchRes.data);

            if (foundStudent.enrolled_batch) {
              const currentBatch = batchRes.data.find(
                (batch) => batch._id === foundStudent.enrolled_batch
              );

              if (currentBatch) {
                setCurrentCourseId(currentBatch.course_id);

                const relatedBatches = batchRes.data.filter(
                  (batch) =>
                    batch.course_id === currentBatch.course_id &&
                    batch._id !== foundStudent.enrolled_batch
                );
                setAvailableBatches(relatedBatches);
              }
            }
          });
        }
      });
    }
  }, [user, axiosSecure]);

  const fetchBatchDetails = async (batchId) => {
    try {
      setLoadingData(true);
      
      const [routineResponse, allAssignmentsRes, allInstructorsRes, allUsersRes] = await Promise.all([
        axiosSecure.get(`/routine/${batchId}`).catch(() => ({ data: [] })),
        axiosSecure.get("/instructors-batches").catch(() => ({ data: [] })),
        axiosSecure.get("/instructors").catch(() => ({ data: [] })),
        axiosSecure.get("/users").catch(() => ({ data: [] }))
      ]);
  
      const routines = routineResponse.data || [];
      
      const batchInstructorIds = allAssignmentsRes.data
        .filter(assignment => assignment?.batchId === batchId)
        .map(assignment => assignment?.instructorId)
        .filter(Boolean);
  
      const instructorsWithNames = allInstructorsRes.data
        .filter(instructor => batchInstructorIds.includes(instructor?._id))
        .map(instructor => {
          const user = allUsersRes.data.find(user => user?._id === instructor?.userId);
          return {
            ...instructor,
            name: user?.name || 'Unknown Instructor',
            email: user?.email || 'No email available'
          };
        });
  
      setRoutineData(routines);
      setInstructorData(instructorsWithNames);
      
    } catch (error) {
      console.error("Error fetching batch details:", error);
      toast.error("Failed to load batch information");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (studentData?.enrolled_batch) {
      fetchBatchDetails(studentData.enrolled_batch);
    }
  }, [studentData?.enrolled_batch]);

  const preferredCourseName =
    courses.find((course) => course._id === studentData?.prefCourse)
      ?.courseName || "N/A";

  const enrolledBatchName =
    batches.find((batch) => batch._id === studentData?.enrolled_batch)
      ?.batchName || "N/A";

  const handleCourseChangeRequest = () => {
    if (!selectedCourse) {
      toast.error("Please select a course");
      return;
    }

    const courseRequest = {
      studentId: studentData._id,
      requestedCourse: selectedCourse,
      status: "Pending",
      timestamp: new Date().toISOString()
    };

    axiosSecure.post("/course-change-requests", courseRequest)
      .then(() => {
        toast.success("Course change request submitted successfully!");
        document.getElementById("course_modal").close();
      })
      .catch((err) => {
        console.error("Error submitting course change request:", err);
        toast.error("Failed to submit course change request");
      });
  };

  const handleSaveCourse = () => {
    if (!selectedCourse) return;

    axiosSecure
      .patch(`/students/${studentData._id}`, { prefCourse: selectedCourse })
      .then(() => {
        setStudentData((prev) => ({ ...prev, prefCourse: selectedCourse }));
        setCurrentPrefCourse(selectedCourse);
        toast.success("Preferred course updated successfully!");
        document.getElementById("my_modal_3").close();
      })
      .catch((err) => {
        console.error("Error updating preferred course:", err);
        toast.error("Failed to update preferred course!");
      });
  };

  const handleChangeBatch = () => {
    if (!selectedBatch) return;

    const batchRequest = {
      studentId: studentData._id,
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
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Enrollment Management</h1>
      
      {/* Enrollment Status Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {studentData ? (
          <div className="space-y-6">
            {studentData.enrolled_batch ? (
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
                <h2 className="text-xl font-semibold text-blue-800 mb-4">Current Enrollment</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Course</p>
                    <p className="font-medium text-gray-800 text-lg">{preferredCourseName}</p>
                  </div>
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Batch</p>
                    <p className="font-medium text-gray-800 text-lg">{enrolledBatchName}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    className="btn bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={() => document.getElementById("course_modal").showModal()}
                  >
                    Request Course Change
                  </button>
                  <button
                    className="btn bg-gray-600 hover:bg-gray-700 text-white"
                    onClick={() => document.getElementById("batch_modal").showModal()}
                  >
                    Request Batch Change
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 p-5 rounded-lg border border-yellow-200">
                <h2 className="text-xl font-semibold text-yellow-800 mb-4">Preferred Course</h2>
                <div className="bg-white p-3 rounded-md shadow-sm mb-4 inline-block">
                  <p className="font-medium text-gray-800 text-lg">{preferredCourseName}</p>
                </div>
                <div>
                  <button
                    className="btn bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={() => document.getElementById("my_modal_3").showModal()}
                  >
                    Update Preferred Course
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center py-8">
            <p className="text-gray-500">Loading enrollment information...</p>
          </div>
        )}
      </div>

      {/* Batch Information Section */}
      {studentData?.enrolled_batch && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Batch Details</h2>
          
          {loadingData ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Schedule Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Class Schedule
                </h3>
                {routineData.length > 0 ? (
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="table w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3 px-4 text-left">Day</th>
                          <th className="py-3 px-4 text-left">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {routineData.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="py-3 px-4 border-t">{item.day}</td>
                            <td className="py-3 px-4 border-t">{item.startTime} - {item.endTime}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                    No schedule information available
                  </div>
                )}
              </div>

              {/* Instructors Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
                  </svg>
                  Instructors
                </h3>
                {instructorData.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {instructorData.map((instructor, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-white transition-colors">
                        <div className="avatar placeholder">
                          <div className="bg-indigo-100 text-indigo-600 rounded-full w-12">
                            <span className="font-medium">{(instructor?.name?.charAt(0) || '?')}</span>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{instructor?.name || 'Unknown Instructor'}</p>
                          <p className="text-sm text-gray-500">{instructor?.email || 'No email available'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                    No instructor information available
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {/* Preferred Course Selection Modal (for unenrolled students) */}
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box max-w-md">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="font-bold text-lg mb-4">Select New Preferred Course</h3>
          <select
            className="select select-bordered w-full mb-6"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">Select a course</option>
            {courses
              .filter(course => course._id !== currentPrefCourse)
              .map((course) => (
                <option key={course._id} value={course._id}>
                  {course.courseName}
                </option>
              ))}
          </select>
          <div className="modal-action">
            <button className="btn btn-ghost mr-2" onClick={() => document.getElementById("my_modal_3").close()}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSaveCourse}>
              Save Changes
            </button>
          </div>
        </div>
      </dialog>

      {/* Course Change Request Modal (for enrolled students) */}
      <dialog id="course_modal" className="modal">
        <div className="modal-box max-w-md">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="font-bold text-lg mb-4">Request Course Change</h3>
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Current Course: {preferredCourseName}</p>
            <select
              className="select select-bordered w-full"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">Select new course</option>
              {courses
                .filter(course => course._id !== currentCourseId)
                .map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.courseName}
                  </option>
                ))}
            </select>
          </div>
          <div className="modal-action">
            <button className="btn btn-primary" onClick={handleCourseChangeRequest}>
              Submit Request
            </button>
          </div>
        </div>
      </dialog>

      {/* Batch Change Request Modal */}
      <dialog id="batch_modal" className="modal">
        <div className="modal-box max-w-md">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <h3 className="font-bold text-lg mb-4">Select New Batch</h3>
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Current Batch: {enrolledBatchName}</p>
            <select
              className="select select-bordered w-full"
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
            >
              <option value="">Select new batch</option>
              {availableBatches.map((batch) => (
                <option key={batch._id} value={batch._id}>
                  {batch.batchName}
                </option>
              ))}
            </select>
          </div>
          <div className="modal-action">
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