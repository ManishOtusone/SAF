import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { baseUrl } from "../../utils/baseUrl";

const AllReferalls = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAllReferrals = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.get(`${baseUrl}/admin/allRefral`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("ADMIN REFERRALS:", res.data);

      setReferrals(res.data.referrals || []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load referrals",
      });
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAllReferrals();
  }, []);

  const updateStatus = async (id, status) => {
    const confirmResult = await Swal.fire({
      title: `Are you sure?`,
      text: `You want to ${status} this referral?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: status === "Approved" ? "#16a34a" : "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `Yes, ${status}`,
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      await axios.put(
        `${baseUrl}/admin/update-status/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await Swal.fire({
        icon: "success",
        title: "Updated!",
        text: `Referral ${status} successfully`,
        confirmButtonColor: "#16a34a",
      });

      fetchAllReferrals();

    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update status",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">

      <div className="max-w-6xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-gray-800">All Referrals</h1>
        <p className="text-gray-600 mt-1">Manage all user referral submissions</p>
      </div>

      <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-lg">

        {referrals.length === 0 ? (
          <p className="text-gray-600 text-center">No referrals found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 rounded-lg">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-semibold text-left">
                  <th className="p-3 border">Referred By</th>
                  <th className="p-3 border">User Email</th>
                  <th className="p-3 border">Name</th>
                  <th className="p-3 border">Company</th>
                  <th className="p-3 border">Contact</th>
                  <th className="p-3 border">Email</th>
                  <th className="p-3 border">Status</th>
                  <th className="p-3 border">Action</th>
                </tr>
              </thead>

              <tbody>
                {referrals.map((ref) => (
                  <tr key={ref._id} className="border hover:bg-gray-50 transition">

                    <td className="p-3 border font-medium text-gray-800">
                      {ref.userId?.ownerName || "N/A"}
                    </td>

                    <td className="p-3 border">{ref.userId?.email || "N/A"}</td>

                    <td className="p-3 border">{ref.name}</td>
                    <td className="p-3 border">{ref.companyName}</td>
                    <td className="p-3 border">{ref.contactNumber}</td>
                    <td className="p-3 border">{ref.email}</td>

                    <td className="p-3 border">
                      <span
                        className={`px-3 py-1 text-sm font-semibold rounded-md 
                        ${ref.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : ref.status === "Rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {ref.status}
                      </span>
                    </td>

                    <td className="p-3 border space-x-2">
                      <button
                        onClick={() => updateStatus(ref._id, "Approved")}
                        disabled={loading}
                        className="px-3 py-1 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => updateStatus(ref._id, "Rejected")}
                        disabled={loading}
                        className="px-3 py-1 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

      </div>

    </div>
  );
};

export default AllReferalls;
