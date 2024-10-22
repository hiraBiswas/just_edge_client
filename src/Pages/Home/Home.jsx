import React, { useEffect, useState } from "react";
import Navbar from "../../Shared/Navbar/Navbar";
import Banner from "./Banner";
import Courses from "./Courses/Courses";
import Course from "./Courses/Course";

const Home = () => {
  const [courses, setCourses] = useState([]);
  useEffect(() => {
    fetch("http://localhost:5000/courses")
      .then((response) => response.json())
      .then((data) => setCourses(data))
      .catch((error) => console.error("Error fetching courses:", error));
  }, []);
  return (
    <div>
      <Banner></Banner>

      <div>
        <h1 className="text-2xl mt-16 font-bold  lg:text-5xl text-center text-blue-950  ">
          Courses
        </h1>

        <div className="container mx-auto text-white shadow-2xl mt-5  rounded-xl grid gap-12 grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Course key={course._id} course={course}></Course>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
