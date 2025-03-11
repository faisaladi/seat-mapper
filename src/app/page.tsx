"use client"; // ✅ Required for Client Components

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import StatusModePage from "./StatusModePage";
import LabelModePage from "./LabelModePage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/status" />} />
        <Route path="/status" element={<StatusModePage />} />
        <Route path="/label" element={<LabelModePage />} />
      </Routes>
    </Router>
  );
};

export default App;
