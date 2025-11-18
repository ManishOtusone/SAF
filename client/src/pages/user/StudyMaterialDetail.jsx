import React, { useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { baseUrl } from "../../utils/baseUrl";

const StudyMaterialDetail = () => {
  const { state } = useLocation();
  const item = state?.contentData;

  if (!item) return <div className="p-6">Invalid material</div>;

  // ⭐⭐⭐ AUTO-MARK AS COMPLETED HERE ⭐⭐⭐
  useEffect(() => {
    const markComplete = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        await axios.post(
          `${baseUrl}/user/complete-study-material`,
          { contentId: item._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // This refreshes the dashboard
        window.dispatchEvent(new Event("progressUpdated"));
      } catch (err) {
        console.log("Mark complete error", err);
      }
    };

    markComplete();
  }, [item._id]);
  // ⭐⭐⭐ END ⭐⭐⭐

  // YOUTUBE EMBED FIX
  const getEmbedUrl = (url) => {
    try {
      if (url.includes("youtu.be")) {
        const id = url.split("youtu.be/")[1].split("?")[0];
        return `https://www.youtube.com/embed/${id}`;
      }
      if (url.includes("watch?v=")) {
        const id = url.split("watch?v=")[1].split("&")[0];
        return `https://www.youtube.com/embed/${id}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  const finalUrl = item.type === "video" ? getEmbedUrl(item.url) : item.url;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">{item.title}</h1>

      {item.type === "pdf" ? (
        <iframe
          src={item.url}
          className="w-full h-[80vh] border"
          title="PDF Viewer"
        ></iframe>
      ) : (
        <iframe
          src={finalUrl}
          className="w-full h-[80vh] border"
          allowFullScreen
          title="Video Viewer"
        ></iframe>
      )}
    </div>
  );
};

export default StudyMaterialDetail;
