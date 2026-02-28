import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { baseUrl } from "../../utils/baseUrl";

const Referalls = () => {
  const [formData, setFormData] = useState({
    name: "",
    contactNumber: "",
    companyName: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [referrals, setReferrals] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const fetchReferrals = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`${baseUrl}/user/my-referrals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReferrals(res.data.referrals);
    } catch (error) {
      toast.error("Unable to load referrals");
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, contactNumber, companyName, email } = formData;

    if (!name || !contactNumber || !companyName || !email) {
      return Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "All fields are required",
      });
    }

    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(contactNumber)) {
      return Swal.fire({
        icon: "warning",
        title: "Invalid Phone Number",
        text: "Enter a valid 10-digit Indian mobile number",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Swal.fire({
        icon: "warning",
        title: "Invalid Email",
        text: "Enter a valid email address",
      });
    }

    const confirmResult = await Swal.fire({
      title: "Submit Referral?",
      text: "Are you sure you want to submit this referral?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#ca8a04",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Submit",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setLoading(true);

      const token = localStorage.getItem("accessToken");

      Swal.fire({
        title: "Submitting...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await axios.post(
        `${baseUrl}/user/create`,
        {
          ...formData,
          contactNumber: `+91${contactNumber}`,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Swal.close();

      await Swal.fire({
        icon: "success",
        title: "Referral Submitted!",
        text: "Your referral has been submitted successfully.",
        confirmButtonColor: "#16a34a",
      });

      setFormData({
        name: "",
        contactNumber: "",
        companyName: "",
        email: "",
      });

      setShowForm(false);
      fetchReferrals();

    } catch (error) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">

      <div className="max-w-5xl mx-auto flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Referrals</h1>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-yellow-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-yellow-700 transition"
        >
          {showForm ? "Close" : "New Referral"}
        </button>
      </div>

      {showForm && (
        <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Submit a Referral
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-yellow-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Contact Number
              </label>

              <div className="flex items-center border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-yellow-600">
                <span className="px-3 bg-gray-100 text-gray-700 border-r">
                  +91
                </span>

                <input
                  type="tel"
                  name="contactNumber"
                  placeholder="Enter 10-digit number"
                  value={formData.contactNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) {
                      setFormData({ ...formData, contactNumber: value });
                    }
                  }}
                  className="w-full px-4 py-2 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                placeholder="Enter company name"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full border rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-yellow-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-yellow-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-md text-white font-semibold transition ${loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-yellow-600 hover:bg-yellow-700"
                }`}
            >
              {loading ? "Submitting..." : "Submit Referral"}
            </button>
          </form>
        </div>
      )}

      <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-lg">

        {referrals.length === 0 ? (
          <p className="text-gray-600">No referrals submitted yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3 border">Name</th>
                  <th className="p-3 border">Company</th>
                  <th className="p-3 border">Contact</th>
                  <th className="p-3 border">Email</th>
                  <th className="p-3 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((ref) => (
                  <tr key={ref._id} className="border hover:bg-gray-50">
                    <td className="p-3 border">{ref.name}</td>
                    <td className="p-3 border">{ref.companyName}</td>
                    <td className="p-3 border">{ref.contactNumber}</td>
                    <td className="p-3 border">{ref.email}</td>

                    <td
                      className={`p-3 border font-semibold ${ref.status === "Approved"
                        ? "text-green-600"
                        : ref.status === "Rejected"
                          ? "text-red-600"
                          : "text-yellow-600"
                        }`}
                    >
                      {ref.status}
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

export default Referalls;
