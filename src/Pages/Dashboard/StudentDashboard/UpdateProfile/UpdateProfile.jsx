import React, { useEffect, useState, useContext } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { AuthContext } from "../../../../Providers/AuthProvider";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";

const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY;
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

const UpdateProfile = () => {
    const { user, loading } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const [studentData, setStudentData] = useState(null);
    const [formData, setFormData] = useState({
        fatherName: '',
        motherName: '',
        presentAddress: '',
        permanentAddress: '',
        nidFront: null,
        nidBack: null,
        passportPhoto: null,
        certificate: null
    });
    const [loadingSubmit, setLoadingSubmit] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            const fetchStudentData = async () => {
                try {
                    const response = await axiosSecure.get('/students');
                    const matchedStudent = response.data.find(student => student.userId === user._id);
                    if (matchedStudent) {
                        setStudentData(matchedStudent);
                        setFormData(prev => ({
                            ...prev,
                            fatherName: matchedStudent.fatherName || '',
                            motherName: matchedStudent.motherName || '',
                            presentAddress: matchedStudent.presentAddress || '',
                            permanentAddress: matchedStudent.permanentAddress || ''
                        }));
                    }
                    // No else case needed - it's fine if no student is found (new user)
                } catch (err) {
                    if (err.response?.status !== 404) { // Only show error if it's not a 404
                        toast.error("Error fetching student data.");
                    }
                }
            };
            fetchStudentData();
        }
    }, [loading, user, axiosSecure]);

    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        const file = files[0];
        if (file && file.size > 2 * 1024 * 1024) {
            toast.error('File size should not exceed 2MB.');
            return;
        }
        setFormData({ ...formData, [name]: file });
    };

    const uploadImageToImgBB = async (imageFile) => {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        try {
            const response = await fetch(image_hosting_api, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.success) {
                return data.data.url; // Return the hosted image URL
            }
            throw new Error('Image upload failed');
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image');
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingSubmit(true);

        try {
            // Upload images first and get their URLs
            const imageUploads = {};
            const imageFields = ['passportPhoto', 'nidFront', 'nidBack', 'certificate'];
            
            for (const field of imageFields) {
                if (formData[field] instanceof File) {
                    const imageUrl = await uploadImageToImgBB(formData[field]);
                    if (imageUrl) {
                        imageUploads[field] = imageUrl;
                    }
                }
            }

            // Prepare the data to send to your server
            const updateData = {
                fatherName: formData.fatherName,
                motherName: formData.motherName,
                presentAddress: formData.presentAddress,
                permanentAddress: formData.permanentAddress,
                ...imageUploads
            };

            // Send the update to your server
            const response = await axiosSecure.patch(
                `/students/${studentData._id}`,
                updateData
            );

            if (response.status === 200) {
                toast.success("Profile updated successfully!");
                // Update local state with the new data
                setStudentData(prev => ({ ...prev, ...updateData }));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error updating profile.");
        } finally {
            setLoadingSubmit(false);
        }
    };

    if (loading || !studentData) return (
        <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg"></span>
        </div>
    );

    if (!user) return <div className="text-center py-10">Please log in to access this page.</div>;

    return (
        <div className="flex justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold text-center mb-4">Update Profile</h3>
                
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Father's Name</label>
                            <input
                                name="fatherName"
                                value={formData.fatherName}
                                onChange={handleInputChange}
                                className="input input-bordered input-sm w-full"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Mother's Name</label>
                            <input
                                name="motherName"
                                value={formData.motherName}
                                onChange={handleInputChange}
                                className="input input-bordered input-sm w-full"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Present Address</label>
                        <textarea
                            name="presentAddress"
                            value={formData.presentAddress}
                            onChange={handleInputChange}
                            className="textarea textarea-bordered textarea-sm w-full"
                            rows={2}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Permanent Address</label>
                        <textarea
                            name="permanentAddress"
                            value={formData.permanentAddress}
                            onChange={handleInputChange}
                            className="textarea textarea-bordered textarea-sm w-full"
                            rows={2}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {['passportPhoto', 'nidFront', 'nidBack', 'certificate'].map((field) => (
                            <div key={field} className="space-y-1">
                                <label className="text-sm font-medium">
                                    {field === 'passportPhoto' ? 'Passport Photo' : 
                                     field === 'nidFront' ? 'NID Front' :
                                     field === 'nidBack' ? 'NID Back' : 'Certificate'}
                                </label>
                                <input
                                    type="file"
                                    name={field}
                                    onChange={handleFileChange}
                                    className="file-input file-input-bordered file-input-sm w-full"
                                    accept="image/*"
                                    required={!studentData[field]}
                                />
                                {studentData[field] && (
                                    <div className="mt-1">
                                        <p className="text-xs text-gray-500 truncate">Current: {studentData[field]}</p>
                                        <img 
                                            src={studentData[field]} 
                                            alt={field} 
                                            className="mt-1 w-20 h-20 object-cover rounded"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary btn-sm w-full mt-3"
                        disabled={loadingSubmit}
                    >
                        {loadingSubmit ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="loading loading-spinner loading-sm"></span>
                                Updating...
                            </span>
                        ) : 'Update Profile'}
                    </button>
                </form>
          
            </div>
            <Toaster position="top-center" />
        </div>
    );
};

export default UpdateProfile;