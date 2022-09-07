import React, { useState } from "react";

const PopupItem = ({ type = "", className = "", ...props }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(props.text || props.value || "");
  return (
    <div style={{ display: "inline-flex" }} className={className}>
      {props.label && <label>{props.label}:</label>}
      {type === "select" && (
        <>
          <div
            style={{
              display: "inline-flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                background: "white",
                display: "flex",
                width: props.width ? props.width : "200px",
                border: "1px solid black",
              }}
            >
              <input
                style={{
                  background: "white",
                  width: "94%",
                  border: "0px",
                  outline: "0px",
                }}
                value={value}
                type="select"
                onChange={(e) => setValue(e.target.value)}
                onClick={(e) => setIsEditing(!isEditing)}
              />
              <button
                style={{
                  float: "right",
                  background: "white",
                  border: "0px",
                  width: "10%",
                }}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <>&#9650;</> : <>&#9660;</>}
              </button>
            </div>
            <ul
              style={{
                margin: 0,
                marginTop: "20px",
                width: props.width ? props.width : "200px",
                display: isEditing ? "inline-flex" : "none",
                listStyle: "none",
                background: "white",
                flexDirection: "column",
                padding: 0,
                position: "absolute",
                color: "black",
              }}
              onMouseLeave={() => {
                setIsEditing(!isEditing);
              }}
            >
              {props.options &&
                props.options.map((option, i) => (
                  <li
                    style={{ paddingLeft: "5px" }}
                    key={i}
                    onMouseOver={(e) =>
                      (e.target.style.backgroundColor = "whitesmoke")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "white")
                    }
                    onClick={() => {
                      setValue(option);
                      props.onChange(option);
                      setIsEditing(!isEditing);
                    }}
                  >
                    {option}
                  </li>
                ))}
            </ul>
          </div>
        </>
      )}
      {type === "input" && (
        <input
          placeholder={props.name}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
        />
      )}
      {type === "text" && (
        <>
          <span
            onClick={() => {
              props.editable ? setIsEditing(true) : () => {};
            }}
            style={{ display: isEditing ? "none" : "inline" }}
          >
            {props.text ? props.text : ""}
          </span>
          {props.editable && (
            <input
              type="text"
              value={value}
              style={{
                display: !isEditing ? "none" : "inline",
              }}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.code === "Enter") {
                  setIsEditing(false);
                  props.onChange(value);
                }
              }}
            />
          )}
        </>
      )}
      {type === "number" && (
        <>
          <span
            onClick={() => {
              props.editable ? setIsEditing(true) : () => {};
            }}
            style={{ display: isEditing ? "none" : "inline" }}
          >
            {props.value}
          </span>
          {props.editable && (
            <input
              type="number"
              value={value}
              style={{
                display: !isEditing ? "none" : "inline",
              }}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.code === "Enter") {
                  setIsEditing(false);
                  props.onChange(value);
                }
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

const PopupBody = ({ className = "", children, ...props }) => {
  return (
    <div
      className={className}
      style={{ display: "flex", flexDirection: "column", padding: "2px" }}
    >
      {children}
    </div>
  );
};

const PopupHeader = ({ className = "", label = "", ...props }) => {
  return (
    <div className={className}>
      <span>{label}</span>
      {props.children ? props.children : ""}
    </div>
  );
};

const Popup = ({ className = "", ...props }) => {
  return <div className={className}>{props.children}</div>;
};

export default Popup;

export { PopupBody, PopupHeader, PopupItem };
