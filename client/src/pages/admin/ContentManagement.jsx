
import React, { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../utils/baseUrl";
import Swal from "sweetalert2";

const ContentManagement = ({
  selectedRequest = null,
  onClose,
  onSuccess,
}) => {
  const isEditing = selectedRequest?.isEditing === true;

  const [files, setFiles] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [keepFiles, setKeepFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setFiles([]);
    setVideoUrl(selectedRequest?.content?.videoUrl || "");
    setKeepFiles(selectedRequest?.content?.files || []);
    setProgress(0);
  }, [selectedRequest?._id, selectedRequest?.isEditing]);

  const handleReplacementSelect = (e, oldUrl) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length) {
      setFiles((previous) => [
        ...previous,
        ...selectedFiles.map((file) => ({
          file,
          replacesUrl: oldUrl,
        })),
      ]);
    }

    e.target.value = "";
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length) {
      setFiles((previous) => [
        ...previous,
        ...selectedFiles.map((file) => ({ file, replacesUrl: null })),
      ]);
    }

    e.target.value = "";
  };

  const removeNewFile = (index) => {
    setFiles((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  const removeExistingFile = (url) => {
    setKeepFiles((previous) =>
      previous.filter((fileUrl) => fileUrl !== url)
    );
  };

  const restoreExistingFile = (url) => {
    setKeepFiles((previous) =>
      previous.includes(url) ? previous : [...previous, url]
    );

    setFiles((previous) =>
      previous.filter((item) => item.replacesUrl !== url)
    );
  };

  const handleUpload = async () => {
    if (!selectedRequest) {
      return Swal.fire({
        icon: "warning",
        title: "Request Required",
        text: "Please select a requested content first.",
      });
    }

    if (
      !isEditing &&
      files.length === 0 &&
      !videoUrl.trim()
    ) {
      return Swal.fire({
        icon: "warning",
        title: "Content Required",
        text: "Upload at least one file or enter a video link.",
      });
    }

    const confirmResult = await Swal.fire({
      title: isEditing ? "Update Content?" : "Confirm Upload",
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
      confirmButtonText: isEditing ? "Yes, Update" : "Yes, Upload",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setUploading(true);
      setProgress(0);

      const token = localStorage.getItem("accessToken");

      if (!token) {
        await Swal.fire({
          icon: "error",
          title: "Authentication Error",
          text: "Please login again.",
        });
        return;
      }

      const formData = new FormData();

      formData.append("requestId", selectedRequest._id);
      formData.append(
        "userId",
        selectedRequest.userId || selectedRequest.user?._id
      );
      formData.append("videoUrl", videoUrl.trim());

      if (isEditing) {
        formData.append("keepFiles", JSON.stringify(keepFiles));

        formData.append(
          "replacements",
          JSON.stringify(
            files
              .filter((item) => item.replacesUrl)
              .map((item) => ({
                replacesUrl: item.replacesUrl,
                fileName: item.file.name,
              }))
          )
        );
      }

      files.forEach((item) => {
        formData.append("files", item.file || item);
      });

      const url = isEditing
        ? `${baseUrl}/admin/upload-service-content`
        : `${baseUrl}/admin/upload-service-content`;

      const res = await axios({
        method: isEditing ? "patch" : "post",
        url,
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (event) => {
          if (event.total) {
            setProgress(
              Math.round((event.loaded * 100) / event.total)
            );
          }
        },
      });

      if (res.data.success) {
        await Swal.fire({
          icon: "success",
          title: isEditing ? "Content Updated" : "Upload Successful",
          text: res.data.message,
          confirmButtonColor: "#16a34a",
        });

        if (onSuccess) {
          onSuccess();
        } else if (onClose) {
          onClose();
        }
      } else {
        await Swal.fire({
          icon: "error",
          title: isEditing ? "Update Failed" : "Upload Failed",
          text: res.data.message || "Something went wrong.",
        });
      }
    } catch (error) {
      console.error("Content Management Error:", error);

      await Swal.fire({
        icon: "error",
        title: isEditing ? "Update Failed" : "Upload Failed",
        text:
          error.response?.data?.message ||
          "An error occurred while saving content.",
      });
    } finally {
      setUploading(false);
    }
  };

  if (!selectedRequest) return null;

  const removedFiles = (
    selectedRequest.content?.files || []
  ).filter((url) => !keepFiles.includes(url));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditing
                ? "Edit Requested Content"
                : "Upload Requested Content"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {isEditing
                ? "Update the existing link and files."
                : "Upload content for this specific request."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="text-3xl leading-none text-gray-500 hover:text-red-600"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 rounded-lg border bg-gray-50 p-4">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              Request Details
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">User</p>
                <p className="font-semibold text-gray-800">
                  {selectedRequest.user?.ownerName || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Business</p>
                <p className="font-semibold text-gray-800">
                  {selectedRequest.user?.businessName || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="break-all font-semibold text-gray-800">
                  {selectedRequest.user?.email || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-semibold text-gray-800">
                  {selectedRequest.user?.contactInfo || "N/A"}
                </p>
              </div>
            </div>

            <div className="mt-4 border-t pt-4">
              <p className="text-sm text-gray-500">Requested Content</p>
              <p className="text-lg font-bold text-green-700">
                {selectedRequest.service}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-lg font-semibold">
              Video URL <span className="text-sm font-normal text-gray-500">(Optional)</span>
            </label>

            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Enter YouTube / Drive / Video link"
              disabled={uploading}
              className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {isEditing && videoUrl && (
              <a
                href={videoUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block break-all text-blue-600 hover:underline"
              >
                Open current video link
              </a>
            )}

            {isEditing && (
              <p className="mt-2 text-xs text-gray-500">
                Clear the field and save to remove the existing link.
              </p>
            )}
          </div>

          {isEditing && (
            <div className="mb-6">
              <label className="mb-2 block text-lg font-semibold">
                Existing Files
              </label>

              {keepFiles.length === 0 && removedFiles.length === 0 && (
                <p className="rounded-lg border p-3 text-sm text-gray-500">
                  No existing files.
                </p>
              )}

              {keepFiles.length > 0 && (
                <ul className="space-y-2">
                  {keepFiles.map((url) => (
                    <li
                      key={url}
                      className="flex items-center justify-between gap-3 rounded-lg border p-3"
                    >
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all text-sm text-blue-600 hover:underline"
                      >
                        {decodeURIComponent(
                          url.split("/").pop().split("?")[0]
                        )}
                      </a>

                      <button
                        type="button"
                        onClick={() => removeExistingFile(url)}
                        disabled={uploading}
                        className="shrink-0 text-sm font-semibold text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {removedFiles.length > 0 && (
                <div className="mt-4 space-y-3">
                  {removedFiles.map((url) => (
                    <div
                      key={url}
                      className="rounded-lg border border-dashed border-blue-400 p-4"
                    >
                      <p className="mb-3 break-all text-sm text-gray-600">
                        Removed: {decodeURIComponent(
                          url.split("/").pop().split("?")[0]
                        )}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <label className="inline-block cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                          Upload Replacement
                          <input
                            type="file"
                            className="hidden"
                            disabled={uploading}
                            onChange={(e) =>
                              handleReplacementSelect(e, url)
                            }
                          />
                        </label>

                        <button
                          type="button"
                          disabled={uploading}
                          onClick={() => restoreExistingFile(url)}
                          className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                        >
                          Keep Original
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-3 text-xs text-gray-500">
                Removing a file detaches it from this request when you save.
              </p>
            </div>
          )}

          {!isEditing && (
            <div className="mb-6">
              <label className="mb-2 block text-lg font-semibold">
                Upload Files <span className="text-sm font-normal text-gray-500">(Optional)</span>
              </label>

              <input
                type="file"
                multiple
                onChange={handleFileChange}
                disabled={uploading}
                className="w-full rounded-lg border p-3"
              />
            </div>
          )}

          {files.length > 0 && (
            <div className="mb-6 rounded-lg border bg-gray-50 p-4">
              <strong className="text-gray-800">
                {isEditing ? "Selected Files" : "Files to Upload"} ({files.length})
              </strong>

              <ul className="mt-3 space-y-2">
                {files.map((item, index) => {
                  const file = item.file || item;

                  return (
                    <li
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-lg border bg-white p-3"
                    >
                      <div className="min-w-0">
                        <p className="break-all text-sm font-medium">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        {item.replacesUrl && (
                          <p className="mt-1 text-xs text-blue-600">
                            Replacement file
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeNewFile(index)}
                        disabled={uploading}
                        className="shrink-0 font-semibold text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {uploading && (
            <div className="mb-6">
              <div className="mb-2 flex justify-between text-sm">
                <span>Saving content...</span>
                <span>{progress}%</span>
              </div>

              <div className="h-3 w-full rounded-full bg-gray-200">
                <div
                  className="h-3 rounded-full bg-blue-600 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading
                ? `Saving... ${progress}%`
                : isEditing
                  ? "Save Changes"
                  : "Upload Content"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentManagement;
