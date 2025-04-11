import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { toast } from "react-hot-toast";

const BatchInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const [batch, setBatch] = useState(null);
  const [course, setCourse] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [courseProgress, setCourseProgress] = useState({
    completed: 0,
    total: 0,
    percentage: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
  
        // 1. Fetch batch data
        const batchRes = await axiosSecure.get(`/batches/${id}`);
        setBatch(batchRes.data);
  
        let matchedCourse = null;
  
        // Fetch course data by filtering from all courses
        if (batchRes.data.course_id) {
          const coursesRes = await axiosSecure.get("/courses");
          matchedCourse = coursesRes.data.find(
            (course) => course._id === batchRes.data.course_id
          );
          setCourse(matchedCourse);
        }
  
        // 3. Get all instructors assigned to this batch
        const instructorsAssignmentRes = await axiosSecure.get(
          "/instructors-batches"
        );
        const filteredInstructorAssignments =
          instructorsAssignmentRes.data.filter((inst) => inst.batchId === id);
  
        // 4. Fetch full instructor data from /instructors endpoint
        const allInstructorsRes = await axiosSecure.get("/instructors");
  
        // 5. Get user data for each instructor to get complete instructor information
        const usersRes = await axiosSecure.get("/users");
  
        // 6. Get all classes for this batch
        const classesRes = await axiosSecure.get("/classes");
        const batchClasses = classesRes.data.filter(
          (cls) => cls.batchId === id
        );
        setClasses(batchClasses);
  
        // 7. Map instructor assignments with full instructor and user data
        const completeInstructorData = filteredInstructorAssignments.map(
          (assignment) => {
            const instructorRecord = allInstructorsRes.data.find(
              (instructor) => instructor._id === assignment.instructorId
            );
  
            const userRecord = instructorRecord
              ? usersRes.data.find(
                  (user) => user._id === instructorRecord.userId
                )
              : null;
  
            const instructorClasses = batchClasses.filter(
              (cls) => cls.instructorId === assignment.instructorId
            );
  
            return {
              ...assignment,
              instructorDetail: instructorRecord || {},
              userData: userRecord || {},
              name: userRecord?.name || assignment.instructorName || "Unknown",
              totalClasses: instructorClasses.length,
            };
          }
        );
  
        setInstructors(completeInstructorData);
  
        // 8. Calculate and set instructor statistics
        const instructorStats = completeInstructorData.map((instructor) => ({
          instructorId: instructor.instructorId,
          name: instructor.name,
          totalClasses: instructor.totalClasses,
        }));
  
        setStats(instructorStats);
  
        // 9. Calculate course progress
        if (matchedCourse) {
          setCourseProgress({
            completed: batchClasses.length,
            total: matchedCourse.numberOfClass,
            percentage:
              matchedCourse.numberOfClass > 0
                ? Math.min(
                    100,
                    Math.round(
                      (batchClasses.length / matchedCourse.numberOfClass) * 100
                    )
                  )
                : 0,
          });
        }
      } catch (error) {
        toast.error("Error fetching data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [id, axiosSecure]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-ring loading-lg"></span>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">
            Batch not found
          </h2>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 btn btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDuration = (start, end) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const durationMs = endTime - startTime;
    const minutes = Math.floor(durationMs / (1000 * 60));
    return `${minutes} minutes`;
  };

  // Determine if we should show instructor participation or course progress
  const showInstructorParticipation = instructors.length > 1;
  const totalClasses = classes.length;




  // Calculate remaining classes
  const remainingClasses = course ? Math.max(0, course.numberOfClass - classes.length) : 0;

  console.log('Final calculation:', {
    courseNumberOfClass: course?.numberOfClass,
    classesLength: classes.length,
    remainingClasses
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {batch.batchName}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  batch.status === "Ongoing"
                    ? "bg-green-100 text-green-800"
                    : batch.status === "Upcoming"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {batch.status}
              </span>
              {course && (
                <span className="text-sm text-gray-600">
                  {course.courseName}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn-outline btn-sm"
          >
            Back to Dashboard
          </button>
        </div>

     {/* Stats Cards */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  {/* Students Card */}
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 h-full flex flex-col">
    <div className="flex items-center justify-between flex-grow">
      <div>
        <p className="text-sm font-medium text-gray-500">Students</p>
        <p className="text-2xl font-bold text-gray-800">
          {batch?.occupiedSeat || 0}/{batch?.seat || 0}
        </p>
      </div>
      <div className="bg-blue-100 p-3 rounded-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      </div>
    </div>
  </div>

  {/* Completed Classes Card */}
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 h-full flex flex-col">
    <div className="flex items-center justify-between flex-grow">
      <div>
        <p className="text-sm font-medium text-gray-500">Completed Classes</p>
        <p className="text-2xl font-bold text-gray-800">
          {classes?.length || 0}
        </p>
      </div>
      <div className="bg-green-100 p-3 rounded-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
    </div>
  </div>

  {/* Remaining Classes Card */}
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 h-full flex flex-col">
    <div className="flex items-center justify-between flex-grow">
      <div>
        <p className="text-sm font-medium text-gray-500">Remaining Classes</p>
        <p className="text-2xl font-bold text-gray-800">
          {remainingClasses}
        </p>
      </div>
      <div className="bg-orange-100 p-3 rounded-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-orange-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
    </div>
  </div>

  {/* Progress Card */}
  {showInstructorParticipation ? (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-2">Instructor Participation</h2>
      {stats.length > 0 ? (
        <div className="space-y-3 flex-grow flex flex-col">
          <div className="flex flex-wrap gap-2 mb-2">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center text-xs">
                <div
                  className="w-2 h-2 rounded-full mr-1"
                  style={{
                    backgroundColor: [
                      "#3B82F6",
                      "#10B981",
                      "#8B5CF6",
                      "#F59E0B",
                      "#EF4444",
                      "#EC4899",
                      "#14B8A6",
                      "#6366F1",
                    ][index % 8],
                  }}
                ></div>
                <span className="font-medium">{stat.name}</span>
                <span className="text-gray-500 ml-1">({stat.totalClasses})</span>
              </div>
            ))}
          </div>

          <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mt-auto">
            {stats.map((stat, index) => {
              const previousWidth = stats
                .slice(0, index)
                .reduce(
                  (sum, s) => sum + (s.totalClasses / totalClasses) * 100,
                  0
                );
              const width =
                totalClasses > 0 ? (stat.totalClasses / totalClasses) * 100 : 0;

              return (
                <div
                  key={index}
                  className="absolute top-0 h-full"
                  style={{
                    left: `${previousWidth}%`,
                    width: `${width}%`,
                    backgroundColor: [
                      "#3B82F6",
                      "#10B981",
                      "#8B5CF6",
                      "#F59E0B",
                      "#EF4444",
                      "#EC4899",
                      "#14B8A6",
                      "#6366F1",
                    ][index % 8],
                  }}
                ></div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center text-center py-2">
          <div>
            <svg
              className="mx-auto h-8 w-8 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="mt-1 text-sm text-gray-500">No instructor data</p>
          </div>
        </div>
      )}
    </div>
  ) : (
    course && (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 h-full flex flex-col">
        <h2 className="text-lg font-semibold mb-2">Course Progress</h2>
        <div className="flex-grow flex flex-col justify-between">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">
                {courseProgress.completed}/{courseProgress.total} classes
              </span>
              <span className="font-medium text-gray-700">
                {courseProgress.percentage}%
              </span>
            </div>
            <progress
              className="progress progress-primary w-full h-2"
              value={courseProgress.completed}
              max={courseProgress.total}
            ></progress>
          </div>
          {/* <p className="text-sm mt-2 text-gray-600">
            {courseProgress.completed >= courseProgress.total ? (
              <span className="text-green-600">Course completed!</span>
            ) : (
              <>{remainingClasses} classes remaining</>
            )}
          </p> */}
        </div>
      </div>
    )
  )}
</div>

    

        {/* Class Sessions Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">
              Class Sessions
            </h2>
            <p className="text-sm text-gray-600">
              History of conducted classes for this batch
            </p>
          </div>

          {classes.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="relative">
                <table className="w-full table-fixed text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600">
                      <th className="py-3 px-4 text-left font-medium sticky top-0 bg-gray-50 z-10 w-1/5">
                        Date
                      </th>
                      <th className="py-3 px-4 text-left font-medium sticky top-0 bg-gray-50 z-10 w-1/5">
                        Start Time
                      </th>
                      <th className="py-3 px-4 text-left font-medium sticky top-0 bg-gray-50 z-10 w-1/5">
                        End Time
                      </th>
                      <th className="py-3 px-4 text-left font-medium sticky top-0 bg-gray-50 z-10 w-1/5">
                        Duration
                      </th>
                      <th className="py-3 px-4 text-left font-medium sticky top-0 bg-gray-50 z-10 w-1/5">
                        Instructor
                      </th>
                    </tr>
                  </thead>
                </table>

                <div className="overflow-y-auto max-h-[200px]">
                  <table className="w-full text-sm">
                    <colgroup>
                      <col className="w-1/5" />
                      <col className="w-1/5" />
                      <col className="w-1/5" />
                      <col className="w-1/5" />
                      <col className="w-1/5" />
                    </colgroup>
                    <tbody className="divide-y divide-gray-100">
                      {classes.map((cls) => (
                        <tr key={cls._id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-800 whitespace-nowrap">
                            {formatDate(cls.date)}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {formatTime(cls.startTime)}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {formatTime(cls.endTime)}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                              {calculateDuration(cls.startTime, cls.endTime)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                            {cls.instructorName}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="flex flex-col items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-gray-300 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-700">
                  No class sessions recorded
                </h3>
                <p className="text-gray-500 mt-1">
                  Class sessions will appear here once conducted
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchInfo;