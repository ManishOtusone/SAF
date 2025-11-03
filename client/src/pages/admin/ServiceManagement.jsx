import React, { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "../../utils/baseUrl";

const ServiceManagement = () => {
    const [plans, setPlans] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newService, setNewService] = useState({ name: "", startup: "", growth: "", matured: "" });

    // 🔹 Fetch Membership Plans & Benefits
    useEffect(() => {
        const fetchMembershipData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("accessToken");
                const res = await axios.get(`${baseUrl}/user/getMembershipsPlans`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // console.log(res.data); // <-- add temporarily to debug

                if (res.data.success) {
                    const data = res.data.data;
                    setPlans(data.plans || []);
                    setServices(
                        data.benefits.map((b) => ({
                            name: b.name,
                            startup: b.values[0] ?? "",
                            growth: b.values[1] ?? "",
                            matured: b.values[2] ?? "",
                        }))
                    );
                }

            } catch (err) {
                console.error("Error fetching membership data:", err.response?.data || err);
            } finally {
                setLoading(false);
            }
        };

        fetchMembershipData();
    }, []);

    // 🔹 Handle local edits
    const handleEdit = (index, field, value) => {
        setServices((prev) =>
            prev.map((srv, i) => (i === index ? { ...srv, [field]: value } : srv))
        );
    };

    const handlePlanEdit = (index, field, value) => {
        const updatedPlans = [...plans];
        updatedPlans[index][field] = value;
        setPlans(updatedPlans);
    };

    const handleAdd = () => {
        if (!newService.name.trim()) return;
        setServices((prev) => [
            ...prev,
            { ...newService, id: prev.length + 1 },
        ]);
        setNewService({ name: "", startup: "", growth: "", matured: "" });
    };

    const handleDelete = (id) => {
        setServices((prev) => prev.filter((_, i) => i !== id));
    };

    // 🔹 Save Updated Membership Data
    const handleSave = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("accessToken");

            const payload = {
                plans: plans.map((p) => ({
                    name: p.name,
                    price: p.price,
                })),
                benefits: services.map((s) => ({
                    name: s.name,
                    values: [s.startup, s.growth, s.matured],
                })),
            };

            const res = await axios.post(`${baseUrl}/admin/edit-membership`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                alert("Membership data updated successfully!");
            } else {
                alert("Failed to update membership data.");
            }
        } catch (err) {
            console.error("Error updating membership data:", err.response?.data || err);
            alert("Error saving changes. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Service Management</h1>

            {/* Plans & Prices */}
            <div className="flex flex-wrap gap-4 mb-6">
                {plans.map((plan, index) => (
                    <div key={index} className="bg-white shadow rounded-lg p-4 w-full sm:w-1/3 border border-gray-200">
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

            {/* Table */}
            <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200">
                <table className="min-w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-yellow-400 text-gray-900">
                            <th className="p-2 border">SR. NO</th>
                            <th className="p-2 border">Benefit / Service</th>
                            {plans.map((p, i) => (
                                <th key={i} className="p-2 border">
                                    {p.name} <br />
                                    <span className="text-xs font-normal">(₹{p.price}/year)</span>
                                </th>
                            ))}
                            <th className="p-2 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.map((srv, i) => (
                            <tr key={i} className="text-center border-t">
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

                        {/* Add New Row */}
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

            {/* Save Button */}
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
