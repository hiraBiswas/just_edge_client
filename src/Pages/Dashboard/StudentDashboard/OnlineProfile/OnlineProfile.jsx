import React, { useState, useEffect, useContext } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from "../../../../Providers/AuthProvider";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";

const OnlineProfile = () => {
    const { user, loading } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const [studentData, setStudentData] = useState(null);
    const [onlineProfile, setOnlineProfile] = useState(null);
    const [error, setError] = useState(null);

    const [github, setGithub] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [upwork, setUpwork] = useState('');
    const [loadingUpdate, setLoadingUpdate] = useState(false); // Track if the update request is in progress
    const [loadingProfile, setLoadingProfile] = useState(true); // Track if the profile data is being fetched


    useEffect(() => {
        if (!loading && user) {
            const fetchStudentData = async () => {
                try {
                    setLoadingProfile(true); // Start loading the profile data

                    const response = await axiosSecure.get('/students');
                    const matchedStudent = response.data.find(student => student.userId === user._id);
                    setStudentData(matchedStudent);

                    if (matchedStudent) {
                        const profileResponse = await axiosSecure.get(`/onlineProfile/${matchedStudent._id}`);
                        setOnlineProfile(profileResponse.data.data);
                    }
                } catch (err) {
                    setError("Error fetching data.");
                    toast.error("Error fetching data.");
                } finally {
                    setLoadingProfile(false); // Stop loading once data is fetched
                }
            };

            fetchStudentData();
        }
    }, [loading, user, axiosSecure]);

    if (!user) return <div>User is not logged in.</div>;

    if (error) {
        return <div>{error}</div>;
    }

    const handleSaveSubmit = async (e) => {
        e.preventDefault();
        const data = { studentId: studentData._id, github, linkedin, upwork };

        try {
            const response = await axiosSecure.post('/onlineProfile', data);
            toast.success("Profile saved successfully!");
            setOnlineProfile(response.data.data);
        } catch (error) {
            toast.error("Error saving profile.");
        }
    };


    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
    
        // Construct the object with all fields, either updated or not
        const updatedData = {
            github: github || onlineProfile.github,  // If github is updated, use the new value, else use the old one
            linkedin: linkedin || onlineProfile.linkedin,  // Same for linkedin
            upwork: upwork || onlineProfile.upwork,  // Same for upwork
        };
    
        // Add loading state control here (for update process)
        setError(null);  // Reset any previous errors
        setLoadingUpdate(true);  // Start loading state for update
    
        try {
            // Send the full object in the PATCH request
            const response = await axiosSecure.patch(`/onlineProfile/${studentData._id}`, updatedData);
    
            toast.success("Profile updated successfully!");
    
            // After the update, fetch the updated profile again to ensure the data is fresh
            const profileResponse = await axiosSecure.get(`/onlineProfile/${studentData._id}`);
            setOnlineProfile(profileResponse.data.data); // Update the local state with the latest profile
    
            // Also update the form fields to reflect the new data
            setGithub(profileResponse.data.data.github);
            setLinkedin(profileResponse.data.data.linkedin);
            setUpwork(profileResponse.data.data.upwork);
    
        } catch (error) {
            toast.error("Error updating profile.");
            setError("Error updating profile.");
        } finally {
            setLoadingUpdate(false);  // Reset loading state after request completes
        }
    };

    // Loading spinner component
    const LoadingSpinner = () => (
        <div className="flex justify-center items-center">
           
            <span className="loading loading-ring loading-lg"></span>
           
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full  p-8 bg-white rounded-lg shadow-lg">
                {loadingProfile ? ( 
                    <LoadingSpinner />
                ) : onlineProfile ? (
                    <>
                        <h3 className="text-2xl font-semibold text-center mb-6">Update Your Online Profile</h3>
                        <form onSubmit={handleUpdateSubmit} className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <label htmlFor="github" className="w-1/3 text-lg font-medium">GitHub Link:</label>
                                <input
                                    type="url"
                                    id="github"
                                    value={github || onlineProfile.github}
                                    onChange={(e) => setGithub(e.target.value)}
                                    placeholder="Enter your GitHub link"
                                    required
                                    className="input input-bordered w-2/3"
                                />
                            </div>

                            <div className="flex items-center space-x-4">
                                <label htmlFor="linkedin" className="w-1/3 text-lg font-medium">LinkedIn Link:</label>
                                <input
                                    type="url"
                                    id="linkedin"
                                    value={linkedin || onlineProfile.linkedin}
                                    onChange={(e) => setLinkedin(e.target.value)}
                                    placeholder="Enter your LinkedIn link"
                                    required
                                    className="input input-bordered w-2/3"
                                />
                            </div>

                            <div className="flex items-center space-x-4">
                                <label htmlFor="upwork" className="w-1/3 text-lg font-medium">Upwork Link:</label>
                                <input
                                    type="url"
                                    id="upwork"
                                    value={upwork || onlineProfile.upwork}
                                    onChange={(e) => setUpwork(e.target.value)}
                                    placeholder="Enter your Upwork link"
                                    required
                                    className="input input-bordered w-2/3"
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="btn bg-blue-950 text-white w-full hover:bg-blue-800" 
                                disabled={loadingUpdate} // Disable button while loading
                            >
                                {loadingUpdate ? "Updating..." : "Update Profile"}
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        <h3 className="text-2xl font-semibold text-center mb-6">Create Your Online Profile</h3>
                        <form onSubmit={handleSaveSubmit} className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <label htmlFor="github" className="w-1/3 text-lg font-medium">GitHub Link:</label>
                                <input
                                    type="url"
                                    id="github"
                                    value={github}
                                    onChange={(e) => setGithub(e.target.value)}
                                    placeholder="Enter your GitHub link"
                                    required
                                    className="input input-bordered w-2/3"
                                />
                            </div>

                            <div className="flex items-center space-x-4">
                                <label htmlFor="linkedin" className="w-1/3 text-lg font-medium">LinkedIn Link:</label>
                                <input
                                    type="url"
                                    id="linkedin"
                                    value={linkedin}
                                    onChange={(e) => setLinkedin(e.target.value)}
                                    placeholder="Enter your LinkedIn link"
                                    required
                                    className="input input-bordered w-2/3"
                                />
                            </div>

                            <div className="flex items-center space-x-4">
                                <label htmlFor="upwork" className="w-1/3 text-lg font-medium">Upwork Link:</label>
                                <input
                                    type="url"
                                    id="upwork"
                                    value={upwork}
                                    onChange={(e) => setUpwork(e.target.value)}
                                    placeholder="Enter your Upwork link"
                                    required
                                    className="input input-bordered w-2/3"
                                />
                            </div>

                            <button type="submit" className="btn bg-blue-950 text-white w-full hover:bg-blue-800">
                                Save Profile
                            </button>
                        </form>
                    </>
                )}
            </div>
            <ToastContainer />
        </div>
    );
};

export default OnlineProfile;
