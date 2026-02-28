import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { baseUrl } from "../../utils/baseUrl";

const AdminContentManager = () => {
    const [contentList, setContentList] = useState([]);
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState("");
    const [editId, setEditId] = useState(null);

    const token = localStorage.getItem("accessToken");

    const fetchContent = async () => {
        try {
            const res = await axios.get(`${baseUrl}/admin/get-all-content`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                setContentList(res.data.data);
            }
        } catch (err) {
            console.log(err);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to load content options",
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchContent();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            return Swal.fire({
                icon: "warning",
                title: "Content Required",
                text: "Content name is required",
            });
        }

        try {
            if (editId) {
                const res = await axios.patch(
                    `${baseUrl}/admin/update-content/${editId}`,
                    { name },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (res.data.success) {
                    await Swal.fire({
                        icon: "success",
                        title: "Updated",
                        text: "Content updated successfully",
                        confirmButtonColor: "#16a34a",
                    });

                    fetchContent();
                    setEditId(null);
                    setName("");
                }
            } else {
                const res = await axios.post(
                    `${baseUrl}/admin/upload-content`,
                    { name },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (res.data.success) {
                    await Swal.fire({
                        icon: "success",
                        title: "Added",
                        text: "Content added successfully",
                        confirmButtonColor: "#16a34a",
                    });

                    fetchContent();
                    setName("");
                }
            }
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error saving content",
            });
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This content will be permanently deleted!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, delete it!",
        });

        if (!result.isConfirmed) return;

        try {
            const res = await axios.delete(
                `${baseUrl}/admin/delete-content/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                await Swal.fire({
                    icon: "success",
                    title: "Deleted!",
                    text: "Content deleted successfully",
                    confirmButtonColor: "#16a34a",
                });

                fetchContent();
            }
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error deleting content",
            });
        }
    };


    const toggleActive = async (item) => {
        try {
            const res = await axios.patch(
                `${baseUrl}/admin/content/${item._id}`,
                { isActive: !item.isActive },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                Swal.fire({
                    icon: "success",
                    title: "Updated",
                    text: "Status updated successfully",
                    timer: 1200,
                    showConfirmButton: false,
                });

                fetchContent();
            }
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error updating status",
            });
        }
    };
    const startEdit = (item) => {
        setEditId(item._id);
        setName(item.name);
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Manage Content Options</h1>

            <form onSubmit={handleSubmit} className="mb-6 flex gap-3 items-center">
                <input
                    className="border p-2 rounded w-64"
                    placeholder="Content name (e.g., Logo Design)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <button className="bg-blue-600 text-white px-4 py-2 rounded">
                    {editId ? "Update" : "Add"}
                </button>

                {editId && (
                    <button
                        type="button"
                        onClick={() => {
                            setEditId(null);
                            setName("");
                        }}
                        className="bg-gray-500 text-white px-4 py-2 rounded"
                    >
                        Cancel
                    </button>
                )}
            </form>

            <table className="w-full border">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="p-2 border">Name</th>
                        <th className="p-2 border">Status</th>
                        <th className="p-2 border">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {contentList.map((item) => (
                        <tr key={item._id} className="border">
                            <td className="p-2 border">{item.name}</td>

                            <td className="p-2 border">
                                <span
                                    className={`px-2 py-1 rounded text-white ${item.isActive ? "bg-green-600" : "bg-red-600"
                                        }`}
                                >
                                    {item.isActive ? "Active" : "Inactive"}
                                </span>
                            </td>

                            <td className="p-2 border flex gap-2">
                                <button
                                    onClick={() => startEdit(item)}
                                    className="bg-yellow-500 px-3 py-1 text-white rounded"
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() => toggleActive(item)}
                                    className="bg-indigo-600 px-3 py-1 text-white rounded"
                                >
                                    Toggle
                                </button>

                                <button
                                    onClick={() => handleDelete(item._id)}
                                    className="bg-red-600 px-3 py-1 text-white rounded"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminContentManager;
