import React from "react";
import { Html } from "react-konva-utils";

const ToolsBar = (props) => {
  const anchor = {
    width: 30,
    height: 30,
    borderRadius: 50,
    border: "1px solid black 0.6",
    boxShadow: "5px 5px 5px rgba(1 1 1/80%)",
    backgroundColor: "red",
    padding: 1,
    margin: "10px auto",
    cursor: "grab",
  };
  return (
    <div
      style={{
        left: "95%",
        top: 100,
        width: 60,
        height: 600,
        backgroundColor: "rgba(50, 150, 198, 0.704)",
        position: "fixed",
        display: "flex",
        flexDirection: "column",
        boxShadow: "3px 3px 3px grey",
        borderRadius: 5,
        zIndex: 2,
      }}
      onDragOver={(e) => {
        e.preventDefault();
      }}
    >
      <div
        style={anchor}
        draggable="true"
        onDragStart={(e) => {
          e.target.style.cursor = "grabbing";
        }}
        onMouseDown={(e) => {
          e.target.style.cursor = "grabbing";
        }}
        onMouseOut={(e) => (e.target.style.cursor = "grab")}
      />
      <br></br>
      {props.children}
    </div>
  );
};

export default ToolsBar;
