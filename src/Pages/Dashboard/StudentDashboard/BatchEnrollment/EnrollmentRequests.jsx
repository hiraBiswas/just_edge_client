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
  const [currentCourseId, setCurrentCourseId] = useState("");
  const [currentPrefCourse, setCurrentPrefCourse] = useState("");
  const [routineData, setRoutineData] = useState([]);
  const [instructorData, setInstructorData] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [pendingRequests, setPendingRequests] = useState({
    hasAnyPending: false,
    course: null,
    batch: null,
  });
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [allRequests, setAllRequests] = useState({
    courseChange: [],
    batchChange: [],
  });
  const [loadingRequestsStatus, setLoadingRequestsStatus] = useState(true);

  useEffect(() => {
    if (user?._id) {
      setLoadingRequests(true);
      axiosSecure.get("/students").then((res) => {
        const foundStudent = res.data.find((s) => s.userId === user._id);
        if (foundStudent) {
          setStudentData(foundStudent);
          setCurrentPrefCourse(foundStudent.prefCourse);

          // Get user data
          axiosSecure.get("/users").then((userRes) => {
            const foundUser = userRes.data.find((u) => u._id === user._id);
            if (foundUser) {
              setUserData(foundUser);
            }
          });

          // Check for pending requests and get other data
          Promise.all([
            axiosSecure
              .get("/course-change-requests")
              .catch(() => ({ data: [] })),
            axiosSecure
              .get("/batch-change-requests")
              .catch(() => ({ data: [] })),
            axiosSecure.get("/courses"),
            axiosSecure.get("/batches"),
          ])
            .then(
              ([courseRequestsRes, batchRequestsRes, courseRes, batchRes]) => {
                const pendingCourseRequest = courseRequestsRes.data.find(
                  (req) =>
                    req.studentId === foundStudent._id &&
                    req.status === "Pending"
                );

                const pendingBatchRequest = batchRequestsRes.data.find(
                  (req) =>
                    req.studentId === foundStudent._id &&
                    req.status === "Pending"
                );

                const hasAnyPending =
                  !!pendingCourseRequest || !!pendingBatchRequest;

                setPendingRequests({
                  hasAnyPending,
                  course: pendingCourseRequest,
                  batch: pendingBatchRequest,
                });

                setCourses(courseRes.data);
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
              }
            )
            .finally(() => {
              setLoadingRequests(false);
            });
        }
      });
    }
  }, [user, axiosSecure]);

  const fetchBatchDetails = async (batchId) => {
    try {
      setLoadingData(true);

      const [
        routineResponse,
        allAssignmentsRes,
        allInstructorsRes,
        allUsersRes,
      ] = await Promise.all([
        axiosSecure.get(`/routine/${batchId}`).catch(() => ({ data: [] })),
        axiosSecure.get("/instructors-batches").catch(() => ({ data: [] })),
        axiosSecure.get("/instructors").catch(() => ({ data: [] })),
        axiosSecure.get("/users").catch(() => ({ data: [] })),
      ]);

      const routines = routineResponse.data || [];

      const batchInstructorIds = allAssignmentsRes.data
        .filter((assignment) => assignment?.batchId === batchId)
        .map((assignment) => assignment?.instructorId)
        .filter(Boolean);

      const instructorsWithNames = allInstructorsRes.data
        .filter((instructor) => batchInstructorIds.includes(instructor?._id))
        .map((instructor) => {
          const user = allUsersRes.data.find(
            (user) => user?._id === instructor?.userId
          );
          return {
            ...instructor,
            name: user?.name || "Unknown Instructor",
            email: user?.email || "No email available",
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

  // Helper function to get course/batch name
  const getRequestDetails = (type) => {
    if (!pendingRequests[type]) return "";

    if (type === "course") {
      const course = courses.find(
        (c) => c._id === pendingRequests.course?.requestedCourse
      );
      return course?.courseName || "Selected Course";
    } else {
      const batch = batches.find(
        (b) => b._id === pendingRequests.batch?.requestedBatch
      );
      return batch?.batchName || "Selected Batch";
    }
  };

  const preferredCourseName =
    courses.find((course) => course._id === studentData?.prefCourse)
      ?.courseName || "N/A";

  const enrolledBatchName =
    batches.find((batch) => batch._id === studentData?.enrolled_batch)
      ?.batchName || "N/A";

  // Get the course name for the enrolled batch
  const enrolledCourseName = studentData?.enrolled_batch
    ? courses.find(
        (course) =>
          course._id ===
          batches.find((batch) => batch._id === studentData.enrolled_batch)
            ?.course_id
      )?.courseName
    : "N/A";

  console.log(enrolledBatchName);
  console.log(enrolledCourseName);
  console.log(preferredCourseName);

  const handleCourseChangeRequest = async () => {
    if (!selectedCourse) {
      toast.error("Please select a course");
      return;
    }

    const courseRequest = {
      studentId: studentData._id,
      requestedCourse: selectedCourse,
      status: "Pending",
      timestamp: new Date().toISOString(),
    };

    try {
      await axiosSecure.post("/course-change-requests", courseRequest);
      toast.success("Course change request submitted successfully!");
      document.getElementById("course_modal").close();

      // Refresh data
      await fetchAllRequests();
      setPendingRequests((prev) => ({
        ...prev,
        hasAnyPending: true,
        course: courseRequest,
      }));

      // Reset selection
      setSelectedCourse("");
    } catch (err) {
      console.error("Error submitting course change request:", err);
      toast.error("Failed to submit course change request");
    }
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

  const handleChangeBatch = async () => {
    if (!selectedBatch) {
      toast.error("Please select a batch");
      return;
    }

    const batchRequest = {
      studentId: studentData._id,
      requestedBatch: selectedBatch,
      status: "Pending",
      timestamp: new Date().toISOString(),
    };

    try {
      await axiosSecure.post("/batch-change-requests", batchRequest);
      toast.success("Batch change request submitted successfully!");
      document.getElementById("batch_modal").close();

      // Refresh data
      await fetchAllRequests();
      setPendingRequests((prev) => ({
        ...prev,
        hasAnyPending: true,
        batch: batchRequest,
      }));

      // Reset selection
      setSelectedBatch("");
    } catch (err) {
      console.error("Error submitting batch change request:", err);
      toast.error("Failed to submit batch change request!");
    }
  };

  const fetchAllRequests = async () => {
    try {
      const [courseRes, batchRes] = await Promise.all([
        axiosSecure.get("/course-change-requests"),
        axiosSecure.get("/batch-change-requests"),
      ]);

      setAllRequests({
        courseChange: courseRes.data.filter(
          (req) => req.studentId === studentData?._id
        ),
        batchChange: batchRes.data.filter(
          (req) => req.studentId === studentData?._id
        ),
      });
    } catch (error) {
      toast.error("Failed to load requests");
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (studentData?._id) {
      fetchAllRequests();
    }
  }, [studentData]);

  const currentBatchStatus =
    batches.find((b) => b._id === studentData?.enrolled_batch)?.status || "";

  return (
    <div className=" w-[1100px] mx-auto">
      <div className="flex justify-between items-center mt-3 mb-2">
        <h1 className="text-xl font-bold text-gray-800">
          Enrollment Management
        </h1>
        {pendingRequests.hasAnyPending && (
          <div className="badge badge-lg badge-warning gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            Pending Request
          </div>
        )}
      </div>

      {/* Request History Modal */}
      <dialog id="request_history_modal" className="modal">
        <div className="modal-box max-w-2xl">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg text-center mb-4">
            My Request History
          </h3>

          {loadingRequests ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Course Change Requests */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">
                  Course Change Requests
                </h4>
                {allRequests.courseChange.length > 0 ? (
                  <div className="space-y-2">
                    {allRequests.courseChange.map((request, index) => (
                      <div
                        key={`course-req-${index}`}
                        className={`p-3 rounded-lg border ${
                          request.status === "Approved"
                            ? "bg-green-50 border-green-200"
                            : request.status === "Rejected"
                            ? "bg-red-50 border-red-200"
                            : "bg-yellow-50 border-yellow-200"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              {courses.find(
                                (c) => c._id === request.requestedCourse
                              )?.courseName || "Unknown Course"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(request.timestamp).toLocaleString()}
                            </p>
                            {request.status === "Rejected" &&
                              request.reason && (
                                <p className="text-sm text-red-600 mt-1">
                                  <strong>Reason:</strong> {request.reason}
                                </p>
                              )}
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.status === "Approved"
                                ? "bg-green-100 text-green-800"
                                : request.status === "Rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {request.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No course change requests found
                  </p>
                )}
              </div>

              {/* Batch Change Requests */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">
                  Batch Change Requests
                </h4>
                {allRequests.batchChange.length > 0 ? (
                  <div className="space-y-2">
                    {allRequests.batchChange.map((request, index) => (
                      <div
                        key={`batch-req-${index}`}
                        className={`p-3 rounded-lg border ${
                          request.status === "Approved"
                            ? "bg-green-50 border-green-200"
                            : request.status === "Rejected"
                            ? "bg-red-50 border-red-200"
                            : "bg-yellow-50 border-yellow-200"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              {batches.find(
                                (b) => b._id === request.requestedBatch
                              )?.batchName || "Unknown Batch"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(request.timestamp).toLocaleString()}
                            </p>
                            {request.status === "Rejected" &&
                              request.reason && (
                                <p className="text-sm text-red-600 mt-1">
                                  <strong>Reason:</strong> {request.reason}
                                </p>
                              )}
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.status === "Approved"
                                ? "bg-green-100 text-green-800"
                                : request.status === "Rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {request.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No batch change requests found
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </dialog>

      {/* Student Enrollment Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Enrollment Status
          </h2>

          {loadingRequests ? (
            <div className="flex justify-center py-4">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Show preferred course if not enrolled */}
                {!studentData?.enrolled_batch && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 transition duration-150 ease-in-out hover:bg-white hover:shadow-sm hover:border-gray-200">
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Preferred Course
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      {preferredCourseName}
                    </p>
                  </div>
                )}

                {/* Show enrolled details if enrolled */}
                {studentData?.enrolled_batch && (
                  <>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 transition duration-150 ease-in-out hover:bg-white hover:shadow-sm hover:border-gray-200">
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Enrolled Course
                      </p>
                      <p className="text-lg font-semibold truncate text-gray-800">
                        {enrolledCourseName}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 transition duration-150 ease-in-out hover:bg-white hover:shadow-sm hover:border-gray-200">
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Enrolled Batch
                      </p>
                      <p className="text-lg font-semibold text-gray-800">
                        {enrolledBatchName}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 transition duration-150 ease-in-out hover:bg-white hover:shadow-sm hover:border-gray-200">
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Status
                      </p>
                      <p
                        className={`text-lg font-semibold ${
                          currentBatchStatus === "Completed"
                            ? "text-gray-800"
                            : currentBatchStatus === "Upcoming"
                            ? "text-gray-800"
                            : currentBatchStatus === "Ongoing"
                            ? "text-gray-800"
                            : "text-gray-600"
                        }`}
                      >
                        {currentBatchStatus || "N/A"}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-wrap justify-between items-center gap-3">
                <div className="flex flex-wrap gap-3">
                  {studentData?.enrolled_batch ? (
                    <>
                      <button
                        className={`btn btn-primary gap-2 ${
                          pendingRequests.hasAnyPending ||
                          currentBatchStatus === "Completed"
                            ? "btn-disabled"
                            : ""
                        }`}
                        onClick={() =>
                          !pendingRequests.hasAnyPending &&
                          document.getElementById("course_modal").showModal()
                        }
                        disabled={
                          pendingRequests.hasAnyPending ||
                          currentBatchStatus === "Completed"
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                        Change Course
                      </button>
                      <button
                        className={`btn btn-outline btn-primary gap-2 ${
                          pendingRequests.hasAnyPending ||
                          currentBatchStatus === "Completed"
                            ? "btn-disabled"
                            : ""
                        }`}
                        onClick={() =>
                          !pendingRequests.hasAnyPending &&
                          document.getElementById("batch_modal").showModal()
                        }
                        disabled={
                          pendingRequests.hasAnyPending ||
                          currentBatchStatus === "Completed"
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                          />
                        </svg>
                        Change Batch
                      </button>
                    </>
                  ) : (
                    <button
                      className={`btn btn-warning gap-2 ${
                        pendingRequests.hasAnyPending ? "btn-disabled" : ""
                      }`}
                      onClick={() =>
                        !pendingRequests.hasAnyPending &&
                        document.getElementById("my_modal_3").showModal()
                      }
                      disabled={pendingRequests.hasAnyPending}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                      Change Preferred Course
                    </button>
                  )}
                </div>

                {/* View Requests Button (only for enrolled students) */}
                {studentData?.enrolled_batch && (
                  <button
                    className="btn btn-ghost text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 gap-2"
                    onClick={() => {
                      fetchAllRequests();
                      document
                        .getElementById("request_history_modal")
                        .showModal();
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                    View Requests
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Request History Modal */}
      <dialog id="request_history_modal" className="modal">
        <div className="modal-box max-w-2xl">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg mb-4">My Request History</h3>

          {loadingRequests ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Course Change Requests */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">
                  Course Change Requests
                </h4>
                {allRequests.courseChange.length > 0 ? (
                  <div className="space-y-2">
                    {allRequests.courseChange.map((request, index) => (
                      <div
                        key={`course-req-${index}`}
                        className={`p-3 rounded-lg border ${
                          request.status === "Approved"
                            ? "bg-green-50 border-green-200"
                            : request.status === "Rejected"
                            ? "bg-red-50 border-red-200"
                            : "bg-yellow-50 border-yellow-200"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              {courses.find(
                                (c) => c._id === request.requestedCourse
                              )?.courseName || "Unknown Course"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(request.timestamp).toLocaleString()}
                            </p>
                            {request.status === "Rejected" &&
                              request.reason && (
                                <p className="text-sm text-red-600 mt-1">
                                  <strong>Reason:</strong> {request.reason}
                                </p>
                              )}
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.status === "Approved"
                                ? "bg-green-100 text-green-800"
                                : request.status === "Rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {request.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No course change requests found
                  </p>
                )}
              </div>

              {/* Batch Change Requests */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">
                  Batch Change Requests
                </h4>
                {allRequests.batchChange.length > 0 ? (
                  <div className="space-y-2">
                    {allRequests.batchChange.map((request, index) => (
                      <div
                        key={`batch-req-${index}`}
                        className={`p-3 rounded-lg border ${
                          request.status === "Approved"
                            ? "bg-green-50 border-green-200"
                            : request.status === "Rejected"
                            ? "bg-red-50 border-red-200"
                            : "bg-yellow-50 border-yellow-200"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              {batches.find(
                                (b) => b._id === request.requestedBatch
                              )?.batchName || "Unknown Batch"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(request.timestamp).toLocaleString()}
                            </p>
                            {request.status === "Rejected" &&
                              request.reason && (
                                <p className="text-sm text-red-600 mt-1">
                                  <strong>Reason:</strong> {request.reason}
                                </p>
                              )}
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.status === "Approved"
                                ? "bg-green-100 text-green-800"
                                : request.status === "Rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {request.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No batch change requests found
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* Batch Details Section */}
      {studentData?.enrolled_batch && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              Batch Details
            </h2>

            {loadingData ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Schedule Card */}
                <div className="bg-gray-50 rounded-lg border border-gray-100 p-5">
                  <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-indigo-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Class Schedule
                  </h3>
                  {routineData.length > 0 ? (
                    <div className="space-y-3">
                      {routineData.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-100 shadow-xs"
                        >
                          <span className="font-medium text-gray-700">
                            {item.day}
                          </span>
                          <span className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
                            {item.startTime} - {item.endTime}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 mx-auto text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <p className="mt-2 text-gray-500">
                        No schedule information available
                      </p>
                    </div>
                  )}
                </div>

                {/* Instructors Card */}
                <div className="bg-gray-50 rounded-lg border border-gray-100 p-5">
                  <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-indigo-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
                    </svg>
                    Instructors
                  </h3>
                  {instructorData.length > 0 ? (
                    <div className="space-y-3">
                      {instructorData.map((instructor, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-100 shadow-xs hover:shadow-sm transition-shadow"
                        >
                          <div className="avatar placeholder">
                            <div className="bg-indigo-100 text-indigo-600 rounded-full w-12">
                              <span className="font-medium">
                                {instructor?.name?.charAt(0) || "?"}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate">
                              {instructor?.name || "Unknown Instructor"}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {instructor?.email || "No email available"}
                            </p>
                          </div>
                          <button className="btn btn-ghost btn-sm text-indigo-600 hover:text-indigo-700">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 mx-auto text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M8 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0zM6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"
                        />
                      </svg>
                      <p className="mt-2 text-gray-500">
                        No instructor information available
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {/* Preferred Course Selection Modal (for unenrolled students) */}
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box max-w-md">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg mb-4">
            Select New Preferred Course
          </h3>
          <select
            className="select select-bordered w-full mb-6"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">Select a course</option>
            {courses
              .filter((course) => {
                const isNotCurrentPref = course._id !== currentPrefCourse;
                const isActiveCourse = course.isDeleted === false;
                return isNotCurrentPref && isActiveCourse;
              })
              .map((course) => (
                <option key={course._id} value={course._id}>
                  {course.courseName}
                </option>
              ))}
          </select>
          <div className="modal-action">
            <button
              className="btn btn-ghost mr-2"
              onClick={() => document.getElementById("my_modal_3").close()}
            >
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
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg mb-4">Request Course Change</h3>
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">
              Current Course: {enrolledCourseName}
            </p>
            <select
              className="select select-bordered w-full"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">Select new course</option>
              {courses
                .filter((course) => course._id !== currentCourseId)
                .map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.courseName}
                  </option>
                ))}
            </select>
          </div>
          <div className="modal-action">
            <button
              className="btn btn-primary"
              onClick={handleCourseChangeRequest}
            >
              Submit Request
            </button>
          </div>
        </div>
      </dialog>

      {/* Batch Change Request Modal */}
      <dialog id="batch_modal" className="modal">
        <div className="modal-box max-w-md">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg mb-4">Select New Batch</h3>
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">
              Current Batch: {enrolledBatchName}
            </p>
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
