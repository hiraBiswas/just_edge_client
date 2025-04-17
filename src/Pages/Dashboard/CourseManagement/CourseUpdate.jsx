import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import useAxiosPublic from "../../../hooks/useAxiosPublic";

const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY;
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

const UpdateCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosPublic = useAxiosPublic();
  const [course, setCourse] = useState({
    courseName: "",
    level: "",
    numberOfClass: "",
    classDuration: "",
    minimumQualification: "",
    ageLimit: "",
    image: null,
    isDeleted: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await axiosPublic.get(`/courses/${id}`);
        const data = response.data;
        setCourse({
          courseName: data.courseName,
          level: data.level,
          numberOfClass: data.numberOfClass,
          classDuration: data.classDuration,
          minimumQualification: data.minimumQualification,
          ageLimit: data.ageLimit,
          image: data.image,
          isDeleted: data.isDeleted,
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id, axiosPublic]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageUrl = course.image;
    if (typeof course.image === "object") {
      const formData = new FormData();
      formData.append("image", course.image);

      try {
        const imageUploadResponse = await fetch(image_hosting_api, {
          method: "POST",
          body: formData,
        });
        if (!imageUploadResponse.ok) throw new Error(`ImgBB upload failed`);

        const result = await imageUploadResponse.json();
        if (!result.success) {
          toast.error("Error during image upload");
          return;
        }
        imageUrl = result.data.display_url;
      } catch (error) {
        toast.error("Failed to upload image.");
        return;
      }
    }

    const updatedCourseData = {
      ...course,
      image: imageUrl,
    };

    try {
      const response = await axiosPublic.patch(
        `/courses/${id}`,
        updatedCourseData
      );
      if (response.data) {
        toast.success("Course updated successfully");
        setTimeout(() => {
          navigate("/dashboard/courseManagement");
        }, 1000);
      } else {
        toast.error("Course update failed");
      }
    } catch (error) {
      toast.error("Failed to update course.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourse({ ...course, [name]: value });
  };

  const handleImageChange = (e) => {
    setCourse({ ...course, image: e.target.files[0] });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-ring loading-lg"></span>
      </div>
    );
  }

  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-4  w-[1050px] mx-auto mt-5 ">
      <div className="breadcrumbs text-md mb-6">
        <ul className="flex items-center space-x-2 text-gray-600">
          <li>
            <Link
              to="/dashboard"
              className="text-blue-600 hover:underline font-medium"
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/courseManagement"
              className="text-blue-600 hover:underline font-medium"
            >
              Course Management
            </Link>
          </li>
          <li className="text-gray-500 font-medium">Update Course</li>
          <li className="text-gray-500 font-medium truncate max-w-xs">
            {course.courseName}
          </li>
        </ul>
      </div>

      <div className="w-full max-w-lg mx-auto bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Update Course
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Course Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Course Name
            </label>
            <input
              type="text"
              name="courseName"
              value={course.courseName}
              onChange={handleChange}
              className="input input-bordered w-full input-sm"
              required
              placeholder="Course name"
            />
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-medium mb-1">Level</label>
            <select
              name="level"
              value={course.level}
              onChange={handleChange}
              className="select select-bordered w-full select-sm"
              required
            >
              <option value="" disabled>
                Select Level
              </option>
              <option value="Foundational Level">Foundational</option>
              <option value="Intermediate Level">Intermediate</option>
              <option value="Advanced Level">Advanced</option>
            </select>
          </div>

          {/* Number of Classes and Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Classes</label>
              <input
                type="number"
                name="numberOfClass"
                value={course.numberOfClass}
                onChange={handleChange}
                className="input input-bordered w-full input-sm"
                required
                placeholder="12"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Duration (hrs)
              </label>
              <input
                type="number"
                name="classDuration"
                value={course.classDuration}
                onChange={handleChange}
                className="input input-bordered w-full input-sm"
                required
                placeholder="1.5"
                step="0.5"
                min="0.5"
              />
            </div>
          </div>

          {/* Qualification and Age Limit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Qualification
              </label>
              <input
                type="text"
                name="minimumQualification"
                value={course.minimumQualification}
                onChange={handleChange}
                className="input input-bordered w-full input-sm"
                required
                placeholder="High School"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Age Limit
              </label>
              <input
                type="text"
                name="ageLimit"
                value={course.ageLimit}
                onChange={handleChange}
                className="input input-bordered w-full input-sm"
                required
                placeholder="18+"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Course Image
            </label>
            {course.image && typeof course.image === "string" && (
              <img
                src={course.image}
                alt="Current course"
                className="w-24 h-24 object-cover mb-2 border border-gray-300 rounded"
              />
            )}
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input file-input-bordered w-full file-input-sm"
            />
          </div>

          <button
            type="submit"
            className="btn btn-sm bg-blue-900 hover:bg-blue-800 text-white w-full mt-4"
          >
            Update Course
          </button>
        </form>
      </div>
      <Toaster position="top-center" />
    </div>
  );
};

export default UpdateCourse;
