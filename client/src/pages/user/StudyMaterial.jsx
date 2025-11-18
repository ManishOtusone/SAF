import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../../utils/baseUrl";

const StudyMaterial = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [plan, setPlan] = useState("");

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(`${baseUrl}/user/study-materials`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("API Response:", res.data);

        if (res.data.success) {
          // ⬅️ Backend returns: studyMaterials = user.userContents
          setMaterials(res.data.studyMaterials);
          setPlan(res.data.plan);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchMaterials();
  }, []);

  // NEW — Open details page with contentData
  const handleClick = (item) => {
    navigate(`/user/studyMaterial/${item._id}`, {
      state: { contentData: item }
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen w-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        📘 Study Materials ({plan} Plan)
      </h1>

      <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-green-600 to-yellow-500 text-white text-left">
              <th className="py-3 px-4 font-medium">#</th>
              <th className="py-3 px-4 font-medium">Title</th>
              <th className="py-3 px-4 font-medium">Type</th>
              <th className="py-3 px-4 font-medium">Action</th>
            </tr>
          </thead>

          <tbody>
            {materials.map((item, index) => (
              <tr
                key={item._id}
                className={`border-b cursor-pointer hover:bg-yellow-50 transition ${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                }`}
              >
                <td className="py-3 px-4">{index + 1}</td>

                {/* Title */}
                <td className="py-3 px-4 font-medium text-gray-800">
                  {item.title}
                </td>

                {/* Type (video/pdf) */}
                <td className="py-3 px-4 capitalize text-gray-700">
                  {item.type}
                </td>

                {/* View Button */}
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleClick(item)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}

            {materials.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-6 text-gray-500 font-medium"
                >
                  No study materials uploaded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudyMaterial;
