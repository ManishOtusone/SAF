import React, { useState } from "react";
import axios from "axios";
import { baseUrl } from "../../utils/baseUrl";

const ContentManagement = () => {
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
    const [files, setFiles] = useState([]);
    const [accessControl, setAccessControl] = useState({
        startup: false,
        growth: false,
        matured: false,
    });
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e) => {
        setFiles([...e.target.files]);
    };

    const handleUpload = async () => {
        if (!selectedService) return alert("Please select a service first!");
        if (files.length === 0) return alert("Please select at least one file!");

        try {
            setUploading(true);
            const token = localStorage.getItem("accessToken");

            const formData = new FormData();
            formData.append("serviceName", selectedService);

            // Send as proper JSON string
            formData.append("access", JSON.stringify(accessControl));

            for (let file of files) {
                formData.append("files", file);
            }

            const res = await axios.post(
                `${baseUrl}/admin/upload-service-content`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (res.data.success) {
                alert("Upload successful!");
                setFiles([]);
                setSelectedService("");
                setAccessControl({ startup: false, growth: false, matured: false });
            } else {
                alert(res.data.message || "Upload failed");
            }
        } catch (error) {
            console.error("Upload Error:", error);
            alert("Error uploading content. Check console for details.");
        } finally {
            setUploading(false);
        }
    };


    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Content Management</h1>

            <div className="bg-white shadow rounded-lg p-6 border border-gray-200 mb-8">
                {/* Service selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Service
                    </label>
                    <select
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value)}
                        className="border rounded w-full p-2"
                    >
                        <option value="">-- Select Service --</option>
                        {serviceNames.map((name, i) => (
                            <option key={i} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* File upload */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload Files (PDFs or Videos)
                    </label>
                    <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-700 border border-gray-300 rounded cursor-pointer p-2"
                    />
                </div>

                {/* Plan selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assign to Member Plans
                    </label>
                    <div className="flex gap-6">
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
                </div>

                <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {uploading ? "Uploading..." : "Upload Content"}
                </button>
            </div>
        </div>
    );
};

export default ContentManagement;
