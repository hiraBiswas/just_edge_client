import React, { useState, useEffect } from 'react';

const UpdateForm = ({ initialData, onClose }) => {
    const [courseData, setCourseData] = useState(initialData || {});
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        setCourseData(initialData);
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCourseData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('courseName', courseData.courseName);
        formData.append('level', courseData.level);
        formData.append('courseDuration', courseData.courseDuration);
        formData.append('minimumEducationalQualification', courseData.minimumEducationalQualification);
        formData.append('ageLimit', courseData.ageLimit);
        
        // Append image file if available
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const response = await fetch(`http://localhost:5000/courses/${courseData._id}`, {
                method: 'PUT',
                body: formData,
            });
            if (!response.ok) {
                throw new Error('Failed to update course');
            }
            onClose();
        } catch (error) {
            console.error('Error updating course:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="border p-4 rounded">
            <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Course Name</label>
                <input
                    type="text"
                    name="courseName"
                    value={courseData.courseName || ''}
                    onChange={handleChange}
                    required
                    className="border p-2 w-full"
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Level</label>
                <input
                    type="text"
                    name="level"
                    value={courseData.level || ''}
                    onChange={handleChange}
                    className="border p-2 w-full"
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Course Duration</label>
                <input
                    type="text"
                    name="courseDuration"
                    value={courseData.courseDuration || ''}
                    onChange={handleChange}
                    className="border p-2 w-full"
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Minimum Educational Qualification</label>
                <input
                    type="text"
                    name="minimumEducationalQualification"
                    value={courseData.minimumEducationalQualification || ''}
                    onChange={handleChange}
                    className="border p-2 w-full"
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Age Limit</label>
                <input
                    type="text"
                    name="ageLimit"
                    value={courseData.ageLimit || ''}
                    onChange={handleChange}
                    className="border p-2 w-full"
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Course Image</label>
                {courseData.image && (
                    <img src={courseData.image} alt="Current course" className="mb-2 w-32 h-32 object-cover" />
                )}
                <input
                    type="file"
                    name="image"
                    onChange={handleImageChange}
                    className="border p-2 w-full"
                />
            </div>

            <button type="submit" className="bg-blue-500 text-white p-2 rounded">Update Course</button>
            <button type="button" onClick={onClose} className="ml-2 bg-gray-500 text-white p-2 rounded">Cancel</button>
        </form>
    );
};

export default UpdateForm;
