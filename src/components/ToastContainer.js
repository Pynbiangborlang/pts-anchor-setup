import React, { useState, useEffect } from "react";

const ToastContainer = ({ type = "", message }) => {
  const [display, setDisplay] = useState("none");

  useEffect(() => {
    setDisplay("flex");
    setTimeout(() => setDisplay("none"), 5000);
    return () => {};
  }, []);

  return (
    <div
      style={{
        top: 70,
        left: "40%",
        display: display,
        zIndex: 2,
        position: "fixed",
        width: "30%",
        height: "60px",
        margin: "0px auto",
        padding: "10px 3px",
        border: "1px solid grey",
        backgroundColor: "white",
        borderTop: `5px solid ${type === "error" ? "red" : "green"}`,
      }}
    >
      <span style={{ color: type === "error" ? "red" : "green" }}>
        {type.toLocaleUpperCase()}:
      </span>
      <span>{message}</span>
    </div>
  );
};

export default ToastContainer;
