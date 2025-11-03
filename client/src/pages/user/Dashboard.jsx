import React, { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../utils/baseUrl";

const Dashboard = () => {
  const [membership, setMembership] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(`${baseUrl}/user/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Dashboard API Response:", res.data); // Debug log

        if (res.data.success) {
          const { membership, services, progress } = res.data;

          // Convert validTill to readable format
          const formattedValidTill = membership?.validTill
            ? new Date(membership.validTill).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "Not Available";

          setMembership({ ...membership, formattedValidTill });

          // Map services with progress - FIXED VERSION
          const servicesWithProgress = services.map((service) => {
            // Find progress for this service
            const serviceProgress = progress.find(p => 
              p.serviceId === service._id.toString()
            );
            
            console.log(`Service: ${service.name}, Progress:`, serviceProgress); // Debug log
            
            return {
              id: service._id,
              name: service.name,
              total: service.count || 0, // Total contents for this service
              progress: serviceProgress ? serviceProgress.completed : 0, // Completed count from progress array
            };
          });

          console.log("Final services with progress:", servicesWithProgress); // Debug log
          setServices(servicesWithProgress);
        }
      } catch (err) {
        console.error("Error fetching dashboard:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Refresh dashboard data
  const refreshDashboard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`${baseUrl}/user/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        const { membership, services, progress } = res.data;
        
        const formattedValidTill = membership?.validTill
          ? new Date(membership.validTill).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "Not Available";

        setMembership({ ...membership, formattedValidTill });

        const servicesWithProgress = services.map((service) => {
          const serviceProgress = progress.find(p => 
            p.serviceId === service._id.toString()
          );
          
          return {
            id: service._id,
            name: service.name,
            total: service.count || 0,
            progress: serviceProgress ? serviceProgress.completed : 0,
          };
        });

        setServices(servicesWithProgress);
      }
    } catch (err) {
      console.error("Error refreshing dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-lg text-gray-700">
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="p-6 w-full bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8 bg-white rounded-xl shadow p-5 border border-green-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Active Plan:{" "}
          <span className="text-yellow-600">
            {membership?.planName || "N/A"}
          </span>
        </h1>

        <p className="text-gray-700">
          💰 <strong>Price:</strong> ₹{membership?.price || 0}
        </p>
        <p className="text-gray-700">
          📅 <strong>Validity:</strong> {membership?.validityDays} days
        </p>
        <p className="text-gray-700">
          ⏳ <strong>Valid till:</strong>{" "}
          <span className="text-green-700 font-semibold">
            {membership?.formattedValidTill}
          </span>
        </p>

        <div className="mt-4 flex gap-4">
          <button 
            onClick={refreshDashboard}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            🔄 Refresh Progress
          </button>
          
          {/* Progress Summary */}
          <div className="bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200">
            <span className="text-sm text-yellow-800">
              Total Progress: {services.reduce((sum, srv) => sum + srv.progress, 0)}/
              {services.reduce((sum, srv) => sum + srv.total, 0)} items completed
            </span>
          </div>
        </div>
      </div>

      {/* Service Cards */}
      {services.length === 0 ? (
        <div className="text-center text-gray-500 bg-white p-8 rounded-lg shadow">
          <p className="text-lg mb-2">No services available</p>
          <p className="text-sm text-gray-600">You don't have any services assigned to your plan yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {services.map((srv, index) => {
            const percent =
              srv.total === 0
                ? 0
                : Math.round((srv.progress / srv.total) * 100);

            return (
              <div
                key={srv.id || index}
                className="border border-green-200 bg-white rounded-xl shadow-md p-4 hover:shadow-lg hover:scale-[1.02] transition-all"
              >
                <h2 className="text-lg font-semibold mb-3 text-gray-800">
                  {srv.name}
                </h2>

                {/* Progress Bar */}
                <div className="w-full bg-gray-100 rounded-full h-3 mb-3 overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-green-500 to-yellow-500 transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                  <span className="font-medium">Progress</span>
                  <span className="font-bold text-green-700">
                    {srv.progress}/{srv.total}
                  </span>
                </div>
                
                {/* Progress Percentage */}
                <div className="text-center">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    percent === 100 
                      ? "bg-green-100 text-green-800" 
                      : percent > 0 
                      ? "bg-yellow-100 text-yellow-800" 
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {percent === 100 ? "🎉 Completed!" : `${percent}% Complete`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;