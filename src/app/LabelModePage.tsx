"use client"; // ✅ Required for Client Components

import React from "react";
import { useNavigate } from "react-router-dom";
import SeatMappingTool from "../components/SeatMappingTool"; // Use the same grid component

const LabelModePage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Label Mode</h1>
      <button onClick={() => navigate("/status")}>Switch to Status Mode</button>
      <SeatMappingTool />
    </div>
  );
};

export default LabelModePage;
