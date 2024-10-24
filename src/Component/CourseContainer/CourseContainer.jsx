import React, { useState, useEffect } from "react";
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";
import Course from "../Courses/Course";

const CourseContainer = () => {
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    fetch("http://localhost:5000/courses")
      .then((response) => response.json())
      .then((data) => setCourses(data))
      .catch((error) => console.error("Error fetching courses:", error));
  }, []);

  const filteredCourses =
    activeTab === "All"
      ? courses
      : courses.filter((course) => course.level === activeTab);

  const data = [
    { label: "All", value: "All" },
    { label: "Foundational", value: "Foundational Level" },
    { label: "Intermediate", value: "Intermediate Level" },
    { label: "Advanced", value: "Advanced Level" },
  ];

  return (
    <div className="px-4 lg:px-16 mx-auto mt-8 lg:mt-16 max-w-7xl"> 
      <h1 className="text-2xl font-bold lg:text-4xl text-center text-blue-950">
        Courses
      </h1>

      <div className="mt-8">
        <Tabs value={activeTab}>
          <TabsHeader
            className="border-gray-300 bg-transparent p-0"
            indicatorProps={{
              className:
                "bg-transparent border-b-2 border-gray-900 shadow-none rounded-none text-md font-semibold lg:text-2xl",
            }}
          >
            <div className="flex gap-2 justify-center lg:gap-6">
              {data.map(({ label, value }) => (
                <Tab
                  key={value}
                  value={value}
                  onClick={() => setActiveTab(value)}
                  className={`text-lg font-medium lg:text-2xl lg:font-semibold ${
                    activeTab === value
                      ? "text-gray-900 border-b-2 border-gray-900"
                      : "text-gray-500"
                  }`}
                >
                  {label}
                </Tab>
              ))}
            </div>
          </TabsHeader>
          <TabsBody>
            {data.map(({ value }) => (
              <TabPanel key={value} value={value}>
                <div className="mt-10">
                  <div className="grid gap-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredCourses.map((course) => (
                      <Course key={course._id} course={course}></Course>
                    ))}
                  </div>
                </div>
              </TabPanel>
            ))}
          </TabsBody>
        </Tabs>
      </div>
    </div>
  );
};

export default CourseContainer;
