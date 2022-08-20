import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const mount = (el) => {
  console.log("im inside mount");
  createRoot(el).render(<App />);
};

if (process.env.NODE_ENV === "development") {
  console.log("im inside if");
  const devRoot = document.getElementById("root");
  if (devRoot) {
    mount(devRoot);
  }
}

export default { mount };
