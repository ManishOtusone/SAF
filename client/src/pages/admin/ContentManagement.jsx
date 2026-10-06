import React, { useState } from "react";
import axios from "axios";
import { baseUrl } from "../../utils/baseUrl";
import Swal from "sweetalert2";

const ContentManagement = ({
  selectedRequest = null,
  onClose,
  onSuccess,
}) => {
  const [files, setFiles] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files || []));
  };

  const handleUpload = async () => {
    if (!selectedRequest) {
      return Swal.fire({
        icon: "warning",
        title: "Request Required",
        text: "Please select a requested content first.",
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
      html: `
        <div style="text-align:left">
          <p><strong>User:</strong> ${
            selectedRequest.user?.ownerName || "N/A"
          }</p>

          <p><strong>Business:</strong> ${
            selectedRequest.user?.businessName || "N/A"
          }</p>

          <p><strong>Requested Content:</strong> ${
            selectedRequest.service || "N/A"
          }</p>
        </div>
      `,
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

      if (!token) {
        Swal.close();

        return Swal.fire({
          icon: "error",
          title: "Authentication Error",
          text: "Please login again.",
        });
      }

      const formData = new FormData();

      /*
       * IMPORTANT:
       * Send the exact requested-content request ID.
       */
      formData.append("requestId", selectedRequest._id);

      /*
       * Send user ID also.
       */
      formData.append(
        "userId",
        selectedRequest.userId || selectedRequest.user?._id
      );

      formData.append("videoUrl", videoUrl.trim());

      files.forEach((file) => {
        formData.append("files", file);
      });

      const res = await axios.post(
        `${baseUrl}/admin/upload-service-content`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },

          onUploadProgress: (p) => {
            if (p.total) {
              const percent = Math.round(
                (p.loaded * 100) / p.total
              );

              setProgress(percent);
            }
          },
        }
      );

      Swal.close();

      if (res.data.success) {
        await Swal.fire({
          icon: "success",
          title: "Upload Successful",
          text: `${selectedRequest.service} content uploaded successfully!`,
          confirmButtonColor: "#16a34a",
        });

        setFiles([]);
        setVideoUrl("");
        setProgress(0);

        if (onSuccess) {
          onSuccess();
        }

        if (onClose) {
          onClose();
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Upload Failed",
          text:
            res.data.message ||
            "Something went wrong.",
        });
      }
    } catch (error) {
      Swal.close();

      console.error(
        "Upload Content Error:",
        error
      );

      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text:
          error.response?.data?.message ||
          "Error uploading content.",
      });
    } finally {
      setUploading(false);
    }
  };

  if (!selectedRequest) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Upload Requested Content
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Upload content for this specific request
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="text-gray-500 hover:text-red-600 text-3xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Request Information */}
        <div className="p-6">

          <div className="bg-gray-50 border rounded-lg p-4 mb-6">

            <h3 className="font-semibold text-lg mb-4 text-gray-800">
              Request Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <p className="text-sm text-gray-500">
                  User
                </p>

                <p className="font-semibold text-gray-800">
                  {selectedRequest.user?.ownerName ||
                    selectedRequest.ownerName ||
                    "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Business
                </p>

                <p className="font-semibold text-gray-800">
                  {selectedRequest.user?.businessName ||
                    selectedRequest.businessName ||
                    "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Email
                </p>

                <p className="font-semibold text-gray-800 break-all">
                  {selectedRequest.user?.email ||
                    selectedRequest.email ||
                    "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Phone
                </p>

                <p className="font-semibold text-gray-800">
                  {selectedRequest.user?.contactInfo ||
                    selectedRequest.contactInfo ||
                    "N/A"}
                </p>
              </div>

            </div>

            <div className="mt-4 pt-4 border-t">

              <p className="text-sm text-gray-500">
                Requested Content
              </p>

              <p className="font-bold text-green-700 text-lg">
                {selectedRequest.service}
              </p>

            </div>

          </div>

          {/* Video URL */}
          <div className="mb-6">

            <label className="block text-lg font-semibold mb-2">
              Video URL
              <span className="text-sm font-normal text-gray-500">
                {" "}
                (Optional)
              </span>
            </label>

            <input
              type="text"
              value={videoUrl}
              onChange={(e) =>
                setVideoUrl(e.target.value)
              }
              placeholder="Enter YouTube / Drive / Vimeo link"
              disabled={uploading}
              className="border rounded-lg w-full p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          {/* Files */}
          <div className="mb-6">

            <label className="block text-lg font-semibold mb-2">
              Upload Files
              <span className="text-sm font-normal text-gray-500">
                {" "}
                (Optional)
              </span>
            </label>

            <input
              type="file"
              multiple
              onChange={handleFileChange}
              disabled={uploading}
              className="border p-3 rounded-lg w-full"
            />

          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg border mb-6">

              <strong className="text-gray-800">
                Selected Files:
              </strong>

              <ul className="list-disc pl-5 mt-2 space-y-1">

                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`}
                    className="text-sm text-gray-700"
                  >
                    {file.name}
                  </li>
                ))}

              </ul>

            </div>
          )}

          {/* Progress */}
          {uploading && (
            <div className="mb-6">

              <div className="flex justify-between text-sm mb-2">
                <span>
                  Uploading...
                </span>

                <span>
                  {progress}%
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3">

                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${progress}%`,
                  }}
                />

              </div>

            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading
                ? `Uploading... ${progress}%`
                : "Upload Content"}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};

export default ContentManagement;