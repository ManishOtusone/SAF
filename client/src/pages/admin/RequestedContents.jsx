import React, { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../utils/baseUrl";
import toast from "react-hot-toast";
import { ChevronDown, ChevronUp } from "lucide-react";

const RequestedContents = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState(null);

  // 🧭 Fetch all content requests (Admin)
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(`${baseUrl}/admin/get-all-request`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data?.success) {
          setRequests(res.data.data);
        } else {
          toast.error(res.data.message || "Failed to fetch requests");
        }
      } catch (error) {
        console.error("Error fetching requests:", error);
        toast.error("Error fetching requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // 🔁 Toggle expand/collapse per business
  const toggleExpand = (id) => {
    setExpandedUser(expandedUser === id ? null : id);
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-lg text-gray-600">
        Loading requests...
      </div>
    );
  }

  if (!requests.length) {
    return (
      <div className="p-10 text-center text-lg text-gray-600">
        No content requests found.
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-center mb-8 text-gray-800">
        All Requested Contents
      </h1>

      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <table className="w-full border-collapse text-sm sm:text-base">
          <thead className="bg-yellow-600 text-white">
            <tr>
              <th className="p-3 border border-gray-300 text-center w-16">#</th>
              <th className="p-3 border border-gray-300 text-left">
                Business Name
              </th>
              <th className="p-3 border border-gray-300 text-center w-24">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {requests.map((reqItem, index) => (
              <React.Fragment key={reqItem._id}>
                {/* MAIN ROW */}
                <tr
                  className={`cursor-pointer hover:bg-yellow-50 transition ${
                    expandedUser === reqItem._id ? "bg-yellow-100" : "bg-white"
                  }`}
                  onClick={() => toggleExpand(reqItem._id)}
                >
                  <td className="p-3 border border-gray-300 text-center font-medium">
                    {index + 1}
                  </td>
                  <td className="p-3 border border-gray-300 font-semibold text-gray-800">
                    {reqItem.user?.businessName || "—"}
                  </td>
                  <td className="p-3 border border-gray-300 text-center">
                    {expandedUser === reqItem._id ? (
                      <ChevronUp className="inline-block text-yellow-700" />
                    ) : (
                      <ChevronDown className="inline-block text-yellow-700" />
                    )}
                  </td>
                </tr>

                {/* EXPANDED ROW */}
                {expandedUser === reqItem._id && (
                  <tr>
                    <td
                      colSpan="3"
                      className="p-4 border border-gray-300 bg-gray-50"
                    >
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border border-gray-200 rounded">
                          <thead className="bg-gray-200 text-gray-700">
                            <tr>
                              <th className="p-2 border border-gray-300 text-left">
                                Service
                              </th>
                              <th className="p-2 border border-gray-300 text-left">
                                Content
                              </th>
                              <th className="p-2 border border-gray-300 text-center w-28">
                                Date
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {reqItem.requests.map((r, i) => (
                              <tr
                                key={r._id}
                                className={`${
                                  i % 2 === 0 ? "bg-white" : "bg-gray-100"
                                }`}
                              >
                                <td className="p-2 border border-gray-300 text-gray-800 font-medium">
                                  {r.service}
                                </td>
                                <td className="p-2 border border-gray-300 text-gray-700">
                                  {r.content ? (
                                    r.content
                                  ) : (
                                    <span className="text-gray-400 italic">
                                      —
                                    </span>
                                  )}
                                </td>
                                <td className="p-2 border border-gray-300 text-center text-gray-600">
                                  {new Date(
                                    reqItem.createdAt
                                  ).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestedContents;
