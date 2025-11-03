import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileText, Video, Download, CheckCircle } from "lucide-react";
import { baseUrl } from "../../utils/baseUrl";

const StudyMaterialDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedContents, setCompletedContents] = useState(new Set());
  const [progress, setProgress] = useState({ completed: 0, total: 0 });

  // 🔹 Fetch study material
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        if (!token) return setLoading(false);

        let selectedService = state?.serviceData;

        // Case 1: Passed via navigation
        if (selectedService) {
          setServiceData(selectedService);
          await fetchUserProgress(selectedService.serviceId || selectedService._id);
          setLoading(false);
          return;
        }

        // Case 2: Fetch from API
        const res = await axios.get(`${baseUrl}/user/study-materials`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success && Array.isArray(res.data.studyMaterials)) {
          const found = res.data.studyMaterials.find(
            (item) =>
              String(item.serviceId) === String(id) || String(item._id) === String(id)
          );
          if (found) {
            setServiceData(found);
            await fetchUserProgress(found.serviceId || found._id);
          }
        }
      } catch (err) {
        console.error("Error initializing data:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [id, state]);

  // 🔹 Fetch user progress
  const fetchUserProgress = async (serviceId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`${baseUrl}/user/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        const serviceProgress = res.data.progress.find(
          (p) => String(p.serviceId) === String(serviceId)
        );

        if (serviceProgress) {
          setProgress({
            completed: serviceProgress.completed || 0,
            total: serviceProgress.total || 0,
          });
          if (serviceProgress.completedContentIds) {
            setCompletedContents(new Set(serviceProgress.completedContentIds));
          }
        }
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  };

  // 🔹 Handle content open + progress update
  const handleOpenContent = async (content) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return alert("Please login first!");

      const serviceId = serviceData.serviceId || serviceData._id;

      // If already completed, just open
      if (completedContents.has(content._id)) {
        return window.open(content.url, "_blank", "noopener,noreferrer");
      }

      // Update backend progress
      const updateRes = await axios.post(
        `${baseUrl}/user/update-content-progress`,
        {
          serviceId,
          contentId: content._id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (updateRes.data.success) {
        // ✅ Instantly update UI progress
        setCompletedContents((prev) => new Set(prev).add(content._id));
        setProgress((prev) => ({
          completed: Math.min(prev.completed + 1, prev.total || prev.completed + 1),
          total: prev.total || serviceData.contents?.length || 0,
        }));
      }

      // Open content in new tab
      window.open(content.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error updating progress:", error);
      window.open(content.url, "_blank", "noopener,noreferrer");
    }
  };

  const isContentCompleted = (content) => completedContents.has(content._id);

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading study material...</div>
      </div>
    );
  }

  if (!serviceData) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-700 hover:text-green-600 transition mb-4"
        >
          <ArrowLeft className="mr-2" /> Back to Materials
        </button>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Material Not Found</h2>
          <p className="text-gray-600">The requested study material could not be loaded.</p>
        </div>
      </div>
    );
  }

  const videos = serviceData.contents?.filter((c) => c.type === "video") || [];
  const pdfs = serviceData.contents?.filter((c) => c.type === "pdf") || [];
  const totalContents = serviceData.contents?.length || 0;
  const progressPercent = totalContents
    ? (progress.completed / totalContents) * 100
    : 0;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-700 hover:text-green-600 transition mb-6"
      >
        <ArrowLeft className="mr-2" size={20} />
        Back to Materials
      </button>

      {/* Service Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {serviceData.serviceName || serviceData.name}
        </h1>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Overall Progress</span>
            <span className="font-semibold">
              {progress.completed}/{totalContents} ({Math.round(progressPercent)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="flex gap-6 text-sm text-gray-600">
          <span>📚 Total Contents: {totalContents}</span>
          <span>🎬 Videos: {videos.length}</span>
          <span>📄 PDFs: {pdfs.length}</span>
        </div>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Videos Section */}
        <ContentSection
          title="Video Lessons"
          icon={Video}
          color="red"
          contents={videos}
          isContentCompleted={isContentCompleted}
          handleOpenContent={handleOpenContent}
        />

        {/* PDFs Section */}
        <ContentSection
          title="Documents & PDFs"
          icon={FileText}
          color="blue"
          contents={pdfs}
          isContentCompleted={isContentCompleted}
          handleOpenContent={handleOpenContent}
        />
      </div>
    </div>
  );
};

// ✅ Reusable Content Section Component
const ContentSection = ({
  title,
  icon: Icon,
  color,
  contents,
  isContentCompleted,
  handleOpenContent,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div
        className={`bg-gradient-to-r from-${color}-500 to-${color}-600 text-white p-4 rounded-t-lg`}
      >
        <h2 className="text-xl font-semibold flex items-center gap-3">
          <Icon size={24} />
          {title} ({contents.length})
        </h2>
      </div>
      <div className="p-4">
        {contents.length > 0 ? (
          <div className="space-y-3">
            {contents.map((content) => (
              <div
                key={content._id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                  isContentCompleted(content)
                    ? "bg-green-50 border-green-200"
                    : "bg-gray-50 border-gray-200 hover:border-" + color + "-300"
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`p-2 rounded-lg ${
                      isContentCompleted(content)
                        ? "bg-green-100"
                        : `bg-${color}-100`
                    }`}
                  >
                    {isContentCompleted(content) ? (
                      <CheckCircle size={18} className="text-green-600" />
                    ) : (
                      <Icon size={18} className={`text-${color}-600`} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{content.title}</h3>
                    <p className="text-sm text-gray-600">
                      {isContentCompleted(content) ? "Completed" : content.type.toUpperCase()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenContent(content)}
                  className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 ${
                    isContentCompleted(content)
                      ? "bg-green-600 hover:bg-green-700"
                      : `bg-${color}-600 hover:bg-${color}-700`
                  }`}
                >
                  {isContentCompleted(content) ? (
                    <CheckCircle size={16} />
                  ) : content.type === "video" ? (
                    <Video size={16} />
                  ) : (
                    <Download size={16} />
                  )}
                  {isContentCompleted(content) ? "Completed" : "Open"}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Icon size={48} className="mx-auto mb-3 text-gray-300" />
            <p>No {title.toLowerCase()} available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyMaterialDetail;
