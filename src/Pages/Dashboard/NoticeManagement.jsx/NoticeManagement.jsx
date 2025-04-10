import React, { useState, useEffect } from "react";
import { PlusIcon, TrashIcon, EyeIcon, PencilIcon } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

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
  const [noticesPerPage] = useState(5);
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
    <div className="w-[1100px] m-6">
      {notification && (
        <div
          className={`toast toast-end ${
            notification.type === "error"
              ? "text-error"
              : notification.type === "warning"
              ? "text-warning"
              : "text-success"
          }`}
        >
          <div className="alert">
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Notice Management</h2>
        <button
          className="btn bg-blue-950 text-white"
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

      {/* Loader */}
      {isLoading && (
        <div className="flex justify-center my-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {/* Notices Table */}
      <div className="overflow-x-auto w-[900px] mx-auto">
        <table className="table table-zebra w-full">
          <thead className="bg-blue-950 text-white">
            <tr>
              <th>SI</th>
              <th>Title</th>
              <th>Tags</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {notices.length === 0 && !isLoading ? (
              <tr>
                <td colSpan="5" className="text-center py-4">No notices available</td>
              </tr>
            ) : (
              currentNotices.map((notice, index) => (
                <tr key={notice._id || index}>
                  <td>{indexOfFirstNotice + index + 1}</td>
                  <td>{notice.title}</td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {notice.tags?.map((tag) => (
                        <span key={tag} className="badge badge-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    {new Date(notice.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      <button 
                        className="btn btn-ghost btn-sm" 
                        onClick={() => handleEditNotice(notice)}
                      >
                        <PencilIcon size={16} />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm text-error"
                        onClick={() => handleDeleteNotice(notice._id)}
                      >
                        <TrashIcon size={16} />
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
      {notices.length > 0 && (
        <div className="flex justify-center mt-4">
          <div className="join">
            <button
              className="join-item btn"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || isLoading}
            >
              «
            </button>
            {Array.from({ length: Math.ceil(totalNotices / noticesPerPage) }).map((_, index) => (
              <button
                key={index}
                className={`join-item btn ${currentPage === index + 1 ? 'btn-active' : ''}`}
                onClick={() => paginate(index + 1)}
                disabled={isLoading}
              >
                {index + 1}
              </button>
            ))}
            <button
              className="join-item btn"
              onClick={() => setCurrentPage(prev => 
                Math.min(prev + 1, Math.ceil(totalNotices / noticesPerPage))
              )}
              disabled={
                currentPage === Math.ceil(totalNotices / noticesPerPage) || 
                isLoading
              }
            >
              »
            </button>
          </div>
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