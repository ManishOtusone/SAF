import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { baseUrl } from "../../utils/baseUrl";

const Content = () => {
  const [limit, setLimit] = useState(0);
  const [selected, setSelected] = useState([]);
  const [alreadySelected, setAlreadySelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contentOptions, setContentOptions] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("accessToken");

        const dashboardRes = await axios.get(`${baseUrl}/user/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (dashboardRes.data.success) {
          const membership = dashboardRes.data.membership;

          if (membership?.contentLimit > 0) {
            setLimit(membership.contentLimit);
          } else {
            const plan = membership?.planName;
            if (plan === "StartupStage") setLimit(4);
            else if (plan === "GrowthStage") setLimit(8);
            else if (plan === "MatureStage") setLimit(12);
            else setLimit(4);
          }
        }

        const oldReq = await axios.get(`${baseUrl}/user/my-requested-content`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (oldReq.data.success) {
          const prev = oldReq.data.data.map((i) => i.service);
          setAlreadySelected(prev);
        }

        const contentRes = await axios.get(`${baseUrl}/user/content-options`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (contentRes.data.success) {
          setContentOptions(contentRes.data.data);
        }

        setLoading(false);
      } catch (err) {
        console.log("ERROR:", err);
        setLoading(false);
      }
    })();
  }, []);

  const handleCheck = (serviceName) => {
    if (alreadySelected.length === limit) return;

    if (
      selected.length >= limit - alreadySelected.length &&
      !selected.includes(serviceName)
    ) {
      Swal.fire({
        icon: "warning",
        title: "Selection Limit Reached",
        text: `You can select only ${limit} content items in your membership.`,
      });
      return;
    }

    if (selected.includes(serviceName)) {
      setSelected(selected.filter((s) => s !== serviceName));
    } else {
      setSelected([...selected, serviceName]);
    }
  };

  const handleSubmit = async () => {
    if (selected.length === 0) {
      return Swal.fire({
        icon: "warning",
        title: "No Content Selected",
        text: "Please select at least one content.",
      });
    }

    const confirmResult = await Swal.fire({
      title: "Confirm Selection?",
      text: "Once submitted, your selection will be locked for this membership.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Submit",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      const token = localStorage.getItem("accessToken");

      Swal.fire({
        title: "Submitting...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await axios.post(
        `${baseUrl}/user/request-content`,
        { selectedServices: selected },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.close();

      if (res.data.success) {
        await Swal.fire({
          icon: "success",
          title: "Selection Locked!",
          text: "Your content selection is locked for this membership.",
          confirmButtonColor: "#16a34a",
        });

        setAlreadySelected([...alreadySelected, ...selected]);
        setSelected([]);
      }
    } catch (err) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error submitting content.",
      });
      console.log(err);
    }
  };
  
  if (loading) return <p>Loading...</p>;

  const selectionLocked = alreadySelected.length >= limit;

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-2">Online Learning Sessions</h1>

      <h2 className="text-xl font-bold mb-4">
        Select Content ({alreadySelected.length}/{limit})
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {contentOptions.map((item) => {
          const name = item.name;
          const isOld = alreadySelected.includes(name);
          const disabled = selectionLocked || isOld;

          return (
            <label
              key={item._id}
              className={`flex items-center gap-2 p-2 border rounded 
              ${disabled ? "bg-gray-200 opacity-60 cursor-not-allowed" : ""}`}
            >
              <input
                type="checkbox"
                checked={isOld || selected.includes(name)}
                disabled={disabled}
                onChange={() => handleCheck(name)}
              />
              {name}
            </label>
          );
        })}
      </div>

      <button
        onClick={handleSubmit}
        disabled={selectionLocked || selected.length === 0}
        className="mt-5 px-5 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
      >
        Submit
      </button>
    </div>
  );
};

export default Content;
