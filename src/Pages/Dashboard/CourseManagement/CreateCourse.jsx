import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useAxiosPublic from "../../../hooks/useAxiosPublic";

const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY;
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

const CreateCourse = () => {
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [course, setCourse] = useState({
    courseName: "",
    level: "",
    numberOfClass: "",
    classDuration: "",
    minimumQualification: "",
    ageLimit: "",
    image: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation for required fields (excluding image)
    if (!course.courseName || !course.level || !course.numberOfClass || 
        !course.classDuration || !course.minimumQualification || !course.ageLimit) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Creating course...");
    
    try {
      let imageUrl = course.image;
      
      // Only upload if image is provided and it's a File object
      if (course.image && typeof course.image === "object") {
        const formData = new FormData();
        formData.append("image", course.image);
        
        toast.loading("Uploading image...", { id: toastId });
        const imageUploadResponse = await fetch(image_hosting_api, {
          method: "POST",
          body: formData,
        });
        
        if (!imageUploadResponse.ok) {
          throw new Error(`Image upload failed with status: ${imageUploadResponse.status}`);
        }

        const result = await imageUploadResponse.json();
        
        if (!result.success) {
          throw new Error("Image upload failed");
        }
        
        imageUrl = result.data.display_url;
      }

      // Prepare course data (image can be null)
      const courseData = {
        courseName: course.courseName,
        level: course.level,
        numberOfClass: course.numberOfClass,
        classDuration: course.classDuration,
        minimumQualification: course.minimumQualification,
        ageLimit: course.ageLimit,
        image: imageUrl || null, // Handle case where no image was provided
        isDeleted: false,
      };

      // Post course data
      toast.loading("Saving course...", { id: toastId });
      const response = await axiosPublic.post("/courses", courseData);

      if (response.data.insertedId) {
        toast.success("Course created successfully!", { id: toastId });
        
        // Reset form state
        setCourse({
          courseName: "",
          level: "",
          numberOfClass: "",
          classDuration: "",
          minimumQualification: "",
          ageLimit: "",
          image: null,
        });

        // Navigate after 1 second
        setTimeout(() => {
          navigate("/dashboard/courseManagement");
        }, 1000);
      } else {
        throw new Error("Failed to save course");
      }
    } catch (error) {
      toast.error(error.message || "Failed to create course", { id: toastId });
      console.error("Error:", error);
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


  return (
    <div className=" bg-white w-[1100px] mx-auto mt-5 rounded-lg shadow-sm">
      <nav className="text-gray-600 mb-6" aria-label="Breadcrumb">
        <ol className="list-none p-0 inline-flex space-x-2">
          <li className="flex items-center">
            <a
              href="/dashboard"
              className="text-blue-900 text-lg font-medium hover:underline"
            >
              Dashboard
            </a>
            <span className="mx-2 text-gray-400">/</span>
          </li>
          <li className="flex items-center">
            <a
              href="/dashboard/courseManagement"
              className="text-blue-900 text-lg font-medium hover:underline"
            >
              Course Management
            </a>
            <span className="mx-2 text-gray-400">/</span>
          </li>
          <li className="text-gray-800 font-medium text-lg">Create Course</li>
        </ol>
      </nav>

      <div className="w-full max-w-lg mx-auto bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Create New Course
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Course Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Course Name*
            </label>
            <input
              type="text"
              name="courseName"
              value={course.courseName}
              onChange={handleChange}
              className="input input-bordered w-full input-sm"
              required
              placeholder="Enter course name"
            />
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-medium mb-1">Level*</label>
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
              <option value="Foundational Level">Foundational Level</option>
              <option value="Intermediate Level">Intermediate Level</option>
              <option value="Advanced Level">Advanced Level</option>
            </select>
          </div>

          {/* Number of Classes and Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Number of Classes*
              </label>
              <input
                type="number"
                name="numberOfClass"
                value={course.numberOfClass}
                onChange={handleChange}
                className="input input-bordered w-full input-sm"
                required
                placeholder="e.g. 12"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Duration (hours)
              </label>
              <input
                type="number"
                name="classDuration"
                value={course.classDuration}
                onChange={handleChange}
                className="input input-bordered w-full input-sm"
                required
                placeholder="e.g. 1.5"
                step="0.5"
                min="0.5"
              />
            </div>
          </div>

          {/* Qualification and Age Limit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Min Qualification
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
                type="number"
                name="ageLimit"
                value={course.ageLimit}
                onChange={handleChange}
                className="input input-bordered w-full input-sm"
                required
                placeholder="18+ years"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Course Image (Optional)
            </label>
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
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Saving...
              </>
            ) : (
              "Create Course"
            )}
          </button>
        </form>
      </div>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default CreateCourse;