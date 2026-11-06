import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  SolutionsLibraryPage, SolutionDetailPage, RequestSolutionPage,
} from "./features/solutions";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/solutions" replace />} />
      <Route path="/solutions" element={<SolutionsLibraryPage />} />
      <Route path="/solutions/request" element={<RequestSolutionPage />} />
      <Route path="/solutions/:slug" element={<SolutionDetailPage />} />
    </Routes>
  </BrowserRouter>
);
