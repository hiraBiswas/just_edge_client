import React, { useState } from "react";
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";
import CourseForm from "./CreateCourse"; 
import CourseUpdateForm from "./UpdateCourse"; 

const CourseManagement = () => {
  const [activeTab, setActiveTab] = useState("Create Course");

  const data = [
    { label: "Create Course", value: "Create Course" },
    { label: "Update Course", value: "Update Course" },
  ];

  return (
    <div className="px-4 lg:px-16 mx-auto mt-8 lg:mt-16 max-w-7xl">
      <h1 className="text-2xl font-bold lg:text-4xl text-center text-blue-950">
        Course Management
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
            {/* Center the Tabs Header */}
            <div className="flex gap-2 lg:gap-6 justify-center w-full">
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
                  {value === "Create Course" && <CourseForm />}
                  {value === "Update Course" && <CourseUpdateForm />}
                </div>
              </TabPanel>
            ))}
          </TabsBody>
        </Tabs>
      </div>
    </div>
  );
};

export default CourseManagement;
