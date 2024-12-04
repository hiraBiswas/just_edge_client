import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useAxiosPublic from '../../../hooks/useAxiosPublic';

const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY;
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

const UpdateCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosPublic = useAxiosPublic();
  const [course, setCourse] = useState({
    courseName: '',
    level: '',
    courseDuration: '',
    minimumEducationalQualification: '',
    ageLimit: '',
    image: null,
    isDeleted: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/courses/${id}`);
        if (!response.ok) throw new Error('Failed to fetch course details');

        const data = await response.json();
        setCourse({
          courseName: data.courseName,
          level: data.level,
          courseDuration: data.courseDuration,
          minimumEducationalQualification: data.minimumEducationalQualification,
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
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Submitting course data:", course);

    let imageUrl = course.image;
    if (typeof course.image === 'object') {
      const formData = new FormData();
      formData.append('image', course.image);

      try {
        const imageUploadResponse = await fetch(image_hosting_api, {
          method: 'POST',
          body: formData,
        });
        if (!imageUploadResponse.ok) throw new Error(`ImgBB upload failed with status: ${imageUploadResponse.status}`);

        const result = await imageUploadResponse.json();
        if (!result.success) {
          toast.error('Error during image upload', { autoClose: 3000 }); // Toast with timer
          return;
        }
        imageUrl = result.data.display_url;
      } catch (error) {
        console.error('Error:', error.message);
        toast.error('Failed to upload image.', { autoClose: 3000 }); // Toast with timer
        return;
      }
    }

    const updatedCourseData = {
      ...course,
      image: imageUrl,
      isDeleted: course.isDeleted,
    };

    try {
      const response = await axiosPublic.patch(`/courses/${id}`, updatedCourseData);
      if (response.data) {
        toast.success('Course updated successfully', { autoClose: 3000 }); // Toast with timer
        navigate('/dashboard/courseManagement');
      } else {
        toast.error('Course update failed', { autoClose: 3000 }); // Toast with timer
      }
    } catch (error) {
      console.error('Error:', error.message);
      toast.error('Failed to update course.', { autoClose: 3000 }); // Toast with timer
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourse({ ...course, [name]: value });
    console.log(`Field changed: ${name} = ${value}`);
  };

  const handleImageChange = (e) => {
    setCourse({ ...course, image: e.target.files[0] });
    console.log("Selected image:", e.target.files[0]);
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
    <div className="p-6 bg-white w-[1100px] mx-auto mt-5">
      {/* Updated Breadcrumbs */}
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
          <li className="text-black font-medium text-xl">Update Course</li>
          <span className="mx-2">/</span>
          <li className="text-black font-medium text-xl"> {course.courseName}</li> 
        </ol>
      </nav>

      <div className="w-[600px] mx-auto shadow-xl mt-8 p-8">
        {/* <h2 className="text-2xl font-bold mb-4 text-center">Update Course</h2> */}
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

          <div className="flex flex-col space-y-2 items-start">
            <label className="font-medium w-40">Image:</label>
            {course.image && typeof course.image === 'string' && (
              <img
                src={course.image}
                alt="Current course"
                className="w-32 h-32 object-cover mb-2 border border-gray-300"
              />
            )}
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input file-input-bordered w-full"
            />
          </div>

          <button type="submit" className="btn bg-blue-950 text-white w-full mt-4">
            Update Course
          </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default UpdateCourse;
