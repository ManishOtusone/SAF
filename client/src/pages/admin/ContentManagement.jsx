import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "../../utils/baseUrl";

const ContentManagement = () => {
  // 🧩 Service List
  const serviceNames = [
    "Online learning sessions",
    "Special discounts on SAF MSME offline events",
    "Sales consultation (1-hour meetings)",
    "Sales pitch development",
    "Digital marketing setup assistance",
    "SOP development",
    "Job description development",
    "HR policies handbook",
    "Resumes for recruitment",
    "KRA/KPI development (positions)",
    "Performance review & evaluation",
    "Business consultation meetings",
    "Training for employees",
    "Recording access for attended sessions",
    "Study material (business topics)",
    "Fund raising / business loan assistance",
    "Founder interviews for key profiles",
    "Digital ad creatives for social media",
    "Mock interviews / role-play (sales presentations)",
    "Presence in monthly SAF MSME newsletter",
  ];

  const [selectedService, setSelectedService] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [users, setUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const [accessControl, setAccessControl] = useState({
    startup: false,
    growth: false,
    matured: false,
  });
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // 🔹 Fetch Users (Exclude Admins)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(`${baseUrl}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          const normalUsers = (res.data.users || []).filter(
            (u) => u.role !== "admin"
          );
          setUsers(normalUsers);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  // 🔹 File Input Handler
  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  // 🔹 Upload Handler
  const handleUpload = async () => {
    if (!selectedService) return alert("⚠️ Please select a service first!");
    if (!selectedUser) return alert("⚠️ Please select a user first!");
    if (files.length === 0) return alert("⚠️ Please select at least one file!");

    try {
      setUploading(true);
      setProgress(0);

      const token = localStorage.getItem("accessToken");
      const formData = new FormData();
      formData.append("serviceName", selectedService);
      formData.append("userId", selectedUser);
      formData.append("access", JSON.stringify(accessControl));
      files.forEach((file) => formData.append("files", file));

      const res = await axios.post(
        `${baseUrl}/admin/upload-service-content`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percent);
          },
        }
      );

      if (res.data.success) {
        alert("✅ Upload successful!");
        setFiles([]);
        setSelectedService("");
        setSelectedUser("");
        setAccessControl({ startup: false, growth: false, matured: false });
        setProgress(0);
      } else {
        alert(res.data.message || "❌ Upload failed.");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      alert("❌ Error uploading content. Check console for details.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 🔹 Page Header */}
      <h1 className="text-3xl font-bold text-green-700 mb-6 border-b pb-3">
        Content Management
      </h1>

      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 mb-8">
        {/* 🧩 Select Service */}
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Select Service</h2>
        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          className="border rounded w-full p-2 mb-6"
        >
          <option value="">-- Select Service --</option>
          {serviceNames.map((name, i) => (
            <option key={i} value={name}>
              {name}
            </option>
          ))}
        </select>

        {/* 👤 Select User */}
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Select User</h2>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="border rounded w-full p-2 mb-6"
        >
          <option value="">-- Select User --</option>
          {users.length > 0 ? (
            users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.businessName
                  ? `${user.businessName} (${user.ownerName || "No Owner"})`
                  : user.email}
              </option>
            ))
          ) : (
            <option disabled>Loading users...</option>
          )}
        </select>

        {/* 📁 Upload Files */}
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Upload Files</h2>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-700 border border-gray-300 rounded cursor-pointer p-2 mb-4"
        />

        {/* File Preview */}
        {files.length > 0 && (
          <div className="mb-4 bg-gray-50 p-3 rounded border text-sm">
            <strong>Selected Files:</strong>
            <ul className="list-disc pl-5 mt-2">
              {files.map((f, i) => (
                <li key={i}>{f.name}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 🪪 Assign to Plans */}
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          Assign to Member Plans
        </h2>
        <div className="flex gap-6 mb-6">
          {["startup", "growth", "matured"].map((plan) => (
            <label key={plan} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={accessControl[plan]}
                onChange={(e) =>
                  setAccessControl({
                    ...accessControl,
                    [plan]: e.target.checked,
                  })
                }
              />
              <span className="capitalize">{plan} Stage</span>
            </label>
          ))}
        </div>

        {/* 📊 Progress Bar */}
        {uploading && (
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {/* 🚀 Upload Button */}
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
