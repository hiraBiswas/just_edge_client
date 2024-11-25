import React from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import axiosPublic from "../../../hooks/useAxiosPublic";

const InstructorContainer = () => {
  const axiosSecure = useAxiosSecure();

  // Fetch users where type = "instructor"
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axiosSecure.get("/users");
      console.log("Fetched Users:", res.data); // Log fetched users data
      return res.data.filter((user) => user.type === "instructor");
    },
  });

  // Fetch instructors data
  const { data: instructors = [] } = useQuery({
    queryKey: ["instructors"],
    queryFn: async () => {
      const res = await axiosSecure.get("/instructors");
      console.log("Fetched Instructors:", res.data); // Log fetched instructors data
      return res.data;
    },
  });

  // Combine users and instructors data
  const combinedData = React.useMemo(() => {
    const combined = instructors
      .map((instructor) => {
        const userInfo = users.find(
          (user) => user._id === instructor.userId
        );
        if (!userInfo) return null;

        return {
          _id: userInfo._id,
          name: userInfo.name,
          email: userInfo.email,
          image: userInfo.image,
          type: userInfo.type,
          contact: instructor.contact, // Use the contact from instructor data
        };
      })
      .filter(Boolean); // Remove null values

    console.log("Combined Data:", combined); // Log the combined data
    return combined;
  }, [instructors, users]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {combinedData.map((instructor) => (
        <div
          key={instructor._id}
          className="card bg-white shadow-md rounded-lg p-4"
        >
          <div className="flex items-center">
            <img
              src={instructor.image || "https://via.placeholder.com/150"}
              alt={instructor.name || "Anonymous"}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">{instructor.name}</h3>
              <p className="text-sm text-gray-500">{instructor.email}</p>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-700">
            <strong>Contact:</strong> {instructor.contact || "N/A"}
          </p>
        </div>
      ))}
    </div>
  );
};

export default InstructorContainer;
