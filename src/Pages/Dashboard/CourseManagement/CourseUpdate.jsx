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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          image: data.image || null, // Ensure image is null if not present
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
    setIsSubmitting(true);
    const toastId = toast.loading("Updating course...");

    try {
      let imageUrl = course.image;

      // Only upload if a new image file was selected
      if (course.image && typeof course.image === "object") {
        // toast.loading("Uploading image...", { id: toastId });
        const formData = new FormData();
        formData.append("image", course.image);

        const imageUploadResponse = await fetch(image_hosting_api, {
          method: "POST",
          body: formData,
        });

        if (!imageUploadResponse.ok) {
          throw new Error("Image upload failed");
        }

        const result = await imageUploadResponse.json();
        if (!result.success) {
          throw new Error("Image upload failed");
        }

        imageUrl = result.data.display_url;
      }

      // Prepare updated course data
      const updatedCourseData = {
        courseName: course.courseName,
        level: course.level,
        numberOfClass: course.numberOfClass,
        classDuration: course.classDuration,
        minimumQualification: course.minimumQualification,
        ageLimit: course.ageLimit,
        image: imageUrl || course.image, // Keep existing image if no new one was uploaded
        isDeleted: course.isDeleted,
      };

      // Update course
      toast.loading("Saving changes...", { id: toastId });
      const response = await axiosPublic.patch(`/courses/${id}`, updatedCourseData);

      if (response.data) {
        toast.success("Course updated successfully", { id: toastId });
        setTimeout(() => {
          navigate("/dashboard/courseManagement");
        }, 1000);
      } else {
        throw new Error("Failed to update course");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update course", { id: toastId });
      console.error("Update error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourse({ ...course, [name]: value });
  };

  const handleImageChange = (e) => {
    // Set to null if no file selected (instead of undefined)
    setCourse({ ...course, image: e.target.files[0] || null });
  };

  const handleRemoveImage = () => {
    setCourse({ ...course, image: null });
  };

  return (
    <div className=" w-[1100px] mx-auto mt-6 ">
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

 {/* Image Upload - Now Optional */}
 <div>
            <label className="block text-sm font-medium mb-1">
              Course Image (Optional)
            </label>
            {course.image && typeof course.image === "string" ? (
              <div className="mb-2 relative">
                <img
                  src={course.image}
                  alt="Current course"
                  className="w-24 h-24 object-cover border border-gray-300 rounded"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 btn btn-circle btn-xs btn-error"
                >
                  ✕
                </button>
              </div>
            ) : null}
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input file-input-bordered w-full file-input-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to keep current image
            </p>
          </div>

          <button
            type="submit"
            className="btn btn-sm bg-blue-900 hover:bg-blue-800 text-white w-full mt-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Updating...
              </>
            ) : (
              "Update Course"
            )}
          </button>
        </form>
      </div>
      <Toaster position="top-center" />
    </div>
  );
};

export default UpdateCourse;
