import React, { useState } from "react";

const CreateCourse = () => {
  const [courseName, setCourseName] = useState("");
  const [level, setLevel] = useState("");
  const [courseDuration, setCourseDuration] = useState("");
  const [minimumEducationalQualification, setMinimumEducationalQualification] = useState("");
  const [ageLimit, setAgeLimit] = useState("");
  const [image, setImage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const newCourse = {
      courseName,
      level,
      courseDuration,
      minimumEducationalQualification,
      ageLimit,
      image,
      enrolled_student: [], // Initially empty
    };

    // Send POST request to your API
    fetch("http://localhost:5000/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newCourse),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Course created:", data);
        // Clear form or show success message
      })
      .catch((error) => console.error("Error creating course:", error));
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 max-w-7xl gap-8">
      <div>
        <label className="block text-sm font-medium text-gray-700">Course Name</label>
        <input
          type="text"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Level</label>
        <input
          type="text"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Course Duration</label>
        <input
          type="text"
          value={courseDuration}
          onChange={(e) => setCourseDuration(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Minimum Educational Qualification</label>
        <input
          type="text"
          value={minimumEducationalQualification}
          onChange={(e) => setMinimumEducationalQualification(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Age Limit</label>
        <input
          type="text"
          value={ageLimit}
          onChange={(e) => setAgeLimit(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Image URL</label>
        <input
          type="text"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        />
      </div>
      <button
        type="submit"
        className="mt-4 w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
      >
        Create Course
      </button>
    </form>
  );
};

export default CreateCourse;
