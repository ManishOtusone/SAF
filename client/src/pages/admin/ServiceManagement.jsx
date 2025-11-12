import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "../../utils/baseUrl";

const DEFAULT_PLANS = [
  { name: "Startup", price: "" },
  { name: "Growth", price: "" },
  { name: "Matured", price: "" },
];

const ServiceManagement = () => {
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newService, setNewService] = useState({
    name: "",
    startup: "",
    growth: "",
    matured: "",
    pdfUrl: "",
  });

  // ✅ Fetch Membership Plans & Services
  useEffect(() => {
    const fetchMembershipData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(`${baseUrl}/user/getMembershipsPlans`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          const data = res.data.data || {};

          // ✅ Always show 3 default plans
          const backendPlans = data.plans || [];
          const fixedPlans = DEFAULT_PLANS.map((defaultPlan, index) => {
            const match = backendPlans[index] || {};
            return {
              name: defaultPlan.name,
              price: match.price || "",
            };
          });
          setPlans(fixedPlans);

          // ✅ Prepare services / benefits
          setServices(
            (data.benefits || []).map((b, index) => ({
              id: `${b.name}-${index}-${Date.now()}`,
              name: b.name,
              startup: b.values?.[0] ?? "",
              growth: b.values?.[1] ?? "",
              matured: b.values?.[2] ?? "",
              pdfUrl: b.pdfUrl ?? "",
            }))
          );
        }
      } catch (err) {
        console.error("Error fetching membership data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembershipData();
  }, []);

  // ✅ Update service fields
  const handleEdit = (index, field, value) => {
    setServices((prev) =>
      prev.map((srv, i) => (i === index ? { ...srv, [field]: value } : srv))
    );
  };

  // ✅ Update plan fields
  const handlePlanEdit = (index, field, value) => {
    const updated = [...plans];
    updated[index][field] = value;
    setPlans(updated);
  };

  // ✅ Add new service
  const handleAdd = () => {
    if (!newService.name.trim()) return;

    const newEntry = {
      ...newService,
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now(),
    };

    setServices((prev) => [...prev, newEntry]);
    setNewService({
      name: "",
      startup: "",
      growth: "",
      matured: "",
      pdfUrl: "",
    });
  };

  // ✅ Delete service
  const handleDelete = (index) => {
    setServices((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ Save all changes (keep pasted link as it is)
  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      const payload = {
        plans,
        benefits: services.map((s) => ({
          name: s.name,
          values: [s.startup, s.growth, s.matured],
          pdfUrl: s.pdfUrl || "",
        })),
      };

      const res = await axios.post(`${baseUrl}/admin/edit-membership`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(res.data.success ? "✅ Membership updated successfully!" : "⚠️ Failed to update membership.");
    } catch (err) {
      console.error("Error updating membership:", err);
      alert("❌ Error while saving changes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Service Management</h1>

      {/* ✅ Plans Section */}
      <div className="flex flex-wrap gap-4 mb-6">
        {plans.map((plan, index) => (
          <div
            key={index}
            className="bg-white shadow rounded-lg p-4 w-full sm:w-1/3 border border-gray-200"
          >
            <input
              type="text"
              value={plan.name}
              onChange={(e) => handlePlanEdit(index, "name", e.target.value)}
              className="font-semibold text-lg border-b border-gray-300 w-full mb-2 outline-none"
            />
            <div className="flex items-center gap-2">
              <span>₹</span>
              <input
                type="number"
                value={plan.price}
                onChange={(e) => handlePlanEdit(index, "price", e.target.value)}
                className="border rounded px-2 py-1 w-24"
              />
              <span>/year</span>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Services Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-yellow-400 text-gray-900">
              <th className="p-2 border">SR. NO</th>
              <th className="p-2 border">Benefit / Service</th>
              <th className="p-2 border">Startup</th>
              <th className="p-2 border">Growth</th>
              <th className="p-2 border">Matured</th>
              <th className="p-2 border">Link</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>

          <tbody>
            {services.map((srv, i) => (
              <tr key={srv.id} className="text-center border-t">
                <td className="p-2 border">{i + 1}</td>

                <td className="p-2 border">
                  <input
                    type="text"
                    value={srv.name}
                    onChange={(e) => handleEdit(i, "name", e.target.value)}
                    className="w-full border rounded px-2 py-1"
                  />
                </td>

                <td className="p-2 border">
                  <input
                    type="text"
                    value={srv.startup}
                    onChange={(e) => handleEdit(i, "startup", e.target.value)}
                    className="w-full border rounded px-2 py-1 text-center"
                  />
                </td>

                <td className="p-2 border">
                  <input
                    type="text"
                    value={srv.growth}
                    onChange={(e) => handleEdit(i, "growth", e.target.value)}
                    className="w-full border rounded px-2 py-1 text-center"
                  />
                </td>

                <td className="p-2 border">
                  <input
                    type="text"
                    value={srv.matured}
                    onChange={(e) => handleEdit(i, "matured", e.target.value)}
                    className="w-full border rounded px-2 py-1 text-center"
                  />
                </td>

                {/* ✅ Show Clickable Link + Remove */}
                <td className="p-2 border w-64 text-center">
                  {srv.pdfUrl ? (
                    <div className="flex flex-col items-center">
                      <a
                        href={srv.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline mb-1 truncate hover:text-blue-800"
                      >
                        View Link
                      </a>
                      <button
                        onClick={() => handleEdit(i, "pdfUrl", "")}
                        className="text-red-500 text-xs underline hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <input
                      type="url"
                      placeholder="Paste Google Drive URL"
                      value={srv.pdfUrl}
                      onChange={(e) => handleEdit(i, "pdfUrl", e.target.value)}
                      className="border rounded px-2 py-1 text-xs w-full"
                    />
                  )}
                </td>

                <td className="p-2 border">
                  <button
                    onClick={() => handleDelete(i)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {/* ✅ Add New Row */}
            <tr className="bg-gray-50">
              <td className="p-2 border text-center">+</td>
              <td className="p-2 border">
                <input
                  type="text"
                  placeholder="New Service Name"
                  value={newService.name}
                  onChange={(e) =>
                    setNewService({ ...newService, name: e.target.value })
                  }
                  className="w-full border rounded px-2 py-1"
                />
              </td>
              <td className="p-2 border">
                <input
                  type="text"
                  placeholder="Startup"
                  value={newService.startup}
                  onChange={(e) =>
                    setNewService({ ...newService, startup: e.target.value })
                  }
                  className="w-full border rounded px-2 py-1 text-center"
                />
              </td>
              <td className="p-2 border">
                <input
                  type="text"
                  placeholder="Growth"
                  value={newService.growth}
                  onChange={(e) =>
                    setNewService({ ...newService, growth: e.target.value })
                  }
                  className="w-full border rounded px-2 py-1 text-center"
                />
              </td>
              <td className="p-2 border">
                <input
                  type="text"
                  placeholder="Matured"
                  value={newService.matured}
                  onChange={(e) =>
                    setNewService({ ...newService, matured: e.target.value })
                  }
                  className="w-full border rounded px-2 py-1 text-center"
                />
              </td>
              <td className="p-2 border w-64 text-center">
                <input
                  type="url"
                  placeholder="Paste Google Drive URL"
                  value={newService.pdfUrl}
                  onChange={(e) =>
                    setNewService({ ...newService, pdfUrl: e.target.value })
                  }
                  className="border rounded px-2 py-1 text-xs w-full"
                />
              </td>
              <td className="p-2 border text-center">
                <button
                  onClick={handleAdd}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Add
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ✅ Save Button */}
      <div className="mt-6 text-right">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default ServiceManagement;
