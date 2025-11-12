import React, { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../utils/baseUrl";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [membership, setMembership] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Fetch user dashboard with enhanced progress tracking
  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`${baseUrl}/user/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Dashboard API Response:", res.data);

      if (res.data.success) {
        const { membership, services, progress } = res.data;

        // Format membership date
        const formattedValidTill = membership?.validTill
          ? new Date(membership.validTill).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "Not Available";

        setMembership({ ...membership, formattedValidTill });

        // ✅ Enhanced service data formatting with progress tracking
        const formattedServices = services.map((srv) => {
          // Find the corresponding progress data
          const serviceProgress = progress?.find(
            (p) => p.serviceId?.toString() === srv._id.toString()
          );

          const completedCount = srv.completedContents || serviceProgress?.completedContents?.length || 0;
          const totalCount = srv.totalContents || 0;
          const progressPercent = srv.progressPercent || 
            (totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0);

          return {
            id: srv._id,
            name: srv.name,
            total: totalCount,
            completed: completedCount,
            percent: progressPercent,
            // Pass progress data to study material page
            completedContentIds: serviceProgress?.completedContents || [],
            serviceData: srv // Pass full service data for better tracking
          };
        });

        setServices(formattedServices);
      }
    } catch (err) {
      console.error("Error fetching dashboard:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ✅ Enhanced progress update listener
  useEffect(() => {
    const refreshOnProgressUpdate = (event) => {
      console.log("Progress update event received:", event);
      setLoading(true);
      // Small delay to ensure backend has updated
      setTimeout(() => {
        fetchDashboard();
      }, 500);
    };

    window.addEventListener("progressUpdated", refreshOnProgressUpdate);
    return () => {
      window.removeEventListener("progressUpdated", refreshOnProgressUpdate);
    };
  }, []);

  // ✅ Refresh manually with loading state
  const refreshDashboard = () => {
    setLoading(true);
    fetchDashboard();
  };

  // ✅ Enhanced navigation with complete service data
  const handleViewMaterial = (srv) => {
    navigate(`/user/studyMaterial/${srv.id}`, {
      state: { 
        serviceData: {
          ...srv.serviceData,
          completedContentIds: srv.completedContentIds,
          progress: {
            completed: srv.completed,
            total: srv.total,
            percent: srv.percent
          }
        }
      },
    });
  };

  // ✅ Calculate overall progress
  const totalCompleted = services.reduce((sum, srv) => sum + srv.completed, 0);
  const totalItems = services.reduce((sum, srv) => sum + srv.total, 0);
  const overallProgress = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  if (loading) {
    return (
      <div className="p-10 text-center text-lg text-gray-700">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mr-3"></div>
          Loading your dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full bg-gray-50 min-h-screen">
      {/* ✅ Enhanced Header Section */}
      <div className="mb-8 bg-white rounded-xl shadow p-5 border border-green-200">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Active Plan:{" "}
              <span className="text-yellow-600">
                {membership?.planName || "N/A"}
              </span>
            </h1>

            <div className="space-y-1 text-gray-700">
              <p>💰 <strong>Price:</strong> ₹{membership?.price || 0}</p>
              <p>📅 <strong>Validity:</strong> {membership?.validityDays} days</p>
              <p>⏳ <strong>Valid till:</strong>{" "}
                <span className="text-green-700 font-semibold">
                  {membership?.formattedValidTill}
                </span>
              </p>
            </div>
          </div>

          {/* ✅ Overall Progress Card */}
          <div className="bg-gradient-to-r from-green-50 to-yellow-50 p-4 rounded-lg border border-green-200 min-w-[200px]">
            <h3 className="font-semibold text-gray-800 mb-2">Overall Progress</h3>
            <div className="text-2xl font-bold text-green-700 mb-1">
              {overallProgress}%
            </div>
            <div className="text-sm text-gray-600">
              {totalCompleted}/{totalItems} items completed
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-4 items-center flex-wrap">
          <button
            onClick={refreshDashboard}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Refreshing...
              </>
            ) : (
              <>
                🔄 Refresh Progress
              </>
            )}
          </button>

          {/* ✅ Services Summary */}
          <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
            <span className="text-sm text-blue-800">
              📚 {services.length} Services Available
            </span>
          </div>

          {/* ✅ Completed Services Count */}
          <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200">
            <span className="text-sm text-green-800">
              ✅ {services.filter(srv => srv.percent === 100).length} Services Completed
            </span>
          </div>
        </div>
      </div>

      {/* ✅ Enhanced Services Grid */}
      {services.length === 0 ? (
        <div className="text-center text-gray-500 bg-white p-8 rounded-lg shadow">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-lg mb-2">No services available</p>
          <p className="text-sm text-gray-600">
            You don't have any services assigned to your plan yet.
          </p>
        </div>
      ) : (
        <>
          {/* ✅ Progress Summary */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200 text-center">
              <div className="text-2xl font-bold text-green-600">{totalCompleted}</div>
              <div className="text-sm text-gray-600">Items Completed</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200 text-center">
              <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200 text-center">
              <div className="text-2xl font-bold text-yellow-600">{overallProgress}%</div>
              <div className="text-sm text-gray-600">Overall Progress</div>
            </div>
          </div>

          {/* ✅ Services Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {services.map((srv, index) => (
              <div
                key={srv.id || index}
                className="border border-green-200 bg-white rounded-xl shadow-md p-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
              >
                <h2 className="text-lg font-semibold mb-3 text-gray-800 line-clamp-2">
                  {srv.name}
                </h2>

                {/* ✅ Enhanced Progress Bar */}
                <div className="mb-3">
                  <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        srv.percent === 100 
                          ? "bg-green-500" 
                          : "bg-gradient-to-r from-green-500 to-yellow-500"
                      }`}
                      style={{ width: `${srv.percent}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span className="font-medium">Progress</span>
                    <span className="font-bold text-green-700">
                      {srv.completed}/{srv.total}
                    </span>
                  </div>
                </div>

                {/* ✅ Enhanced Progress Status */}
                <div className="text-center mb-3">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      srv.percent === 100
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : srv.percent > 0
                        ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                        : "bg-gray-100 text-gray-800 border border-gray-200"
                    }`}
                  >
                    {srv.percent === 100
                      ? "🎉 Completed!"
                      : srv.percent > 0
                      ? `📚 ${srv.percent}% Complete`
                      : "📖 Not Started"}
                  </span>
                </div>

                {/* ✅ Enhanced View Material Button */}
                <button
                  onClick={() => handleViewMaterial(srv)}
                  className={`w-full mt-2 py-2 rounded-lg transition font-medium ${
                    srv.percent === 100
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {srv.percent === 100 ? "📘 Review Materials" : "📘 View Materials"}
                </button>

                {/* ✅ Quick Progress Preview */}
                {srv.percent > 0 && srv.percent < 100 && (
                  <div className="mt-3 text-xs text-gray-500 text-center">
                    {srv.total - srv.completed} items remaining
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;