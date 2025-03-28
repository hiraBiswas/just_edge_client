import React, { useState, useEffect } from "react";
import { PlusIcon, TrashIcon, EyeIcon } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

const image_hosting_key = import.meta.env.VITE_IMAGE_HOSTING_KEY;
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${image_hosting_key}`;

const NoticeManagement = () => {
  const [notices, setNotices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [newNotice, setNewNotice] = useState({
    title: "",
    description: "",
    tags: [],
    currentTag: "",
    attachments: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  // Custom notification system
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const fetchNotices = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:5000/notice", {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        // Log full response for debugging
        console.log("Response status:", response.status);
        console.log("Response headers:", response.headers);

        // Check if the response is OK
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `HTTP error! status: ${response.status}, message: ${errorText}`
          );
        }

        const contentType = response.headers.get("Content-Type");

        // Strict JSON checking
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error(`Expected JSON, but got ${contentType}`);
        }

        const data = await response.json();
        console.log("Fetched Data:", data);
        setNotices(data);
      } catch (error) {
        console.error("Detailed error fetching notices:", error);
        toast.error(`Failed to fetch notices: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotices();
  }, []);

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
      // Enhanced logging
      console.log("File details:", {
        name: file.name,
        type: file.type,
        size: file.size,
      });

      if (!allowedTypes.includes(file.type)) {
        console.error(`Invalid file type: ${file.name}`);
        toast.error(`Invalid file type: ${file.name}`);
        return null;
      }

      if (file.size > maxSize) {
        console.error(`File too large: ${file.name}`);
        toast.error(`File too large: ${file.name} (Max 10MB)`);
        return null;
      }

      const formData = new FormData();
      formData.append("image", file);

      try {
        console.log("Attempting to upload file to ImgBB");
        const imageUploadResponse = await fetch(image_hosting_api, {
          method: "POST",
          body: formData,
        });

        console.log("ImgBB response status:", imageUploadResponse.status);

        const result = await imageUploadResponse.json();
        console.log("ImgBB upload result:", result);

        if (result.success) {
          return {
            fileName: file.name,
            fileType: file.type,
            fileUrl: result.data.display_url,
            fileSize: file.size,
          };
        } else {
          console.error("Upload failed for file:", file.name);
          toast.error(`Upload failed: ${file.name}`);
          return null;
        }
      } catch (error) {
        console.error("Network error during file upload:", error);
        toast.error(`Network error: ${file.name}`);
        return null;
      }
    });

    try {
      const uploadedFiles = await Promise.all(uploadPromises);
      const validFiles = uploadedFiles.filter((file) => file !== null);

      console.log("Successfully uploaded files:", validFiles);

      return validFiles;
    } catch (error) {
      console.error("Overall upload error:", error);
      toast.error("File upload failed");
      return [];
    }
  };

  // Add tag functionality
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

  // Remove tag
  const handleRemoveTag = (tagToRemove) => {
    setNewNotice((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmitNotice = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validation checks
      if (!newNotice.title) {
        toast.error("Title is required");
        setIsLoading(false);
        return;
      }

      console.log("🔵 Notice Data Before Upload:", newNotice);

      // Handle single file upload
      let uploadedAttachment = null;
      if (newNotice.attachments.length > 0) {
        const file = newNotice.attachments[0];
        const formData = new FormData();
        formData.append("image", file);

        console.log("📤 Uploading file:", file.name);

        try {
          const imageUploadResponse = await fetch(image_hosting_api, {
            method: "POST",
            body: formData,
          });

          const result = await imageUploadResponse.json();
          console.log("🟢 File Upload Response:", result);

          if (result.success) {
            uploadedAttachment = result.data.display_url;
          } else {
            toast.error("File upload failed");
          }
        } catch (error) {
          console.error("❌ Network error during file upload:", error);
          toast.error("Network error during file upload");
        }
      }

      // Prepare notice data
      const noticeData = {
        title: newNotice.title,
        description: newNotice.description,
        tags: newNotice.tags,
        attachment: uploadedAttachment,
        deadline: newNotice.deadline
          ? new Date(newNotice.deadline).toISOString()
          : null,
        createdAt: new Date().toISOString(),
      };

      console.log("📩 Final Notice Data to Send:", noticeData);

      const response = await fetch("http://localhost:5000/notice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(noticeData),
      });

      console.log("🔄 Backend Response Status:", response.status);

      const result = await response.json();
      console.log("🟢 Backend Response Data:", result);

      setNotices((prev) => [noticeData, ...prev]);
      setNewNotice({
        title: "",
        description: "",
        tags: [],
        currentTag: "",
        attachments: [],
        deadline: "",
      });

      setIsModalOpen(false);
      toast.success("Notice created successfully");
    } catch (error) {
      console.error("❌ Error submitting notice:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete notice
  const handleDeleteNotice = async (noticeId) => {
    try {
      const response = await fetch(`http://localhost:5000/notice/${noticeId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setNotices((prev) => prev.filter((notice) => notice._id !== noticeId));
        toast.success("Notice deleted successfully");
      } else {
        toast.error(data.message || "Failed to delete notice", "error");
      }
    } catch (error) {
      toast.error("Failed to delete notice", "error");
    }
  };

  return (
    <div className="w-[1100px] m-6">
      {/* Notification System */}
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
          className="btn btn-primary"
          onClick={() => setIsModalOpen(true)}
          disabled={isLoading}
        >
          <PlusIcon className="mr-2" /> Add Notice
        </button>
      </div>

      {/* Notices Table */}
      <div className="overflow-x-auto w-[900px] mx-auto">
        <table className="table table-zebra w-full">
          <thead className="bg-blue-950 text-white">
            <tr>
              <th>SI</th> {/* Added SI Column */}
              <th>Title</th>
              <th>Tags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {notices.map((notice, index) => (
              <tr key={notice._id}>
                <td>{index + 1}</td>{" "}
                {/* Displaying the serial number (index + 1) */}
                <td>{notice.title}</td>
                <td>
                  {notice.tags?.map((tag) => (
                    <span key={tag} className="badge badge-primary mr-1">
                      {tag}
                    </span>
                  ))}
                </td>
                <td>
                  <div className="flex space-x-2">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        /* View Details */
                      }}
                    >
                      <EyeIcon size={16} />
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Notice Modal */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Create New Notice</h3>
            <form onSubmit={handleSubmitNotice} className="space-y-4">
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

              {/* File Upload */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Attachments</span>
                </label>
                <input
                  type="file"
                  className="file-input file-input-bordered w-full"
                  onChange={(e) => {
                    // Limit to single file by taking only the first file
                    const file = e.target.files[0];
                    setNewNotice((prev) => ({
                      ...prev,
                      attachments: file ? [file] : [], // Ensure it's an array with single file or empty
                    }));
                  }}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>

              {/* Displayed Attachments */}
              {newNotice.attachments.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-sm font-semibold mb-1">
                    Uploaded Files:
                  </h4>
                  <ul className="list-disc pl-5">
                    {newNotice.attachments.map((file, index) => (
                      <li key={index} className="text-sm">
                        {file.fileName} ({file.fileType})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags Section */}
              <div className="flex items-center space-x-2">
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
                  onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddTag}
                >
                  Add Tag
                </button>
              </div>

              {/* Displayed Tags */}
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

              <div className="modal-action">
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
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : "Create Notice"}
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
