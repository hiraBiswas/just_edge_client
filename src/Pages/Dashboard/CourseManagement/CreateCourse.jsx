import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useAxiosPublic from '../../../hooks/useAxiosPublic';

const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY;
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

const CreateCourse = () => {
  const axiosPublic = useAxiosPublic();
  const [course, setCourse] = useState({
    courseName: '',
    level: '',
    courseDuration: '',
    minimumEducationalQualification: '',
    ageLimit: '',
    image: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('image', course.image);

    try {
      // Step 1: Upload image to ImgBB
      const imageUploadResponse = await fetch(image_hosting_api, {
        method: 'POST',
        body: formData,
      });
      if (!imageUploadResponse.ok) throw new Error(`ImgBB upload failed with status: ${imageUploadResponse.status}`);

      const result = await imageUploadResponse.json();
      if (!result.success) {
        toast.error('Error during image upload');
        return;
      }

      const imageUrl = result.data.display_url;
      const newCourse = {
        courseName: course.courseName,
        level: course.level,
        courseDuration: course.courseDuration,
        minimumEducationalQualification: course.minimumEducationalQualification,
        ageLimit: course.ageLimit,
        image: imageUrl,
        isDeleted: false, 
      };
      

      const newCourseResponse = await axiosPublic.post('/courses', newCourse);
      if (newCourseResponse.data.insertedId) {
        e.target.reset(); // reset form
        toast.success('Course added successfully');
      } else {
        toast.error('Course could not be added');
      }
    } catch (error) {
      console.error('Error:', error.message);
      toast.error('Failed to create course.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourse({ ...course, [name]: value });
  };

  const handleImageChange = (e) => {
    setCourse({ ...course, image: e.target.files[0] });
  };


  return (
    <div className="p-6 bg-white w-[1100px] mx-auto mt-5">
      <nav className="text-gray-600 mb-4" aria-label="Breadcrumb">
        <ol className="list-none p-0 inline-flex space-x-2">
          <li className="flex items-center">
            <a href="/dashboard" className="text-blue-900 text-xl font-medium hover:underline">Dashboard</a>
            <span className="mx-2">/</span>
          </li>
          <li className="flex items-center">
            <a href="/dashboard/courseManagement" className="text-blue-900 text-xl font-medium hover:underline">Course Management</a>
            <span className="mx-2">/</span>
          </li>
          <li className="text-black font-medium text-xl">Create Course</li>
        </ol>
      </nav>

      <div className="w-[600px] mx-auto shadow-xl mt-8 p-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Create Course</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-4">
            <label className="font-medium w-40">Course Name:</label>
            <input
              type="text"
              name="courseName"
              value={course.courseName}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="font-medium w-40">Level:</label>
            <select
              name="level"
              value={course.level}
              onChange={handleChange}
              className="select select-bordered w-full"
              required
            >
              <option value="" disabled>Select Level</option>
              <option value="Foundational Level">Foundational Level</option>
              <option value="Intermediate Level">Intermediate Level</option>
              <option value="Advanced Level">Advanced Level</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="font-medium w-40">Course Duration:</label>
            <input
              type="text"
              name="courseDuration"
              value={course.courseDuration}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="font-medium w-40">Minimum Qualification:</label>
            <input
              type="text"
              name="minimumEducationalQualification"
              value={course.minimumEducationalQualification}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="font-medium w-40">Age Limit:</label>
            <input
              type="text"
              name="ageLimit"
              value={course.ageLimit}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="font-medium w-40">Image:</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input file-input-bordered w-full"
              required
            />
          </div>

          <button type="submit" className="btn bg-blue-950 text-white w-full mt-4">
            Submit
          </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default CreateCourse;
