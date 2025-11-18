import React, { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../utils/baseUrl";

const RequestedContents = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.get(`${baseUrl}/admin/content-requests`, {
        headers: { Authorization: `Bearer ${token}` },
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

  if (loading) return <p className="p-5">Loading...</p>;

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-5">Requested Contents</h1>

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
                <th className="border p-2">Requested Contents</th>
                <th className="border p-2">Request Date</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item) => (
                <tr key={item._id} className="text-center">
                  <td className="border p-2">{item.user?.ownerName || "N/A"}</td>
                  <td className="border p-2">{item.user?.businessName || "N/A"}</td>
                  <td className="border p-2">{item.user?.email || "N/A"}</td>
                  <td className="border p-2">{item.user?.contactInfo || "N/A"}</td>

                  {/* List of selected services */}
                  <td className="border p-2">
                    <ul className="text-left pl-5">
                      {item.requests.map((req, idx) => (
                        <li key={idx}>• {req.service}</li>
                      ))}
                    </ul>
                  </td>

                  <td className="border p-2">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RequestedContents;
