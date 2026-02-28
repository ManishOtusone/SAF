import React, { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../utils/baseUrl";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [membership, setMembership] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.get(`${baseUrl}/user/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        const { membership, totalStudyMaterials, completedMaterials, percent } = res.data;

        const formattedValidTill = membership?.validTill
          ? new Date(membership.validTill).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "Not Available";

        const formattedPurchaseDate = membership?.purchaseDate
          ? new Date(membership.purchaseDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "Not Available";

        setMembership({
          ...membership,
          formattedValidTill,
          formattedPurchaseDate,
        });

        setServices([
          {
            id: "study",
            name: "Study Materials",
            total: totalStudyMaterials,
            completed: completedMaterials,
            percent,
          },
        ]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    const listener = () => {
      setLoading(true);
      setTimeout(fetchDashboard, 400);
    };
    window.addEventListener("progressUpdated", listener);

    return () => window.removeEventListener("progressUpdated", listener);
  }, []);

  const refreshDashboard = () => {
    setLoading(true);
    fetchDashboard();
  };

  const handleViewMaterial = (srv) => {
    navigate(`/user/studyMaterial/${srv.id}`, {
      state: {
        serviceData: {
          ...srv.serviceData,
          completedContentIds: srv.completedContentIds,
          progress: {
            completed: srv.completed,
            total: srv.total,
            percent: srv.percent,
          },
        },
      },
    });
  };

  const totalCompleted = services.reduce((sum, s) => sum + s.completed, 0);
  const totalItems = services.reduce((sum, s) => sum + s.total, 0);
  const overallProgress =
    totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  if (loading) {
    return (
      <div className="p-10 text-center text-lg">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="p-6 w-full bg-gray-50 min-h-screen">
      <div className="mb-8 bg-white rounded-xl shadow p-5 border border-green-200">
        <div className="flex justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Active Plan:{" "}
              <span className="text-yellow-600">
                {membership?.planName}
              </span>
            </h1>

            <p className="text-gray-700">
              💰 Price: ₹{membership?.price}
            </p>

            <p className="text-gray-700">
              🛒 Purchased on:{" "}
              <span className="text-blue-600 font-semibold">
                {membership?.formattedPurchaseDate}
              </span>
            </p>

            <p className="text-gray-700">
              📅 Validity: {membership?.validityDays} days
            </p>

            <p className="text-gray-700">
              ⏳ Valid till:{" "}
              <span className="text-green-600 font-semibold">
                {membership?.formattedValidTill}
              </span>
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border min-w-[200px]">
            <h3 className="font-semibold">Overall Progress</h3>
            <div className="text-2xl font-bold text-green-700">
              {overallProgress}%
            </div>
            <div className="text-sm text-gray-600">
              {totalCompleted}/{totalItems} items complete
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <button
          onClick={refreshDashboard}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Refresh Progress
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {services.map((srv) => (
          <div
            key={srv.id}
            className="border bg-white rounded-xl shadow-md p-4 hover:shadow-lg"
          >
            <h2 className="text-lg font-semibold mb-3">{srv.name}</h2>

            <div className="mb-3">
              <div className="w-full h-3 rounded-full bg-gray-200">
                <div
                  className="h-3 rounded-full bg-green-500 transition-all"
                  style={{ width: `${srv.percent}%` }}
                ></div>
              </div>
              <p className="text-right text-sm text-gray-600 mt-1">
                {srv.completed}/{srv.total}
              </p>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
