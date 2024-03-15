import {
    createBrowserRouter
  } from "react-router-dom";
import Main from "../Layout/Main";
import ErrorPage from "../Pages/ErrorPage";
import Home from "../Pages/Home/Home";
import Login from "../Pages/Login/Login";
import Register from "../Pages/Register/Register";
import Contact from "../Pages/Contact/Contact";
import AllCourses from "../Pages/AllCouses/AllCourses";
import Details from "../Pages/Details/Details";



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
            path: "/courses",
            element: <AllCourses></AllCourses>,
            // loader: () => fetch('http://localhost:5000/courses')
          },

          {
            path: '/details/:id',
            element:<Details></Details> ,
            loader: ({ params }) => fetch(`http://localhost:5000/courses/${params.id}`)
          },
        ],
      },
    ]);
    