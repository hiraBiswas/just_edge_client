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
import AdminHome from "../Pages/Dashboard/AdminHome/AdminHome";
import AdminRoute from "../Routes/AdminRoute"
import AllUser from "../Pages/Dashboard/AllUser/AllUser"
import Dashboard from "../Layout/Dashboard";
import About from "../Pages/About/About";
import CourseAssignment from "../Pages/Dashboard/CourseAssignment/CourseAssignment";
import CourseManagement from "../Pages/Dashboard/CourseManagement/CourseManagement";


  export const router = createBrowserRouter([
    {
        path: "/",
        element: <Main></Main>,
        errorElement: <ErrorPage></ErrorPage>,
        children: [
          {
            path: "/",
            element: <Home></Home>,
          },

          {
            path: "/login",
            element: <Login></Login>,
          },

          {
            path: "/register",
            element: <Register></Register>,
          },

          {
            path: "/contact",
            element: <Contact></Contact>,
          },

          {
            path: "/about",
            element: <About></About>,
           
          },

          {
            path: '/courseMaterial/:id',
            element:<PrivateRoute><Details></Details></PrivateRoute> ,
            loader: ({ params }) => fetch(`http://localhost:5000/courses/${params.id}`)
          },
        ],
      },

      {
        path: 'dashboard',
        element: <PrivateRoute><Dashboard></Dashboard></PrivateRoute>,
        children: [
          // normal user routes
          // {
          //   index: true,
          //   element: <AllRequests></AllRequests>
          // },
          // {
          //   path: 'allRequest',
          //   element: <AllRequests></AllRequests>
          // },
  
        
          // {
          //   path: 'approvedRequest',
          //   element: <ApprovedRequest></ApprovedRequest>
          // },
          // {
          //   path: 'pendingRequest',
          //   element: <PendingRequest></PendingRequest>
          // },
          
          // {
          //   path: 'updateRequest/:id',
          //   element: <UpdateRequest></UpdateRequest>,
          //   loader: ({params}) => fetch(`http://localhost:5000/rent/${params.id}`)
          // },
  
          
          {
            path: 'adminHome',
            element:<AdminRoute><AdminHome></AdminHome></AdminRoute>
          },

          {
            path: 'courseManagement',
            element:<AdminRoute><CourseManagement></CourseManagement></AdminRoute>
          },
        
          {
            path: 'courseAssignment',
            element: <AdminRoute><CourseAssignment></CourseAssignment></AdminRoute>
          },
  
         
         
        ]
      }
    ]);
    