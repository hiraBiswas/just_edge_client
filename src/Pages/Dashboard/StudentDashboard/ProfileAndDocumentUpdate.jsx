import React, { useState } from "react";
import {
  Tabs,
  TabsHeader,
  Tab,
  TabsBody,
  TabPanel,
} from "@material-tailwind/react";
import UpdateProfile from "../StudentDashboard/UpdateProfile/UpdateProfile";
import OnlineProfile from "./OnlineProfile/OnlineProfile";

const ProfileAndDocumentUpdate = () => {
  const [activeTab, setActiveTab] = useState("personal");

  const data = [
    {
      label: "Personal Information",
      value: "personal",
      desc: <UpdateProfile />,
    },
    {
      label: "Online Profiles",
      value: "online",
      desc: <OnlineProfile />,
    },
  ];

  return (
    <div className="w-[1100px] mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-2xl font-bold text-gray-800 mb-3">
        Profile Management
      </h1>
      
      <Tabs value={activeTab} className="min-h-[500px]">
        <TabsHeader
          className="bg-transparent p-0 border-b border-gray-200 rounded-none"
          indicatorProps={{
            className: "bg-blue-500 h-1 rounded-none top-full", // Changed to top-full
          }}
        >
          {data.map(({ label, value }) => (
            <Tab
              key={value}
              value={value}
              onClick={() => setActiveTab(value)}
              className={`py-3 px-4 text-sm md:text-base font-medium relative ${
                activeTab === value ? "text-blue-500" : "text-gray-600"
              }`}
            >
              {label}
            </Tab>
          ))}
        </TabsHeader>
        
        <TabsBody className="mt-6">
          {data.map(({ value, desc }) => (
            <TabPanel key={value} value={value} className="p-0">
              {desc}
            </TabPanel>
          ))}
        </TabsBody>
      </Tabs>
    </div>
  );
};

export default ProfileAndDocumentUpdate;