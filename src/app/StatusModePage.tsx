"use client"; // ✅ Required for Client Components

import React from "react";
import { useNavigate } from "react-router-dom";
import SeatMappingTool from "../components/SeatMappingTool"; // Import your grid component

const StatusModePage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Status Mode</h1>
      <button onClick={() => navigate("/label")}>Switch to Label Mode</button>
      <SeatMappingTool />
    </div>
  );
};

export default StatusModePage;
