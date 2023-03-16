import React from "react";
import { Html } from "react-konva-utils";

const ToolsBar = (props) => {
  const anchor = {
    width: 30,
    height: 30,
    borderRadius: 50,
    border: "1px solid black 0.6",
    // boxShadow: "5px 5px 5px rgba(1 1 1/80%)",
    backgroundColor: "orangered",
    padding: 1,
    margin: "5px auto",
    cursor: "grab",
  };
  return (
    <div
      style={{
        left: "96%",
        top: 150,
        width: 55,
        height: "80%",
        backgroundColor: "#3fcbc8",
        position: "fixed",
        display: "flex",
        flexDirection: "column",
        // boxShadow: "3px 3px 3px grey",
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
      <hr style={{ width: 40 }}></hr>
      {props.children.map((child, i) => (
        <React.Fragment key={i}>
          {child}
          <hr style={{ width: 40 }}></hr>
        </React.Fragment>
      ))}
    </div>
  );
};

export default ToolsBar;
