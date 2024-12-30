import React, { useEffect, useState, useContext } from 'react';
import { toast, ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from "../../../../Providers/AuthProvider";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";

const UpdateProfile = () => {
    const { user, loading } = useContext(AuthContext); // Access user and loading state from AuthContext
    const axiosSecure = useAxiosSecure(); // Use your axiosSecure instance to make authenticated requests
    const [studentData, setStudentData] = useState(null); // Store the fetched student data
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        fatherName: '',
        motherName: '',
        presentAddress: '',
        permanentAddress: '',
        nidFront: null,
        nidBack: null,
        passportPhoto: null,
    });

    // Fetch student data only when user is available
    useEffect(() => {
        if (!loading && user) {
          // Fetch all student data only if the user is available
          const fetchStudentData = async () => {
            try {
              const response = await axiosSecure.get('/students'); // Fetch all students data
              const matchedStudent = response.data.find(student => student.userId === user._id); // Match user._id with student.userId
              setStudentData(matchedStudent); // Set the matched student data
            } catch (err) {
              setError("Error fetching student data.");
              toast.error("Error fetching student data.");
            }
          };
    
          fetchStudentData();
        }
      }, [loading, user, axiosSecure]); 
      console.log(studentData._id);


    // If loading or user is not available, show loading message or error message
    if (loading) return <div>Loading...</div>;
    if (!user) return <div>User is not logged in.</div>;

    if (error) {
        return <div>{error}</div>;
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        const file = files[0];
    
        const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
    
        if (file) {
            // Check if file size exceeds the limit
            if (file.size > MAX_FILE_SIZE) {
                toast.error('File size should not exceed 2MB.');
                e.target.value = ''; // Reset the file input
                return;
            }

            setFormData({ ...formData, [name]: file });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prepare form data for submission
        const updatedData = {
            fatherName: formData.fatherName,
            motherName: formData.motherName,
            presentAddress: formData.presentAddress,
            permanentAddress: formData.permanentAddress,
            passportPhoto: formData.passportPhoto,
            nidFront: formData.nidFront,
            nidBack: formData.nidBack,
            certificate: formData.certificate,
        };

        try {
            // Use the studentData._id to update the student data
            const response = await axiosSecure.patch(`/students/${studentData._id}`, updatedData);
            if (response.status === 200) {
                toast.success("Profile updated successfully.");
            }
        } catch (error) {
            toast.error("Error updating profile.");
        }
    };

    return (
        <div className="min-h-screen mt-4 flex justify-center items-center"> 
            <div className="w-full max-w-lg shadow-lg bg-white px-8">
                <h3 className="text-2xl font-semibold text-center mb-4">Update Profile</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Single field with label and input */}
                    <div className="form-control flex flex-row items-center space-x-4">
                        <label className="label w-1/3">
                            <span className="label-text">Father's Name</span>
                        </label>
                        <input
                            type="text"
                            name="fatherName"
                            value={formData.fatherName}
                            onChange={handleInputChange}
                            placeholder="Enter father's name"
                            className="input input-bordered input-md w-full"
                            required
                        />
                    </div>

                    <div className="form-control flex flex-row items-center space-x-4">
                        <label className="label w-1/3">
                            <span className="label-text">Mother's Name</span>
                        </label>
                        <input
                            type="text"
                            name="motherName"
                            value={formData.motherName}
                            onChange={handleInputChange}
                            placeholder="Enter mother's name"
                            className="input input-bordered input-md w-full"
                            required
                        />
                    </div>

                    <div className="form-control flex flex-row items-start space-x-4">
                        <label className="label w-1/3">
                            <span className="label-text">Present Address</span>
                        </label>
                        <textarea
                            name="presentAddress"
                            value={formData.presentAddress}
                            onChange={handleInputChange}
                            placeholder="Enter present address"
                            className="textarea textarea-bordered textarea-md w-full"
                            required
                        />
                    </div>

                    <div className="form-control flex flex-row items-start space-x-4">
                        <label className="label w-1/3">
                            <span className="label-text">Permanent Address</span>
                        </label>
                        <textarea
                            name="permanentAddress"
                            value={formData.permanentAddress}
                            onChange={handleInputChange}
                            placeholder="Enter permanent address"
                            className="textarea textarea-bordered textarea-md w-full"
                            required
                        />
                    </div>

                    <div className="form-control flex flex-row items-center space-x-4">
                        <label className="label w-1/3">
                            <span className="label-text">Passport-Sized Photo</span>
                        </label>
                        <input
                            type="file"
                            name="passportPhoto"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="file-input file-input-bordered w-full"
                            required
                        />
                    </div>

                    <div className="form-control flex flex-row items-center space-x-4">
                        <label className="label w-1/3">
                            <span className="label-text">NID Front</span>
                        </label>
                        <input
                            type="file"
                            name="nidFront"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="file-input file-input-bordered w-full"
                            required
                        />
                    </div>

                    <div className="form-control flex flex-row items-center space-x-4">
                        <label className="label w-1/3">
                            <span className="label-text">NID Back</span>
                        </label>
                        <input
                            type="file"
                            name="nidBack"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="file-input file-input-bordered w-full"
                            required
                        />
                    </div>

                    <div className="form-control flex flex-row items-center space-x-4">
                        <label className="label w-1/3">
                            <span className="label-text">SSC/HSC Certificate</span>
                        </label>
                        <input
                            type="file"
                            name="certificate"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="file-input file-input-bordered w-full"
                            required
                        />
                    </div>

                    <button type="submit" className="btn bg-blue-950 text-white w-full mt-4 hover:bg-blue-800">
                        Update Profile
                    </button>
                </form>
            </div>
            <ToastContainer />
        </div>
    );
};

export default UpdateProfile;
