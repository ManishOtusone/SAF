import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Trash2, Loader2 } from "lucide-react";
import { baseUrl } from "../../utils/baseUrl";

const Enquiry = () => {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("accessToken");

    const fetchEnquiries = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${baseUrl}/admin/all`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setEnquiries(res.data.enquiries || []);
        } catch (error) {
            toast.error("Failed to fetch enquiries.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnquiries();
    }, []);

    // ✅ Delete enquiry
    const deleteEnquiry = async (id) => {
        if (!window.confirm("Are you sure you want to delete this enquiry?")) return;

        try {
            const res = await axios.delete(
                `${baseUrl}/admin/delete/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success(res.data.message || "Enquiry deleted!");
            setEnquiries(enquiries.filter((e) => e._id !== id));
        } catch (error) {
            toast.error("Failed to delete enquiry.");
            console.error(error);
        }
    };

    return (
        <div className="p-5 sm:p-10">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                All Enquiries
            </h1>

            {/* ✅ Loading State */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-yellow-600" size={32} />
                </div>
            ) : enquiries.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                    No enquiries found.
                </div>
            ) : (
                <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-yellow-600 text-white">
                            <tr>
                                <th className="px-4 py-3">S.No</th>
                                <th className="px-4 py-3">User Name</th>
                                <th className="px-4 py-3">Phone</th>

                                {/* ✅ Description Column Widened */}
                                <th className="px-4 py-3 w-[40%]">Description</th>

                                <th className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {enquiries.map((e, index) => (
                                <tr
                                    key={e._id}
                                    className="border-b hover:bg-yellow-50 transition"
                                >
                                    <td className="px-4 py-3 font-medium">{index + 1}</td>
                                    <td className="px-4 py-3">{e.name}</td>
                                    <td className="px-4 py-3">{e.phone}</td>

                                    {/* ✅ Wide Description Box */}
                                    <td className="px-4 py-3 whitespace-pre-wrap">
                                        {e.description}
                                    </td>

                                    {/* ✅ Delete Button */}
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => deleteEnquiry(e._id)}
                                            className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                                        >
                                            <Trash2 size={18} />
                                        </button>
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

export default Enquiry;
