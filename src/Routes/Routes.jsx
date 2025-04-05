import {
  createBrowserRouter
} from "react-router-dom";
import Main from "../Layout/Main";
import ErrorPage from "../Pages/ErrorPage";
import Home from "../Pages/Home/Home";
import Login from "../Pages/Login/Login";
import Register from "../Pages/Register/Register";
import Contact from "../Pages/Contact/Contact";
import Details from "../Pages/Details/Details";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "../Routes/AdminRoute";
import AllUser from "../Pages/Dashboard/AllUser/AllUser";
import Dashboard from "../Layout/Dashboard";
import About from "../Pages/About/About";
import CourseAssignment from "../Pages/Dashboard/CourseAssignment/CourseAssignment";
import CourseManagement from "../Pages/Dashboard/CourseManagement/CourseManagement";
import CreateCourse from "../Pages/Dashboard/CourseManagement/CreateCourse";
import CourseDetails from "../Pages/Dashboard/CourseManagement/CourseDetails";
import CourseUpdate from "../Pages/Dashboard/CourseManagement/CourseUpdate";
import BatchManagement from "../Pages/Dashboard/BatchManagement/BatchManagement";
import BatchDetails from "../Pages/Dashboard/BatchManagement/BatchDetails";
import InstructorManagement from "../Pages/Dashboard/InstructorManagement/InstructorManagement";
import InstructorRoutine from "../Pages/Dashboard/InstructorDashboard/InstructorRoutine/InstructorRoutine";
import InstructorRoute from "./InstructorRoute";
import PendingInstructor from "../Pages/Dashboard/InstructorManagement/PendingInstructor";
import UpdateProfile from "../Pages/Dashboard/StudentDashboard/UpdateProfile/UpdateProfile";
import OnlineProfile from "../Pages/Dashboard/StudentDashboard/OnlineProfile/OnlineProfile";
import Classes from "../Pages/Dashboard/InstructorDashboard/Classes/Classes";
import UploadResult from "../Pages/Dashboard/Result/UploadResult";
import ResultTable from "../Pages/Dashboard/Result/ResultTable";
import NoticeManagement from "../Pages/Dashboard/NoticeManagement.jsx/NoticeManagement";
import Notice from "../Pages/Dashboard/NoticeManagement.jsx/Notice";
import ClassList from "../Pages/Dashboard/InstructorDashboard/Classes/ClassList";
import InstructorDashboard from "../Pages/Dashboard/InstructorDashboard/InstructorHome/InstructorDashboard";
import StudentDashboard from "../Pages/Dashboard/StudentDashboard/StudentDashboard";
import DashboardRedirect from "../Pages/Dashboard/DashboarRedirect/DashboarRedirect";
import BatchEnrollment from "../Pages/Dashboard/StudentDashboard/BatchEnrollment/EnrollmentRequests";
import AdminDashboard from "../Pages/Dashboard/AdminHome/AdminDashboard";
import UpdateBatch from "../Pages/Dashboard/BatchManagement/UpdateBatch";
import ChangeRequests from "../Pages/Dashboard/CourseAssignment/ChangeRequests/ChangeRequests";
import ProfileAndDocumentUpdate from "../Pages/Dashboard/StudentDashboard/ProfileAndDocumentUpdate";

export const router = createBrowserRouter([
  {
      path: "/",
      element: <Main />,
      errorElement: <ErrorPage />,
      children: [
          {
              path: "/",
              element: <Home />,
          },
          {
              path: "/login",
              element: <Login />,
          },
          {
              path: "/register",
              element: <Register />,
          },
          {
              path: "/contact",
              element: <Contact />,
          },
          {
              path: "/about",
              element: <About />,
          },

          {
            path: 'notice',
            element: <Notice />,
        },

          {
              path: '/courseMaterial/:id',
              element: <PrivateRoute><Details /></PrivateRoute>,
              loader: ({ params }) => fetch(`http://localhost:5000/courses/${params.id}`)
          },
      ],
  },
  {
      path: 'dashboard',
      element: <PrivateRoute><Dashboard /></PrivateRoute>,
      children: [

        {
            index: true, // This will automatically redirect when visiting /dashboard
            element:<DashboardRedirect></DashboardRedirect>
        },

          {
              path: 'adminDashboard',
              element: <AdminRoute><AdminDashboard></AdminDashboard></AdminRoute>
          },
          {
              path: 'courseManagement',
              element: <AdminRoute><CourseManagement /></AdminRoute>
          },
          {
              path: 'courseAssignment',
              element: <AdminRoute><CourseAssignment /></AdminRoute>
          },

          {
            path: 'changeRequests',
            element: <AdminRoute><ChangeRequests /></AdminRoute>
        },


          {
              path: 'createCourse',
              element: <AdminRoute><CreateCourse/></AdminRoute>
          },


          {
            path: 'noticeManagement',
            element: <AdminRoute><NoticeManagement /></AdminRoute>
        },

    
          {
              path: 'courseDetails/:id',
              element: <AdminRoute><CourseDetails /></AdminRoute>
          },

          {
            path: 'batchDetails/:id',
            element: <AdminRoute><BatchDetails></BatchDetails></AdminRoute>
        },

          {
            path: 'courseUpdate/:id',
            element: <AdminRoute><CourseUpdate /></AdminRoute>
        },

        {
            path: 'batchManagement',
            element: <AdminRoute><BatchManagement></BatchManagement></AdminRoute>
        },

        {
            path: 'updateBatch/:id',
            element: <AdminRoute><UpdateBatch></UpdateBatch></AdminRoute>
        },
        {
            path: 'instructorManagement',
            element: <AdminRoute><InstructorManagement></InstructorManagement></AdminRoute>
        },
        {
            path: 'pendingInstructor',
            element: <AdminRoute><PendingInstructor></PendingInstructor></AdminRoute>
        },

        {
            path: 'instructorDashboard',
            element:<InstructorRoute><InstructorDashboard></InstructorDashboard></InstructorRoute>
        },

        {
            path: 'instructorRoutine',
            element: <InstructorRoute><InstructorRoutine></InstructorRoutine></InstructorRoute>
        },

        {
            path: 'classes',
            element: <InstructorRoute><Classes></Classes></InstructorRoute>
        },

        {
            path: 'classList',
            element: <InstructorRoute><ClassList></ClassList></InstructorRoute>
        },

        {
            path: 'result',
            element: <InstructorRoute><ResultTable></ResultTable></InstructorRoute>
        },

        {
            path: 'studentDashboard',
            element: <StudentDashboard></StudentDashboard>
        },


      

        {
            path: 'profileAndDocument',
            element: <ProfileAndDocumentUpdate></ProfileAndDocumentUpdate>
        },



      ]
  }
]);
