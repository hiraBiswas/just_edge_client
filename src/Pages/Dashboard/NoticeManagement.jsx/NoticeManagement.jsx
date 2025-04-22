import React, { useState, useEffect } from "react";
import { PlusIcon, TrashIcon, EyeIcon, PencilIcon } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { Link } from "react-router-dom";

const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY;
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

const NoticeManagement = () => {
  const [notices, setNotices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNoticeId, setEditingNoticeId] = useState(null);
  const [newNotice, setNewNotice] = useState({
    title: "",
    description: "",
    tags: [],
    currentTag: "",
    attachments: [],
    deadline: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const axiosSecure = useAxiosSecure();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [noticesPerPage] = useState(10);
  const [totalNotices, setTotalNotices] = useState(0);

  // Custom notification system
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchNotices = async () => {
    setIsLoading(true);
    try {
      const response = await axiosSecure.get("/notice");
      // Sort notices by createdAt in descending order (newest first)
      const sortedNotices = response.data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setNotices(sortedNotices);
      setTotalNotices(sortedNotices.length);
    } catch (error) {
      console.error("Error fetching notices:", error);
      toast.error(`Failed to fetch notices: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  
  useEffect(() => {
    fetchNotices();
  }, []);

  // Get current notices for pagination
  const indexOfLastNotice = currentPage * noticesPerPage;
  const indexOfFirstNotice = indexOfLastNotice - noticesPerPage;
  const currentNotices = notices.slice(indexOfFirstNotice, indexOfLastNotice);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    const uploadPromises = files.map(async (file) => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}`);
        return null;
      }

      if (file.size > maxSize) {
        toast.error(`File too large: ${file.name} (Max 10MB)`);
        return null;
      }

      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await fetch(image_hosting_api, {
          method: "POST",
          body: formData,
        });
        const result = await response.json();

        if (result.success) {
          return {
            fileName: file.name,
            fileType: file.type,
            fileUrl: result.data.display_url,
            fileSize: file.size,
          };
        } else {
          toast.error(`Upload failed: ${file.name}`);
          return null;
        }
      } catch (error) {
        toast.error(`Network error: ${file.name}`);
        return null;
      }
    });

    try {
      const uploadedFiles = await Promise.all(uploadPromises);
      return uploadedFiles.filter((file) => file !== null);
    } catch (error) {
      toast.error("File upload failed");
      return [];
    }
  };

  const handleAddTag = () => {
    const trimmedTag = newNotice.currentTag.trim();
    if (trimmedTag && !newNotice.tags.includes(trimmedTag)) {
      setNewNotice((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
        currentTag: "",
      }));
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setNewNotice((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleEditNotice = (notice) => {
    setNewNotice({
      title: notice.title || "",
      description: notice.description || "",
      tags: notice.tags || [],
      currentTag: "",
      attachments: notice.attachments || [],
      deadline: notice.deadline || "",
    });
    setEditingNoticeId(notice._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmitNotice = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const noticeData = {
        title: newNotice.title,
        description: newNotice.description,
        tags: newNotice.tags,
        attachment: newNotice.attachments[0]?.fileUrl || "",
        deadline: newNotice.deadline,
      };
  
      let response;
      if (isEditing) {
        response = await axiosSecure.patch(`/notice/${editingNoticeId}`, noticeData);
      } else {
        response = await axiosSecure.post("/notice", noticeData);
      }
  
      await fetchNotices();
  
      setIsModalOpen(false);
      setIsEditing(false);
      setEditingNoticeId(null);
      setNewNotice({
        title: "",
        description: "",
        tags: [],
        currentTag: "",
        attachments: [],
        deadline: "",
      });
  
      toast.success(isEditing ? "Notice updated successfully" : "Notice created successfully");
    } catch (error) {
      console.error("Error saving notice:", error);
      toast.error(error.response?.data?.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleDeleteNotice = async (noticeId) => {
    try {
      await axiosSecure.delete(`/notice/${noticeId}`);
      setNotices(prevNotices => prevNotices.filter(notice => notice._id !== noticeId));
      setTotalNotices(prev => prev - 1);
      toast.success("Notice deleted successfully");
    } catch (error) {
      console.error("Error deleting notice:", error);
      toast.error(error.response?.data?.message || "Failed to delete notice");
    }
  };

  const handleFileInputChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsLoading(true);
      try {
        const uploadedFiles = await handleFileUpload(e);
        if (uploadedFiles && uploadedFiles.length > 0) {
          setNewNotice(prev => ({
            ...prev,
            attachments: [...prev.attachments, ...uploadedFiles]
          }));
          toast.success("File uploaded successfully");
        }
      } catch (error) {
        console.error("File upload error:", error);
        toast.error("File upload failed");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className=" w-[1100px] mx-auto mt-6">


      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notice Management</h1>
          <p className="text-gray-600">Create and manage notices for students</p>
        </div>
        <button
          className="btn bg-blue-950 text-white hover:bg-blue-800"
          onClick={() => {
            setIsEditing(false);
            setEditingNoticeId(null);
            setNewNotice({
              title: "",
              description: "",
              tags: [],
              currentTag: "",
              attachments: [],
              deadline: ""
            });
            setIsModalOpen(true);
          }}
          disabled={isLoading}
        >
          <PlusIcon className="mr-2" /> Add Notice
        </button>
      </div>

      {/* Skeleton Loader */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-950">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider rounded-tl-lg">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider rounded-tr-lg">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(5)].map((_, index) => (
                <tr key={index} className="hover:bg-blue-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-6"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                      <div className="h-6 bg-gray-200 rounded-full w-12"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Loaded State */}
      {!isLoading && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-950">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider rounded-tl-lg">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider rounded-tr-lg">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {notices.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <svg
                          className="w-12 h-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                        <p className="mt-2 text-sm font-medium text-gray-600">
                          No notices available
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Create your first notice to get started
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentNotices.map((notice, index) => (
                    <tr key={notice._id} className="hover:bg-blue-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {indexOfFirstNotice + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {notice.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {notice.tags?.map((tag) => (
                            <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditNotice(notice)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteNotice(notice._id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalNotices > noticesPerPage && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstNotice + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastNotice, totalNotices)}
                </span>{" "}
                of <span className="font-medium">{totalNotices}</span> notices
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage === Math.ceil(totalNotices / noticesPerPage)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Notice Modal */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg">
            <h3 className="font-bold text-lg mb-2">
              {isEditing ? "Update Notice" : "Create New Notice"}
            </h3>
            <form onSubmit={handleSubmitNotice} className="space-y-2">
              {/* Title */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Title</span>
                </label>
                <input
                  type="text"
                  placeholder="Notice Title"
                  className="input input-bordered w-full"
                  value={newNotice.title}
                  onChange={(e) =>
                    setNewNotice((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                />
              </div>

              {/* Description */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  placeholder="Notice Description"
                  className="textarea textarea-bordered w-full"
                  value={newNotice.description}
                  onChange={(e) =>
                    setNewNotice((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              {/* File Upload */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Attachments</span>
                </label>
                <input
                  type="file"
                  className="file-input file-input-bordered w-full"
                  onChange={handleFileInputChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>

              {/* Display Attachments */}
              {newNotice.attachments.length > 0 && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Uploaded Files</span>
                  </label>
                  <ul className="list-disc pl-5 text-sm">
                    {newNotice.attachments.map((file, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>
                          {file.fileName || "File"} ({file.fileType || "unknown"})
                        </span>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs text-error"
                          onClick={() => {
                            setNewNotice((prev) => ({
                              ...prev,
                              attachments: prev.attachments.filter(
                                (_, i) => i !== index
                              ),
                            }));
                          }}
                        >
                          <TrashIcon size={12} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Tags</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add Tag"
                    className="input input-bordered w-full"
                    value={newNotice.currentTag}
                    onChange={(e) =>
                      setNewNotice((prev) => ({
                        ...prev,
                        currentTag: e.target.value,
                      }))
                    }
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn bg-blue-950 text-white"
                    onClick={handleAddTag}
                  >
                    Add
                  </button>
                </div>

                {/* Show Tags */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {newNotice.tags.map((tag) => (
                    <div key={tag} className="badge badge-primary badge-lg">
                      {tag}
                      <button
                        type="button"
                        className="ml-2"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deadline */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Deadline</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={newNotice.deadline}
                  required
                  onChange={(e) =>
                    setNewNotice((prev) => ({
                      ...prev,
                      deadline: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Buttons */}
              <div className="modal-action mt-4">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn bg-blue-950 text-white"
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Saving..."
                    : isEditing
                    ? "Update Notice"
                    : "Create Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default NoticeManagement;