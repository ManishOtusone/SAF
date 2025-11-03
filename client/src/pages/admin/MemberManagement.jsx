import React, { useState, useEffect } from "react";
import axios from "axios";
import {baseUrl} from '../../utils/baseUrl'
import toast from "react-hot-toast";

const MemberManagement = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [formData, setFormData] = useState({
    email: "",
    businessName: "",
    ownerName: "",
    industry: "",
    contactInfo: "",
    gstPan: "",
  });

  // 🔹 Fetch all members from backend
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken"); 
      const res = await axios.get(`${baseUrl}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setMembers(res.data.users);
      } else {
        toast.error("Failed to fetch members");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // 🔹 Modal control
  const openModal = (member = null) => {
    setEditingMember(member);
    if (member) {
      setFormData({
        email: member.email,
        businessName: member.businessName,
        ownerName: member.ownerName,
        industry: member.industry,
        contactInfo: member.contactInfo,
        gstPan: member.gstOrPan || "",
      });
    } else {
      setFormData({
        email: "",
        businessName: "",
        ownerName: "",
        industry: "",
        contactInfo: "",
        gstPan: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMember(null);
  };

  // 🔹 Update member (future enhancement)
  const handleSave = async () => {
    if (
      !formData.email ||
      !formData.businessName ||
      !formData.ownerName ||
      !formData.industry ||
      !formData.contactInfo
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    if (editingMember) {
      toast.success("Member updated (mock)");
    } else {
      toast.success("New member added (mock)");
    }

    closeModal();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Member Management
        </h2>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Business Name</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Industry</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">GST/PAN</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Validity</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="text-center py-6 text-gray-500">
                  Loading members...
                </td>
              </tr>
            ) : members.length > 0 ? (
              members.map((member) => (
                <tr
                  key={member._id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3">{member.email}</td>
                  <td className="px-4 py-3">{member.businessName}</td>
                  <td className="px-4 py-3">{member.ownerName}</td>
                  <td className="px-4 py-3">{member.industry}</td>
                  <td className="px-4 py-3">{member.contactInfo}</td>
                  <td className="px-4 py-3">{member.gstOrPan || "—"}</td>
                  <td className="px-4 py-3 font-medium">
                    {member.membership ? member.membership.planName : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {member.membership
                      ? `${member.membership.validityDays} days`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openModal(member)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="9"
                  className="text-center py-6 text-gray-500 italic"
                >
                  No members found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              {editingMember ? "Edit Member" : "Add Member"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="email"
                placeholder="Email *"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Business Name *"
                value={formData.businessName}
                onChange={(e) =>
                  setFormData({ ...formData, businessName: e.target.value })
                }
                className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Owner Name *"
                value={formData.ownerName}
                onChange={(e) =>
                  setFormData({ ...formData, ownerName: e.target.value })
                }
                className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Industry *"
                value={formData.industry}
                onChange={(e) =>
                  setFormData({ ...formData, industry: e.target.value })
                }
                className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Contact Info *"
                value={formData.contactInfo}
                onChange={(e) =>
                  setFormData({ ...formData, contactInfo: e.target.value })
                }
                className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="GST / PAN (optional)"
                value={formData.gstPan}
                onChange={(e) =>
                  setFormData({ ...formData, gstPan: e.target.value })
                }
                className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                {editingMember ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberManagement;
