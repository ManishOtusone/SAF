import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "../../utils/baseUrl";
import Swal from "sweetalert2";

const ContentManagement = () => {
  const [selectedUser, setSelectedUser] = useState("");
  const [users, setUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        const res = await axios.get(`${baseUrl}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          const normalUsers = res.data.users.filter((u) => u.role !== "admin");
          setUsers(normalUsers);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleUpload = async () => {
    if (!selectedUser) {
      return Swal.fire({
        icon: "warning",
        title: "User Required",
        text: "Please select a user first!",
      });
    }

    if (files.length === 0 && videoUrl.trim() === "") {
      return Swal.fire({
        icon: "warning",
        title: "Content Required",
        text: "Upload at least 1 file OR enter a video link!",
      });
    }

    const confirmResult = await Swal.fire({
      title: "Confirm Upload",
      text: "Are you sure you want to upload this content?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Upload",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setUploading(true);
      setProgress(0);

      Swal.fire({
        title: "Uploading...",
        text: "Please wait while content is uploading",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const token = localStorage.getItem("accessToken");
      const formData = new FormData();

      formData.append("userId", selectedUser);
      formData.append("videoUrl", videoUrl);

      files.forEach((file) => formData.append("files", file));

      const res = await axios.post(
        `${baseUrl}/admin/upload-service-content`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (p) => {
            const percent = Math.round((p.loaded * 100) / p.total);
            setProgress(percent);
          },
        }
      );

      Swal.close();

      if (res.data.success) {
        await Swal.fire({
          icon: "success",
          title: "Upload Successful",
          text: "Content uploaded successfully!",
          confirmButtonColor: "#16a34a",
        });

        setFiles([]);
        setVideoUrl("");
        setSelectedUser("");
        setProgress(0);
      } else {
        Swal.fire({
          icon: "error",
          title: "Upload Failed",
          text: "Something went wrong.",
        });
      }

    } catch (error) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error uploading content.",
      });
    } finally {
      setUploading(false);
    }
  };

  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-green-700 mb-6 border-b pb-3">
        Content Management
      </h1>

      <div className="bg-white shadow-md rounded-lg p-6 border">

        <h2 className="text-xl font-semibold mb-3">Select User</h2>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="border rounded w-full p-2 mb-6"
        >
          <option value="">-- Select User --</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.businessName
                ? `${user.businessName} (${user.ownerName || "Owner"})`
                : user.email}
            </option>
          ))}
        </select>

        <h2 className="text-xl font-semibold mb-3">Video URL (Optional)</h2>
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="Enter YouTube / Drive / Vimeo link"
          className="border rounded w-full p-2 mb-6"
        />

        <h2 className="text-xl font-semibold mb-3">Upload Files</h2>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="border p-2 rounded w-full mb-4"
        />

        {files.length > 0 && (
          <div className="bg-gray-50 p-3 rounded border text-sm mb-4">
            <strong>Selected Files:</strong>
            <ul className="list-disc pl-5 mt-2">
              {files.map((f, i) => (
                <li key={i}>{f.name}</li>
              ))}
            </ul>
          </div>
        )}

        {uploading && (
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-blue-600 h-3 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? `Uploading... (${progress}%)` : "Upload Content"}
        </button>
      </div>
    </div>
  );
};

export default ContentManagement;
