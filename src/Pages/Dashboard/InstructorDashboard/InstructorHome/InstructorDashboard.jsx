import React, { useContext, useEffect, useState, useCallback } from "react";
import { AuthContext } from "../../../../Providers/AuthProvider";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";
import toast from "react-hot-toast";
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";

const InstructorDashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const [instructorData, setInstructorData] = useState(null);
  const [assignedBatches, setAssignedBatches] = useState([]);
  const [toggleStates, setToggleStates] = useState({});
  const [disabledToggles, setDisabledToggles] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [classProgress, setClassProgress] = useState({});
  const [routineData, setRoutineData] = useState([]);
  const [elapsedTimes, setElapsedTimes] = useState({});
  const [activeSessions, setActiveSessions] = useState({});
  const [timeRemaining, setTimeRemaining] = useState({});
  const [batchStats, setBatchStats] = useState({});
  const MAX_CLASS_DURATION = 4 * 60 * 60 * 1000; // 3 hours
  const [todaysClasses, setTodaysClasses] = useState([]);


    // Filter batches by status
    const ongoingBatches = assignedBatches.filter(
      (batch) => batch.status === "Ongoing"
    );
    const upcomingBatches = assignedBatches.filter(
      (batch) => batch.status === "Upcoming"
    );
    const completedBatches = assignedBatches.filter(
      (batch) => batch.status === "Completed"
    );


    const saveSessionToStorage = (batchId, sessionData) => {
      const sessions = JSON.parse(localStorage.getItem('activeSessions')) || {};
      sessions[batchId] = sessionData;
      localStorage.setItem('activeSessions', JSON.stringify(sessions));
    };
   
    const removeSessionFromStorage = (batchId) => {
      const sessions = JSON.parse(localStorage.getItem('activeSessions')) || {};
      delete sessions[batchId];
      localStorage.setItem('activeSessions', JSON.stringify(sessions));
    };
  
    // Load sessions from localStorage on component mount
    useEffect(() => {
      const storedSessions = JSON.parse(localStorage.getItem("activeSessions")) || {};
      setActiveSessions(storedSessions);
    }, []);

    const handleToggleChange = async (batchId) => {
      try {
        const today = new Date().toISOString().split("T")[0];
        
        const alreadyRecorded = todaysClasses.some(cls => 
          cls.batchId === batchId && cls.date === today
        );
    
        if (alreadyRecorded) {
          toast.error("Today's class already recorded for this batch.");
          return;
        }
    
        if (activeSessions[batchId]) {
          // Ending the session
          await endSession(batchId);
        } else {
          // Starting a new session
          const startTime = new Date().toISOString();
          setActiveSessions(prev => ({
            ...prev,
            [batchId]: { startTime },
          }));
          saveSessionToStorage(batchId, { startTime });
          toast("Class session started", { icon: "⏱️" });
        }
      } catch (err) {
        console.error("Error handling toggle:", err);
        toast.error("Failed to record class. Please try again.");
      }
    };

    
    

    useEffect(() => {
      const storedSessions = JSON.parse(localStorage.getItem('activeSessions')) || {};
      // Convert stored strings to proper objects if needed
      const parsedSessions = Object.entries(storedSessions).reduce((acc, [key, value]) => {
        acc[key] = typeof value === 'string' ? { startTime: value } : value;
        return acc;
      }, {});
      setActiveSessions(parsedSessions);
    }, []);
    
    
    const endSession = async (batchId) => {
      const session = activeSessions[batchId];
      
      if (!session || !session.startTime) {
        console.warn("No valid session start time found. Skipping.");
        removeSessionFromStorage(batchId);
        setActiveSessions(prev => {
          const newSessions = { ...prev };
          delete newSessions[batchId];
          return newSessions;
        });
        return;
      }
    
      const endTime = new Date().toISOString();
      const startTime = session.startTime;
      const today = startTime.split("T")[0];
    
      const classData = {
        batchId,
        instructorId: instructorData._id,
        date: today,
        startTime,
        endTime,
        duration: (new Date(endTime) - new Date(startTime)) / (1000 * 60),
      };
    
      try {
        setSubmitting(true);
        const res = await axiosSecure.post('/classes', classData);
        
        if (res?.data?.success) {
          // তাৎক্ষণিকভাবে todaysClasses আপডেট করুন
          const newClass = {
            ...res.data.savedClass,
            batchId: batchId,
            date: today
          };
          
          setTodaysClasses(prev => [...prev, newClass]);
          
          // ক্লাস প্রগ্রেসও আপডেট করুন
          setClassProgress(prev => {
            const currentBatchProgress = prev[batchId] || { completed: 0, total: 27, percentage: 0 };
            const newCompleted = currentBatchProgress.completed + 1;
            const newPercentage = Math.round((newCompleted / currentBatchProgress.total) * 100);
            
            return {
              ...prev,
              [batchId]: {
                ...currentBatchProgress,
                completed: newCompleted,
                percentage: newPercentage
              }
            };
          });
          
          toast.success("Class session saved successfully");
        }
      } catch (err) {
        console.error("Error saving class:", err);
        toast.error("Failed to save class session");
      } finally {
        removeSessionFromStorage(batchId);
        setActiveSessions(prev => {
          const newSessions = { ...prev };
          delete newSessions[batchId];
          return newSessions;
        });
        setSubmitting(false);
      }
    };
    
    useEffect(() => {
      const fetchTodaysClasses = async () => {
        try {
          const today = new Date().toISOString().split("T")[0];
          const res = await axiosSecure.get(`/classes?date=${today}&instructorId=${instructorData._id}`);
          
          // Ensure each class has a batchId
          const classesWithBatchId = res.data.map(cls => ({
            ...cls,
            batchId: cls.batchId || cls.batch?._id || null
          })).filter(cls => cls.batchId); // Filter out classes without batchId
          
          setTodaysClasses(classesWithBatchId);
        } catch (err) {
          console.error("Error fetching today's classes:", err);
        }
      };
    
      if (instructorData?._id) {
        fetchTodaysClasses();
      }
    }, [instructorData]);
    
    
  useEffect(() => {
    if (completedBatches.length > 0) {
      const fetchBatchStats = async () => {
        try {
          const stats = {};
          for (const batch of completedBatches) {
            const res = await axiosSecure.get(`/results/batch/${batch._id}/stats`);
            stats[batch._id] = res.data;
          }
          setBatchStats(stats);
        } catch (error) {
          console.error("Error fetching batch statistics:", error);
        }
      };
      fetchBatchStats();
    }
  }, [completedBatches, axiosSecure]);

  useEffect(() => {
    if (!loading && user) {
      const fetchData = async () => {
        try {
          setIsLoading(true);

          // 1. Get the instructor record first
          const instructorsRes = await axiosSecure.get("/instructors");
          const matchedInstructor = instructorsRes.data.find(
            (instructor) => instructor.userId === user._id
          );

          if (!matchedInstructor) {
            toast.error("Instructor data not found.");
            setIsLoading(false);
            return;
          }

          setInstructorData(matchedInstructor);

          // 2. Get batches assigned to this instructor
          const batchesRes = await axiosSecure.get(
            `/instructors-batches?instructorId=${matchedInstructor._id}`
          );

          // 3. Get full batch details
          const batchDetails = await Promise.all(
            batchesRes.data.map((batch) =>
              axiosSecure.get(`/batches/${batch.batchId}`)
            )
          );

          // 4. Get course info for these batches
          const courseIds = [
            ...new Set(batchDetails.map((res) => res.data.course_id)),
          ];
          const coursesRes = await axiosSecure.get("/courses", {
            params: { ids: courseIds.join(",") },
          });

          const coursesMap = coursesRes.data.reduce((map, course) => {
            map[course._id] = course;
            return map;
          }, {});

          // Combine batch data with course info
          const batchesWithCourses = batchDetails.map((res) => ({
            ...res.data,
            course: coursesMap[res.data.course_id] || null,
          }));

          setAssignedBatches(batchesWithCourses);

          // 5. Get routine for these batches
          if (batchesWithCourses.length > 0) {
            const routinePromises = batchesWithCourses.map((batch) =>
              axiosSecure.get(`/routine/${batch._id}`)
            );
            const routineResponses = await Promise.all(routinePromises);

            const allRoutines = routineResponses
              .flatMap((response) => response.data)
              .sort((a, b) => {
                const dayOrder = [
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ];
                return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
              });

            setRoutineData(allRoutines);
          }
        } catch (error) {
          toast.error("Error fetching data.");
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [user, loading, axiosSecure]);

  useEffect(() => {
    if (!loading && user && assignedBatches.length > 0) {
      const fetchClassProgress = async () => {
        try {
          const progressData = {};
          const today = new Date().toISOString().split("T")[0];

          const classesRes = await axiosSecure.get("/classes");

          for (const batch of assignedBatches.filter(
            (b) => b.status === "Ongoing"
          )) {
            // Use numberOfClass from course data as total classes
            const totalClasses = batch.course?.numberOfClass || 27; // Default to 27 if not available

            const completedClasses = classesRes.data.filter(
              (cls) => cls.batchId === batch._id && cls.date <= today
            ).length;

            progressData[batch._id] = {
              completed: completedClasses,
              total: totalClasses,
              percentage: Math.round((completedClasses / totalClasses) * 100),
            };
          }

          setClassProgress(progressData);
        } catch (error) {
          console.error("Error fetching class progress:", error);
        }
      };

      fetchClassProgress();
    }
  }, [assignedBatches, loading, user, axiosSecure]);

  // Setup the timer effect for session tracking
  useEffect(() => {
    if (Object.keys(activeSessions).length === 0) return;

    const timer = setInterval(() => {
      const now = new Date();
      const updates = {};

      for (const [batchId, session] of Object.entries(activeSessions)) {
        const elapsed = now - new Date(session.startTime);
        const remaining = MAX_CLASS_DURATION - elapsed;

        if (remaining <= 0) {
          endSession(batchId, true);
          continue;
        }

        updates[batchId] = remaining;
      }

      setTimeRemaining(updates);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSessions, endSession]); // Include endSession as a dependency


  useEffect(() => {
    const storedSessions = JSON.parse(localStorage.getItem('activeSessions')) || {};
    // Convert stored strings to proper objects if needed
    const parsedSessions = Object.entries(storedSessions).reduce((acc, [key, value]) => {
      acc[key] = typeof value === 'string' ? { startTime: value } : value;
      return acc;
    }, {});
    setActiveSessions(parsedSessions);
  }, []);

  
  const convertTo12HourFormat = (time) => {
    let [hours, minutes] = time.split(":");
    hours = parseInt(hours, 10);
    const suffix = hours >= 12 ? "PM" : "AM";
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    return `${hours}:${minutes} ${suffix}`;
  };


  const formatSessionDuration = (startTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const diffMs = now - start;
    
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${minutes}m`;
    } else {
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  // Add this helper function at the top of your component file
const safeDateParse = (dateString) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};



  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-ring loading-xl"></span>
      </div>
    );
  }

  const tabs = [
    {
      label: "Ongoing",
      value: "ongoing",
      count: ongoingBatches.length,
      batches: ongoingBatches,
    },
    {
      label: "Upcoming",
      value: "upcoming",
      count: upcomingBatches.length,
      batches: upcomingBatches,
    },
    {
      label: "Completed",
      value: "completed",
      count: completedBatches.length,
      batches: completedBatches,
    },
  ];

  return (
    <div className=" w-[1100px] mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Instructor Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your classes and view schedules
            </p>
          </div>

          {instructorData && (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 w-full md:w-auto">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800">
                    {instructorData.name}
                  </h2>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Batches
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {assignedBatches.length}
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Ongoing Batches
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {ongoingBatches.length}
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

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Upcoming Batches
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {upcomingBatches.length}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-yellow-600"
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
        </div>

        {/* Batches Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">
              Your Assigned Batches
            </h2>
            <p className="text-sm text-gray-600">
              Manage and track your teaching batches
            </p>
          </div>

          {assignedBatches.length > 0 ? (
            <div className="w-full">
              <Tabs value="ongoing">
                <TabsHeader
                  className="bg-transparent p-0 border-b border-gray-200 rounded-none"
                  indicatorProps={{
                    className:
                      "bg-transparent border-b-2 border-blue-500 shadow-none rounded-none",
                  }}
                >
                  {tabs.map(({ label, value, count }) => (
                    <Tab
                      key={value}
                      value={value}
                      className={`py-4 px-6 font-medium text-sm ${
                        value === "ongoing"
                          ? "text-blue-500"
                          : value === "upcoming"
                          ? "text-gray-500"
                          : "text-gray-500"
                      } hover:text-blue-500 focus:text-blue-500`}
                    >
                      <div className="flex items-center gap-2">
                        {label}
                        {count > 0 && (
                          <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
                            {count}
                          </span>
                        )}
                      </div>
                    </Tab>
                  ))}
                </TabsHeader>
                <TabsBody className="mt-0">
                  {tabs.map(({ value, batches }) => (
                    <TabPanel key={value} value={value} className="p-0">
                      <div
                        className={`min-h-[200px] ${
                          batches.length > 0
                            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4"
                            : "flex items-center justify-center p-8"
                        }`}
                      >
                        {batches.length > 0 ? (
                  batches.map((batch) => (
                    <div 
                      key={batch._id} 
                      className="border rounded-lg p-4 hover:shadow-md transition border-gray-100 hover:border-blue-200"
                      onClick={() => navigate(`/dashboard/batch-details/${batch._id}`)}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-800">
                              {batch.batchName}
                            </h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              batch.status === "Ongoing" ? "bg-green-100 text-green-800" :
                              batch.status === "Upcoming" ? "bg-blue-100 text-blue-800" :
                              "bg-purple-100 text-purple-800"
                            }`}>
                              {batch.status}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3">
                            {batch.course?.courseName || "No course info"}
                          </p>
                          
                          {/* Students count - Moved up */}
                          <div className="mb-3 pb-3 border-b border-gray-100 flex justify-between text-sm">
                            <span className="text-gray-500">Students enrolled:</span>
                            <span className="font-medium">
                              {batch.occupiedSeat}/{batch.seat}
                            </span>
                          </div>
                          
                          {/* Results/Progress Section */}
                          {batch.status === "Completed" && batchStats[batch._id] ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Final Results</span>
                                <div className="flex gap-2">
                                  <span className="text-sm font-medium text-green-600">
                                    {batchStats[batch._id].passCount} Passed
                                  </span>
                                  <span className="text-sm font-medium text-red-600">
                                    {batchStats[batch._id].failCount} Failed
                                  </span>
                                </div>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2.5">
                                <div 
                                  className="bg-green-500 h-2.5 rounded-full" 
                                  style={{ 
                                    width: `${(batchStats[batch._id].passCount / batchStats[batch._id].totalStudents) * 100}%` 
                                  }}
                                ></div>
                                <div 
                                  className="bg-red-500 h-2.5 rounded-full -mt-2.5" 
                                  style={{ 
                                    width: `${(batchStats[batch._id].failCount / batchStats[batch._id].totalStudents) * 100}%`,
                                    marginLeft: `${(batchStats[batch._id].passCount / batchStats[batch._id].totalStudents) * 100}%`
                                  }}
                                ></div>
                              </div>
                            </div>
                          ) : batch.status === "Ongoing" && classProgress[batch._id] ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Class Progress</span>
                                <span className="text-sm font-medium text-blue-600">
                                  {classProgress[batch._id].completed}/{classProgress[batch._id].total} classes
                                </span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2.5">
                                <div 
                                  className="bg-blue-500 h-2.5 rounded-full" 
                                  style={{ 
                                    width: `${classProgress[batch._id].percentage}%` 
                                  }}
                                ></div>
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-medium text-gray-500">
                                  {classProgress[batch._id].percentage}% completed
                                </span>
                              </div>
                            </div>
                          ) : null}
                        </div>
                        {batch.status === "Ongoing" && (
                          <div className="flex flex-col items-end">
  <div className="relative">
  <label
  className="inline-flex items-center cursor-pointer mb-1"
  onClick={(e) => {
    e.stopPropagation(); // prevent parent click
    const today = new Date().toISOString().split("T")[0];
    const alreadyRecorded = todaysClasses.some(
      (cls) => cls.batchId === batch._id.toString() && cls.date === today
    );
    if (alreadyRecorded) e.preventDefault(); // block toggle if class already exists
  }}
>
      <input
        type="checkbox"
        className={`toggle toggle-sm ${
          todaysClasses.some(cls => 
            cls.batchId === batch._id.toString() && 
            cls.date === new Date().toISOString().split("T")[0]
          ) ? "toggle-success" : "toggle-primary"
        }`}
        checked={!!activeSessions[batch._id]}
        onChange={() => handleToggleChange(batch._id)}
        disabled={
          todaysClasses.some(cls => 
            cls.batchId === batch._id.toString() && 
            cls.date === new Date().toISOString().split("T")[0]
          ) || 
          (batch.status !== "Ongoing")
        }
      />
    </label>
    {todaysClasses.some(cls => 
      cls.batchId === batch._id.toString() && 
      cls.date === new Date().toISOString().split("T")[0]
    ) && (
      <div className="absolute -bottom-5 right-0 text-xs text-gray-500 whitespace-nowrap">
        Class recorded today
      </div>
    )}
  </div>
  {activeSessions[batch._id] && (
    <div className="text-xs text-gray-500">
      {formatSessionDuration(activeSessions[batch._id].startTime)}
    </div>
  )}
</div>
)}

      </div>
                    </div>
                  ))
                        ) : (
                          <div className="text-center py-8 text-gray-500 w-full">
                            <div className="flex flex-col items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-12 w-12 text-gray-300 mb-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                />
                              </svg>
                              <p>No {value} batches found</p>
                              <p className="text-sm mt-1">
                                You don't have any {value.toLowerCase()} batches
                                assigned
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </TabPanel>
                  ))}
                </TabsBody>
              </Tabs>
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
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-700">
                  No batches assigned
                </h3>
                <p className="text-gray-500 mt-1">
                  Please contact administration if this is incorrect
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Routine Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">
              Class Schedule
            </h2>
            <p className="text-sm text-gray-600">
              Your weekly teaching routine
            </p>
          </div>

          {routineData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600">
                    <th className="py-3 px-4 text-left font-medium">Day</th>
                    <th className="py-3 px-4 text-left font-medium">Batch</th>
                    <th className="py-3 px-4 text-left font-medium">Course</th>
                    <th className="py-3 px-4 text-left font-medium">Time</th>
                    <th className="py-3 px-4 text-left font-medium">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(() => {
                    const groupedByDay = routineData.reduce((acc, routine) => {
                      if (!acc[routine.day]) acc[routine.day] = [];
                      acc[routine.day].push(routine);
                      return acc;
                    }, {});

                    const daysOrder = [
                      "Saturday",
                      "Sunday",
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                    ];
                    const sortedDays = Object.keys(groupedByDay).sort(
                      (a, b) => daysOrder.indexOf(a) - daysOrder.indexOf(b)
                    );

                    let rows = [];
                    const today = new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                    });

                    sortedDays.forEach((day) => {
                      const isToday = day === today;

                      groupedByDay[day].forEach((routine, idx) => {
                        const batch = assignedBatches.find(
                          (b) => b._id === routine.batchId
                        );
                        const startTime = convertTo12HourFormat(
                          routine.startTime
                        );
                        const endTime = convertTo12HourFormat(routine.endTime);
                        const duration =
                          Math.abs(
                            new Date(`2000-01-01T${routine.endTime}`) -
                              new Date(`2000-01-01T${routine.startTime}`)
                          ) /
                          (1000 * 60 * 60);

                        rows.push(
                          <tr
                            key={`${day}-${routine._id}`}
                            className={`${
                              isToday ? "bg-blue-50" : "bg-white"
                            } hover:bg-gray-50`}
                          >
                            {idx === 0 ? (
                              <td
                                className={`py-3 px-4 ${
                                  isToday
                                    ? "font-semibold text-blue-600"
                                    : "text-gray-700"
                                }`}
                                rowSpan={groupedByDay[day].length}
                              >
                                <div className="flex items-center gap-2">
                                  {day}
                                  {isToday && (
                                    <span className="inline-block text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                                      Today
                                    </span>
                                  )}
                                </div>
                              </td>
                            ) : null}
                            <td className="py-3 px-4 text-gray-800">
                              {batch?.batchName || "N/A"}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {batch?.course?.courseName || "N/A"}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <span className="text-gray-800">
                                  {startTime}
                                </span>
                                <span className="text-gray-400">-</span>
                                <span className="text-gray-800">{endTime}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {duration.toFixed(1)} hours
                              </span>
                            </td>
                          </tr>
                        );
                      });
                    });

                    return rows;
                  })()}
                </tbody>
              </table>
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
                  No routine found
                </h3>
                <p className="text-gray-500 mt-1">
                  You don't have any classes scheduled yet
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;