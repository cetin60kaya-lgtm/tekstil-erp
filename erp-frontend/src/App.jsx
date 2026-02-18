import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Shell from "./layout/Shell";

import Dashboard from "./pages/Dashboard";
import ModelPanel from "./pages/ModelPanel";
import Muhasebe from "./pages/Muhasebe";
import IK from "./pages/IK";
import Turlama from "./pages/Turlama";
import ImalatPage from "./pages/ImalatPage";
import Kaliphane from "./pages/Kaliphane";
import BoyahaneOnayli from "./pages/BoyahaneOnayli";
import Desen from "./pages/Desen";
import Numune from "./pages/Numune";
import Sevkiyat from "./pages/Sevkiyat";
import AdminRoot from "./pages/AdminRoot";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/model" element={<ModelPanel />} />
          <Route path="/muhasebe" element={<Muhasebe />} />
          <Route path="/ik" element={<IK />} />
          <Route path="/turlama" element={<Turlama />} />
          <Route path="/imalat" element={<ImalatPage />} />
          <Route path="/kaliphane" element={<Kaliphane />} />
          <Route path="/boyahane" element={<BoyahaneOnayli />} />
          <Route path="/desen" element={<Desen />} />
          <Route path="/numune" element={<Numune />} />
          <Route path="/sevkiyat" element={<Sevkiyat />} />
          <Route path="/admin" element={<AdminRoot />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
