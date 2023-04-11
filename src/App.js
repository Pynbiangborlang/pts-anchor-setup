import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Level from "./components/level/Level";
import Configuration from "./components/index/Configuration.js";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Configuration />} />
        <Route path="personnel-stats" element={<Level />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
