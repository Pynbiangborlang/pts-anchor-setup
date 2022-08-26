import axios from "axios";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Rect, Circle, Text, Group } from "react-konva";
import { Html } from "react-konva-utils";
import Popup, { PopupBody, PopupHeader, PopupItem } from "./components/Popup";
import ToolsBar from "./components/ToolsBar";
import styles from "./styles.css";

const generateLevels = ({ cellSize, anchorPos }) => {
  let arr = [];
  let x0 = anchorPos.x,
    y0 = anchorPos.y;
  let radius = anchorPos.radius;
  let x = x0 - cellSize,
    y = y0 - cellSize;
  let level = 0;

  function interPolatePoints(point) {
    let x = point.x,
      y = point.y;
    let points = [];

    //top
    for (let i = x; i < x + 2 * (x0 - x); i += cellSize) {
      if (i <= x0) {
        if (checkIsPointInCircle(i, y)) {
          points.push({
            tokenId: "",
            x: i,
            y: y,
            distance: Math.sqrt(Math.pow(x0 - i, 2) + Math.pow(y0 - y, 2)),
          });
        }
      } else {
        if (checkIsPointInCircle(cellSize + i, y)) {
          points.push({
            tokenId: "",
            x: i,
            y: y,
            distance: Math.sqrt(
              Math.pow(x0 - cellSize + i, 2) + Math.pow(y0 - y, 2)
            ),
          });
        }
      }
    }

    //right
    for (let i = y + cellSize; i < y + 2 * (y0 - y) - cellSize; i += cellSize) {
      if (i <= y0) {
        if (checkIsPointInCircle(x + 2 * (x0 - x), i)) {
          points.push({
            tokenId: "",
            x: x + 2 * (x0 - x) - cellSize,
            y: i,
            distance: Math.sqrt(
              Math.pow(x0 - x + cellSize, 2) + Math.pow(y0 - i, 2)
            ),
          });
        }
      } else {
        if (checkIsPointInCircle(x + 2 * (x0 - x), i + cellSize)) {
          points.push({
            tokenId: "",
            x: x + 2 * (x0 - x) - cellSize,
            y: i,
            distance: Math.sqrt(
              Math.pow(x0 - x, 2) + Math.pow(y0 - i + cellSize, 2)
            ),
          });
        }
      }
    }

    // //bottom
    for (let i = x + 2 * (x0 - x) - cellSize; i >= x; i -= cellSize) {
      if (i > x0) {
        if (checkIsPointInCircle(i + cellSize, y + 2 * (y0 - y))) {
          points.push({
            tokenId: "",
            x: i,
            y: y + 2 * (y0 - y) - cellSize,
            distance: Math.sqrt(
              Math.pow(x0 - i + cellSize, 2) + Math.pow(y0 - y, 2)
            ),
          });
        }
      } else {
        if (checkIsPointInCircle(i, y + 2 * (y0 - y))) {
          points.push({
            tokenId: "",
            x: i,
            y: y + 2 * (y0 - y) - cellSize,
            distance: Math.sqrt(
              Math.pow(x0 - i, 2) + Math.pow(y0 - y + 2 * (y0 - y), 2)
            ),
          });
        }
      }
    }

    //left
    for (
      let i = y + 2 * (y0 - y) - 2 * cellSize;
      i >= y + cellSize;
      i -= cellSize
    ) {
      //check if point lies in circle or not
      //if no decrement x b cell size
      if (i <= y0) {
        if (checkIsPointInCircle(x, i)) {
          points.push({
            tokenId: "",
            x: x,
            y: i,
            distance: Math.sqrt(Math.pow(x0 - x, 2) + Math.pow(y0 - i, 2)),
          });
        }
      } else {
        if (checkIsPointInCircle(x, i + cellSize)) {
          points.push({
            tokenId: "",
            x: x,
            y: i,
            distance: Math.sqrt(
              Math.pow(x0 - x, 2) + Math.pow(y0 - i + cellSize, 2)
            ),
          });
        }
      }
    }

    return points.sort((a, b) => a.distance - b.distance);
  }

  function checkIsPointInCircle(a, b) {
    return (
      Math.sqrt(Math.pow(a - x0, 2) + Math.pow(b - y0, 2)) <=
      Math.sqrt(Math.pow(radius, 2) + Math.pow(cellSize, 2))
    );
  }

  while (x0 - x <= radius && y0 - y <= radius) {
    arr[level] = interPolatePoints({ x: x, y: y });
    x = x - cellSize;
    y = y - cellSize;
    level++;
  }
  return arr;
};

const Grid = ({ cellSize, anchorPos }) => {
  let k = 0;
  return (
    <>
      {anchorPos?.location.map((level, i) => {
        return (
          <Group
            key={`${anchorPos.id}_level${i}`}
            onMouseOver={(e) => {
              e.target.parent?.children.map((child) => {
                if (child.className === "Rect") {
                  child.setAttr("fill", "green");
                }
              });
            }}
            opacity={1}
            onMouseOut={(e) => {
              e.target?.parent?.children.map((child) => {
                if (child.className === "Rect") {
                  child.setAttr("fill", "yellow");
                }
              });
            }}
          >
            {level.map((cell, j) => (
              <React.Fragment key={`rect${anchorPos.id}_${i}_${j}`}>
                <Rect
                  // key={`rect${anchorPos.id}_${i}_${j}`}
                  x={cell.x}
                  y={cell.y}
                  width={cellSize}
                  height={cellSize}
                  stroke="black"
                  strokeWidth={0.5}
                  fill="yellow"
                  opacity={0.3}
                />
                <Text
                  // key={`text${anchorPos.id}_${i}_${j}`}
                  text={`${k++}`}
                  x={cell.x}
                  y={cell.y}
                ></Text>
              </React.Fragment>
            ))}
          </Group>
        );
      })}
    </>
  );
};

const App = () => {
  const cellSize = 30;
  const stageRef = useRef(null);
  const stagePos = useRef({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [anchorsPos, setAnchorsPos] = useState([]);
  const [draggedId, setDragedId] = useState(null);
  const [isSelected, setIsSelected] = useState(false);
  const [tooltip, setTooltip] = useState();

  //listens when anchor is dropped in canvas
  const handleDrop = (e) => {
    e.preventDefault();
    stageRef.current?.setPointersPositions(e);
    let { x, y } = stageRef.current?.getPointersPositions()[0];

    let anchorPos = {
      id: Date.now(),
      x: x - stagePos.current.x,
      y: y - stagePos.current.y,
      radius: 210,
      location: [[{}]],
      zone: "",
      tokens: 0,
      teams: 0,
    };

    anchorPos.location = [...generateLevels({ cellSize, anchorPos })];

    setAnchorsPos((anchorsPos) => {
      anchorsPos.push(anchorPos);
      return [...anchorsPos];
    });
  };

  //listens when anchor is drageed in canvas
  const handleAnchorDrag = ({ e, anchorPos }) => {
    setDragedId(null);

    setAnchorsPos((currentAnchors) => {
      currentAnchors.forEach((anchor) => {
        if (anchor.id === anchorPos.id) {
          anchor.x = e.target.attrs.x;
          anchor.y = e.target.attrs.y;
          let anchorPos = {
            id: anchor.id,
            x: e.target.attrs.x,
            y: e.target.attrs.y,
            radius: 210,
          };
          anchor.location = generateLevels({ cellSize, anchorPos });
        }
      });
      console.log(currentAnchors);
      return [...currentAnchors];
    });
  };

  //listens when anchor is clicked
  const handleAnchorClick = (e, anchor) => {
    setIsSelected(!isSelected);
    setTooltip({
      x: e.target.attrs.x + 5,
      y: e.target.attrs.y + 2,
      object: anchor,
    });
  };

  //listens when anchor property is changing
  const handleAnchorChange = ({ anchorId, property, value }) => {
    console.log(value);
    console.log(anchorId);
    setAnchorsPos((currentAnchorPos) => {
      currentAnchorPos.map((anchor) => {
        if (anchorId === anchor.id) {
          if (property === "id") {
            anchor.id = value;
          } else if (property === "zone") {
            anchor.zone = value;
          } else if (property === "tokens") {
            anchor.tokens = value;
          } else if (property === "teams") {
            anchor.teams = value;
          }
        }
      });
      return [...currentAnchorPos];
    });
  };
  return (
    <>
      <ToolsBar>
        <button
          className="pts-toolsbar-btn"
          onClick={() => setIsVisible(!isVisible)}
        >
          {isVisible ? "hide" : "show"}
        </button>
        <button
          className="pts-toolsbar-btn"
          onClick={() => {
            console.log(anchorsPos);
          }}
        >
          Save
        </button>
      </ToolsBar>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
        }}
      >
        <Stage
          draggable
          width={window.innerWidth}
          height={window.innerHeight}
          ref={stageRef}
          onDragEnd={(e) => {
            stagePos.current.x = e.currentTarget.position().x;
            stagePos.current.y = e.currentTarget.position().y;
          }}
        >
          <Layer>
            {anchorsPos?.map((anchorPos, i) => (
              <React.Fragment key={`radius${i}`}>
                {!(draggedId === anchorPos.id) && (
                  // the radius coverage of the anchor
                  <Circle
                    x={anchorPos.x}
                    y={anchorPos.y}
                    radius={anchorPos.radius}
                    fill="blue"
                    opacity={0.1}
                  />
                )}
                {/* representing anchor in canvas */}
                <Circle
                  x={anchorPos.x}
                  y={anchorPos.y}
                  radius={10}
                  fill="red"
                  opacity={0.7}
                  draggable
                  onDragStart={() => {
                    setDragedId(anchorPos.id);
                    setIsSelected(false);
                  }}
                  onDragEnd={(e) => handleAnchorDrag({ e, anchorPos })}
                  onClick={(e) => handleAnchorClick(e, anchorPos)}
                />
              </React.Fragment>
            ))}
            {isVisible &&
              anchorsPos?.map((anchorPos) => (
                <Grid
                  key={anchorPos.id}
                  cellSize={cellSize}
                  anchorPos={anchorPos}
                />
              ))}
          </Layer>
          {isSelected && (
            <Layer x={tooltip?.x} y={tooltip?.y}>
              <Html>
                <Popup className="sb-pts-popup">
                  <PopupHeader className="sb-pts-popup-hdr" label="id">
                    <PopupItem
                      type="select"
                      options={[0, 1, 2]}
                      onChange={(newZone) =>
                        handleAnchorChange({
                          anchorId: tooltip.object.id,
                          property: "zone",
                          value: newZone,
                        })
                      }
                    />
                  </PopupHeader>
                  <PopupBody>
                    <PopupItem
                      type="select"
                      label="Zone"
                      options={[0, 1, 2]}
                      text={tooltip?.object.zone}
                      editable={true}
                      onChange={(newZone) =>
                        handleAnchorChange({
                          anchorId: tooltip.object.id,
                          property: "zone",
                          value: newZone,
                        })
                      }
                    />
                    <PopupItem
                      type="number"
                      label="Tokens"
                      value={tooltip?.object.tokens}
                      editable={true}
                      onChange={(newTokens) =>
                        handleAnchorChange({
                          anchorId: tooltip.object.id,
                          property: "tokens",
                          value: newTokens,
                        })
                      }
                    />
                    <PopupItem
                      type="number"
                      label="Teams"
                      value={tooltip?.object.teams}
                      editable={true}
                      onChange={(newTeam) =>
                        handleAnchorChange({
                          anchorId: tooltip.object.id,
                          property: "teams",
                          value: newTeam,
                        })
                      }
                    />
                  </PopupBody>
                </Popup>
              </Html>
            </Layer>
          )}
        </Stage>
      </div>
    </>
  );
};

export default App;
