import React, { useEffect, useState, useContext } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from "../../../../Providers/AuthProvider";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";

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
                } catch (err) {
                    toast.error("Error fetching student data.");
                }
            };
            fetchStudentData();
        }
    }, [loading, user, axiosSecure]);

    if (loading || !studentData) return (
        <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg"></span>
        </div>
    );

    if (!user) return <div className="text-center py-10">Please log in to access this page.</div>;

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formDataToSend = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value) formDataToSend.append(key, value);
        });

        try {
            await axiosSecure.patch(`/students/${studentData._id}`, formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Error updating profile.");
        }
    };

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
                                    <p className="text-xs text-gray-500 truncate">Uploaded: {studentData[field]}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    <button type="submit" className="btn btn-primary btn-sm w-full mt-3">
                        Update Profile
                    </button>
                </form>
                <ToastContainer position="bottom-center" autoClose={3000} />
            </div>
        </div>
    );
};

export default UpdateProfile;