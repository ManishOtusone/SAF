import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "../../utils/baseUrl";
import Swal from "sweetalert2";

const MemberManagement = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    industry: "",
    contactNumber: "",
    gstPan: "",
    city: "",
    website: "",
    email: "",
    password: "",
  });

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

  const openModal = (member = null) => {
    setEditingMember(member);

    if (member) {
      setFormData({
        businessName: member.businessName || "",
        ownerName: member.ownerName || "",
        industry: member.industry || "",
        contactNumber: member.contactInfo || "",
        gstPan: member.gstOrPan || "",
        city: member.city || "",
        website: member.website || "",
        email: member.email || "",
        password: "",
      });
    } else {
      setFormData({
        businessName: "",
        ownerName: "",
        industry: "",
        contactNumber: "",
        gstPan: "",
        city: "",
        website: "",
        email: "",
        password: "",
      });
    }

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMember(null);
  };

  const handleSave = async () => {
    if (
      !formData.businessName ||
      !formData.ownerName ||
      !formData.industry ||
      !formData.contactNumber ||
      !formData.email ||
      (!editingMember && !formData.password)
    ) {
      return Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all required fields",
      });
    }

    const confirmResult = await Swal.fire({
      title: editingMember ? "Update Member?" : "Create Member?",
      text: editingMember
        ? "Are you sure you want to update this member?"
        : "Are you sure you want to onboard this member?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#6b7280",
      confirmButtonText: editingMember ? "Yes, Update" : "Yes, Create",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      const token = localStorage.getItem("accessToken");

      if (editingMember) {
        const res = await axios.patch(
          `${baseUrl}/admin/users/${editingMember._id}`,
          {
            businessName: formData.businessName,
            ownerName: formData.ownerName,
            industry: formData.industry,
            contactInfo: formData.contactNumber,
            gstOrPan: formData.gstPan,
            city: formData.city,
            website: formData.website,
            email: formData.email,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.success) {
          await Swal.fire({
            icon: "success",
            title: "Updated!",
            text: "Member updated successfully",
            confirmButtonColor: "#16a34a",
          });

          fetchMembers();
          closeModal();
        }
      } else {
        const res = await axios.post(
          `${baseUrl}/admin/onboard-member`,
          {
            businessName: formData.businessName,
            ownerName: formData.ownerName,
            industry: formData.industry,
            contactInfo: formData.contactNumber,
            gstOrPan: formData.gstPan,
            city: formData.city,
            website: formData.website,
            email: formData.email,
            password: formData.password,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        await Swal.fire({
          icon: "success",
          title: "Created!",
          text: res.data.message || "Member onboarded successfully",
          confirmButtonColor: "#16a34a",
        });

        fetchMembers();
        closeModal();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message || "Something went wrong",
      });
    }
  };
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Member Management
        </h2>

        <button
          onClick={() => openModal()}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md transition"
        >
          + Onboard Member
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Business</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Industry</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Validity</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : members.length > 0 ? (
              members.map((member) => (
                <tr key={member._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{member.email}</td>
                  <td className="px-4 py-3">{member.businessName}</td>
                  <td className="px-4 py-3">{member.ownerName}</td>
                  <td className="px-4 py-3">{member.industry}</td>
                  <td className="px-4 py-3">{member.contactInfo}</td>
                  <td className="px-4 py-3">
                    {member.membership?.planName || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {member.validTill
                      ? new Date(member.validTill).toLocaleDateString("en-IN")
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
                <td colSpan="8" className="text-center py-6 italic">
                  No members found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingMember ? "Edit Member" : "Onboard Member"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" placeholder="Business Name *"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="border p-2 rounded-lg" />

              <input type="text" placeholder="Owner Name *"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="border p-2 rounded-lg" />

              <input type="text" placeholder="Industry *"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="border p-2 rounded-lg" />

              <input type="text" placeholder="Contact Number *"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                className="border p-2 rounded-lg" />

              <input type="text" placeholder="GST / PAN"
                value={formData.gstPan}
                onChange={(e) => setFormData({ ...formData, gstPan: e.target.value })}
                className="border p-2 rounded-lg" />

              <input type="text" placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="border p-2 rounded-lg" />

              <input type="text" placeholder="Website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="border p-2 rounded-lg" />

              <input type="email" placeholder="Email *"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border p-2 rounded-lg" />

              {!editingMember && (
                <input type="password" placeholder="Password *"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="border p-2 rounded-lg" />
              )}
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <button onClick={closeModal}
                className="px-4 py-2 rounded-lg bg-gray-200">
                Cancel
              </button>
              <button onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white">
                {editingMember ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberManagement;