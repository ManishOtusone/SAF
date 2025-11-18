import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { baseUrl } from "../../utils/baseUrl";

const Content = () => {
  const [limit, setLimit] = useState(0);
  const [selected, setSelected] = useState([]); 
  const [alreadySelected, setAlreadySelected] = useState([]); 
  const [loading, setLoading] = useState(true);

  const contentOptions = [
    "Logo Design",
    "Poster",
    "Business Card",
    "Flyer",
    "Instagram Post",
    "Website Banner",
    "Brochure",
    "Letterhead",
    "Menu Design",
    "Thumbnail",
    "Pitch Deck Slide",
    "Product Mockup",
  ];

  // Fetch membership + previous requests
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("accessToken");

        // 1️⃣ GET MEMBERSHIP LIMIT
        const res = await axios.get(`${baseUrl}/user/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          const membership = res.data.membership;

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

        // 2️⃣ CHECK IF USER ALREADY SELECTED CONTENT BEFORE
        const oldReq = await axios.get(`${baseUrl}/user/my-requested-content`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (oldReq.data.success) {
          const prev = oldReq.data.data.map((i) => i.service);
          setAlreadySelected(prev);
        }

        setLoading(false);
      } catch (err) {
        console.log("Error:", err);
        setLoading(false);
      }
    })();
  }, []);

  // Handle checkbox selection
  const handleCheck = (service) => {
    // If user already selected max (limit reached)
    if (alreadySelected.length === limit) return;

    // Make sure user can't add more than limit
    if (selected.length >= limit - alreadySelected.length && !selected.includes(service)) {
      toast.error(`You can select only ${limit} content items in your membership.`);
      return;
    }

    if (selected.includes(service)) {
      setSelected(selected.filter((s) => s !== service));
    } else {
      setSelected([...selected, service]);
    }
  };

  const handleSubmit = async () => {
    if (selected.length === 0) {
      return toast.error("Please select at least one content.");
    }

    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.post(
        `${baseUrl}/user/request-content`,
        { selectedServices: selected },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success("Your content selection is locked for this membership!");

        setAlreadySelected([...alreadySelected, ...selected]);
        setSelected([]);
      }
    } catch (err) {
      console.log(err);
      toast.error("Error submitting content.");
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
        {contentOptions.map((item, index) => {
          const isOld = alreadySelected.includes(item);
          const disabled = selectionLocked || isOld;

          return (
            <label
              key={index}
              className={`flex items-center gap-2 p-2 border rounded 
              ${disabled ? "bg-gray-200 opacity-60 cursor-not-allowed" : ""}`}
            >
              <input
                type="checkbox"
                checked={isOld || selected.includes(item)}
                disabled={disabled}
                onChange={() => handleCheck(item)}
              />
              {item}
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
