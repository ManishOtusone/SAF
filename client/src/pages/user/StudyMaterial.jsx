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
        console.log("API Response:", res.data); // Debug log
        if (res.data.success) {
          setMaterials(res.data.studyMaterials);
          setPlan(res.data.plan);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMaterials();
  }, []);

  const handleClick = (item) => {
    console.log("Clicked item:", item); // Debug log
    navigate(`/user/studyMaterial/${item.serviceId || item._id}`, {
      state: { serviceData: item }
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
              <th className="py-3 px-4 font-medium">Service</th>
              <th className="py-3 px-4 font-medium">Available Contents</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((item, index) => (
              <tr
                key={index}
                onClick={() => handleClick(item)}
                className={`border-b cursor-pointer hover:bg-yellow-50 transition ${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
              >
                <td className="py-3 px-4 text-gray-700 font-medium">
                  {index + 1}
                </td>
                <td className="py-3 px-4 text-gray-800">{item.serviceName}</td>
                <td className="py-3 px-4 text-gray-600">
                  {item.contents?.length || 0} {item.contents?.length === 1 ? "file" : "files"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudyMaterial;