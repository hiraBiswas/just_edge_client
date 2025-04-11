import React, { useState, useEffect, useContext } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { AuthContext } from "../../../../Providers/AuthProvider";
import useAxiosSecure from "../../../../hooks/useAxiosSecure";

const OnlineProfile = () => {
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const [formData, setFormData] = useState({
        github: '',
        linkedin: '',
        upwork: ''
    });
    const [loading, setLoading] = useState({ profile: true, submit: false });
    const [profileExists, setProfileExists] = useState(false);

    useEffect(() => {
        if (user) {
            const fetchData = async () => {
                try {
                    const studentRes = await axiosSecure.get('/students');
                    const student = studentRes.data.find(s => s.userId === user._id);
                    
                    if (student) {
                        try {
                            const profileRes = await axiosSecure.get(`/onlineProfile/${student._id}`);
                            if (profileRes.data?.data) {
                                setFormData({
                                    github: profileRes.data.data.github || '',
                                    linkedin: profileRes.data.data.linkedin || '',
                                    upwork: profileRes.data.data.upwork || ''
                                });
                                setProfileExists(true);
                            }
                        } catch (err) {
                            // Silently handle case where profile doesn't exist
                            console.log('No existing profile found - this is expected for new users');
                        }
                    }
                } catch (error) {
                    console.error("Error fetching student data:", error);
                } finally {
                    setLoading(prev => ({ ...prev, profile: false }));
                }
            };
            fetchData();
        }
    }, [user, axiosSecure]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(prev => ({ ...prev, submit: true }));

        try {
            const studentRes = await axiosSecure.get('/students');
            const student = studentRes.data.find(s => s.userId === user._id);
            
            if (!student) {
                toast.error("Student record not found");
                return;
            }

            const payload = { studentId: student._id, ...formData };
            
            if (profileExists) {
                // Update existing profile
                await axiosSecure.patch(`/onlineProfile/${student._id}`, payload);
                toast.success("Profile updated successfully!");
            } else {
                // Create new profile
                await axiosSecure.post('/onlineProfile', payload);
                toast.success("Profile created successfully!");
                setProfileExists(true);
            }
        } catch (error) {
            console.error("Profile operation failed:", error);
            toast.error(
                profileExists 
                    ? "Failed to update profile" 
                    : "Failed to create profile"
            );
        } finally {
            setLoading(prev => ({ ...prev, submit: false }));
        }
    };

    if (loading.profile) return (
        <div className="flex justify-center p-8">
            <span className="loading loading-spinner loading-lg"></span>
        </div>
    );

    return (
        <div className="p-4">
            <div className="bg-white rounded-lg max-w-md mx-auto shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-black mb-4 text-center">
                    {profileExists ? 'Update Online Profiles' : 'Setup Online Profiles'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4 text-black">
                    {[
                        {
                            name: 'github',
                            label: 'GitHub',
                            icon: (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                                </svg>
                            )
                        },
                        {
                            name: 'linkedin',
                            label: 'LinkedIn',
                            icon: (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                </svg>
                            )
                        },
                        {
                            name: 'upwork',
                            label: 'Upwork',
                            icon: (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112c-.002 1.406-1.141 2.546-2.547 2.548-1.405-.002-2.543-1.143-2.545-2.548V3.492H0v7.112c0 2.914 2.37 5.303 5.281 5.303 2.913 0 5.283-2.389 5.283-5.303v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3-2.439-5.439-5.439-5.439z"/>
                                </svg>
                            )
                        }
                    ].map((platform) => (
                        <div key={platform.name} className="form-control">
                            <label className="label">
                                <span className="label-text flex items-center gap-2">
                                    {platform.icon}
                                    {platform.label}
                                </span>
                            </label>
                            <div className="relative">
                                <input
                                    type="url"
                                    name={platform.name}
                                    value={formData[platform.name]}
                                    onChange={handleChange}
                                    placeholder={`https://${platform.name.toLowerCase()}.com/yourusername`}
                                    className="input input-bordered w-full pl-10"
                                    required
                                />
                                <span className="absolute left-3 top-3 text-gray-400">
                                    {platform.icon}
                                </span>
                            </div>
                        </div>
                    ))}

                    <button
                        type="submit"
                        className="btn btn-primary w-full mt-4"
                        disabled={loading.submit}
                    >
                        {loading.submit ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="loading loading-spinner"></span>
                                {profileExists ? 'Updating...' : 'Creating...'}
                            </span>
                        ) : (
                            profileExists ? 'Update Profiles' : 'Save Profiles'
                        )}
                    </button>
                </form>
            </div>
            <Toaster position="top-center" />
        </div>
    );
};

export default OnlineProfile;