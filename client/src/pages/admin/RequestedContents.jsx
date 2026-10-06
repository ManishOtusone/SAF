import React, { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../utils/baseUrl";
import ContentManagement from "./ContentManagement";

const RequestedContents = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.get(`${baseUrl}/admin/content-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        setData(res.data.data);
      }

      setLoading(false);
    } catch (err) {
      console.log("Fetch Error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) {
    return <p className="p-5">Loading...</p>;
  }

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-5">
        Requested Contents
      </h1>

      {data.length === 0 ? (
        <p>No content requests found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2">User</th>
                <th className="border p-2">Business</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Phone</th>
                <th className="border p-2">Requested Content</th>

                {/* NEW */}
                <th className="border p-2">User Requirement</th>

                <th className="border p-2">Request Date</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Action</th>
              </tr>
            </thead>

            <tbody>
              {data.flatMap((item) =>
                item.requests.map((request) => (
                  <tr
                    key={request._id}
                    className="text-center"
                  >
                    {/* User */}
                    <td className="border p-2">
                      {item.user?.ownerName || "N/A"}
                    </td>

                    {/* Business */}
                    <td className="border p-2">
                      {item.user?.businessName || "N/A"}
                    </td>

                    {/* Email */}
                    <td className="border p-2">
                      {item.user?.email || "N/A"}
                    </td>

                    {/* Phone */}
                    <td className="border p-2">
                      {item.user?.contactInfo || "N/A"}
                    </td>

                    {/* Requested Content */}
                    <td className="border p-2 font-medium">
                      {request.service}
                    </td>

                    {/* NEW - User Requirement */}
                    <td className="border p-2 text-left min-w-[250px]">
                      {request.message ? (
                        <div className="whitespace-pre-wrap break-words">
                          {request.message}
                        </div>
                      ) : (
                        <span className="text-gray-400">
                          No details provided
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="border p-2">
                      {new Date(
                        item.createdAt
                      ).toLocaleDateString()}
                    </td>

                    {/* Status */}
                    <td className="border p-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          request.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : request.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {request.status || "pending"}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="border p-2">
                      {request.status === "approved" ? (
                        <span className="text-green-600 font-semibold">
                          Completed
                        </span>
                      ) : (
                        <button
                          onClick={() =>
                            setSelectedRequest({
                              ...request,
                              userId: item.user?._id,
                              user: item.user,
                              requestContentId: item._id,
                            })
                          }
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedRequest && (
        <ContentManagement
          selectedRequest={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onSuccess={() => {
            setSelectedRequest(null);
            fetchRequests();
          }}
        />
      )}
    </div>
  );
};

export default RequestedContents;