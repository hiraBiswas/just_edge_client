import React, { useState, useEffect } from "react";
import {
  Users,
  AlertTriangle,
  Calendar as CalendarIcon,
  FileText,
  Bell,
  BookOpenCheck,
  UserCheck,
  Calendar,
  CheckCircle,
  Clock,
  BookOpen,
  User,
  CalendarDays,
  Users as UsersIcon,
} from "lucide-react";
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { toast } from "react-hot-toast";

const AdminDashboard = () => {
  const axiosSecure = useAxiosSecure();
  const [stats, setStats] = useState({
    students: 0,
    instructors: 0,
    batches: 0,
    courses: 0,
  });
  const [batchData, setBatchData] = useState({
    ongoing: [],
    upcoming: [],
    completed: [],
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notices, setNotices] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [latestNotices, setLatestNotices] = useState([]);

  const fetchCompletedClasses = async (batchId) => {
    try {
      const res = await axiosSecure.get(`/classes?batchId=${batchId}`);
      return res.data.length;
    } catch (error) {
      console.error("Error fetching classes:", error);
      return 0;
    }
  };

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      const [studentsRes, instructorsRes, batchesRes, coursesRes] =
        await Promise.all([
          axiosSecure.get("/students"),
          axiosSecure.get("/instructors"),
          axiosSecure.get("/batches?status=all"),
          axiosSecure.get("/courses"),
        ]);

      setCourses(coursesRes.data || []);

      // Enhance batches with completed classes count
      const batchesWithProgress = await Promise.all(
        (batchesRes.data || []).map(async (batch) => {
          const completedCount = await fetchCompletedClasses(batch._id);
          return {
            ...batch,
            completedClassesCount: completedCount,
          };
        })
      );

      const today = new Date().toISOString().split("T")[0];

      const organizedBatches = {
        ongoing: batchesWithProgress.filter(
          (batch) =>
            batch.status === "Ongoing" ||
            (batch.startDate &&
              new Date(batch.startDate) <= new Date(today) &&
              (!batch.endDate || new Date(batch.endDate) >= new Date(today)))
        ),
        upcoming: batchesWithProgress.filter(
          (batch) =>
            batch.status === "Upcoming" ||
            (batch.startDate && new Date(batch.startDate) > new Date(today))
        ),
        completed: batchesWithProgress.filter(
          (batch) =>
            batch.status === "Completed" ||
            (batch.endDate && new Date(batch.endDate) < new Date(today))
        ),
      };

      setStats({
        students: studentsRes.data?.length || 0,
        instructors: instructorsRes.data?.length || 0,
        batches: batchesWithProgress.length,
        courses: coursesRes.data?.length || 0,
      });

      setBatchData(organizedBatches);
      fetchNotices();
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const statCards = [
    {
      title: "Total Students",
      value: stats.students,
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: "Total Instructors",
      value: stats.instructors,
      icon: <UserCheck className="w-6 h-6" />,
    },
    {
      title: "Total Batches",
      value: stats.batches,
      icon: <Calendar className="w-6 h-6" />,
    },
    {
      title: "Total Courses",
      value: stats.courses,
      icon: <BookOpenCheck className="w-6 h-6" />,
    },
  ];

  const batchTabs = [
    {
      label: "Ongoing Batches",
      value: "ongoing",
      icon: <CheckCircle className="w-5 h-5" />,
      count: batchData.ongoing.length,
      data: batchData.ongoing,
    },
    {
      label: "Upcoming Batches",
      value: "upcoming",
      icon: <Clock className="w-5 h-5" />,
      count: batchData.upcoming.length,
      data: batchData.upcoming,
    },
    {
      label: "Completed Batches",
      value: "completed",
      icon: <CheckCircle className="w-5 h-5" />,
      count: batchData.completed.length,
      data: batchData.completed,
    },
  ];

  const fetchNotices = async () => {
    try {
      const res = await axiosSecure.get("/notice");
      const allNotices = res.data || [];
      console.log();

      // Filter notices with deadlines
      const withDeadlines = allNotices.filter((notice) => notice.deadline);

      // Get upcoming deadlines (not passed yet)
      const today = new Date();
      const upcoming = withDeadlines
        .filter((notice) => new Date(notice.deadline) >= today)
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

      // Get latest 3 notices
      const latest = [...allNotices]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);

      setNotices(allNotices);
      setUpcomingDeadlines(upcoming);
      setLatestNotices(latest);
    } catch (error) {
      console.error("Error fetching notices:", error);
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen w-[1100px] bg-gray-50 mt-2 p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <Tabs value="ongoing">
              <TabsHeader
                className="bg-transparent p-0 border-b border-gray-200 rounded-none"
                indicatorProps={{
                  className:
                    "bg-transparent border-b-2 border-blue-500 shadow-none rounded-none",
                }}
              >
                {batchTabs.map(({ label, value, icon, count }) => (
                  <Tab
                    key={value}
                    value={value}
                    className={`py-4 px-6 font-medium text-sm ${
                      value === "ongoing"
                        ? "text-blue-500"
                        : "text-gray-500 hover:text-blue-500"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {icon}
                      {label}
                      <span className="ml-1 bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs">
                        {count}
                      </span>
                    </div>
                  </Tab>
                ))}
              </TabsHeader>
              <TabsBody>
                {batchTabs.map(({ value, data }) => (
                  <TabPanel key={value} value={value} className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                      {data.length > 0 ? (
                        data.map((batch) => {
                          const course = courses.find(
                            (c) => c._id === batch.course_id
                          );
                          return (
                            <div
                              key={batch._id}
                              className="border rounded-lg p-4 hover:shadow-md transition"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-lg">
                                  {batch.batchName}
                                </h3>
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    value === "ongoing"
                                      ? "bg-green-100 text-green-800"
                                      : value === "upcoming"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {value.charAt(0).toUpperCase() +
                                    value.slice(1)}
                                </span>
                              </div>

                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <BookOpen className="w-4 h-4 text-gray-500" />
                                  <span>
                                    {course?.courseName || "No course assigned"}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-gray-500" />
                                  <span>
                                    {batch.instructors?.join(", ") ||
                                      "No instructor assigned"}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <UsersIcon className="w-4 h-4 text-gray-500" />
                                  <span>
                                    {batch.occupiedSeat || 0}/{batch.seat}{" "}
                                    students
                                  </span>
                                </div>

                                {(batch.status === "Ongoing" ||
                                  batch.status === "Completed") && (
                                  <div className="">
                                    <div className="flex justify-between text-xs mb-1">
                                      <span>Progress:</span>
                                      <span>
                                        {batch.completedClassesCount || 0}/
                                        {course?.numberOfClass || 27} classes
                                      </span>
                                    </div>
                                    <progress
                                      className="progress progress-primary w-full h-2"
                                      value={batch.completedClassesCount || 0}
                                      max={course?.numberOfClass || 27}
                                    ></progress>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-3 text-center py-8 text-gray-500">
                          No {value} batches found
                        </div>
                      )}
                    </div>
                  </TabPanel>
                ))}
              </TabsBody>
            </Tabs>
          </div>

          {/* Notices Section */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mt-8">
            {/* Latest Notices */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Bell className="text-blue-600" />
                  Latest Notices
                </h2>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {latestNotices.length}
                </span>
              </div>

              {latestNotices.length > 0 ? (
                <div className="space-y-4">
                  {latestNotices.map((notice) => (
                    <div
                      key={notice._id}
                      className="border-l-4 border-blue-500 pl-4 py-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{notice.title}</h3>
                          <p className="text-sm text-gray-600">
                            {notice.description}
                          </p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(notice.createdAt)}
                        </div>
                      </div>
                      {notice.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {notice.tags.map((tag) => (
                            <span
                              key={tag}
                              className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No notices available
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
