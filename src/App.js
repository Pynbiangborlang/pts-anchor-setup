import axios from "axios";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Stage,
  Layer,
  Rect,
  Circle,
  Text,
  Group,
  Line,
  Image,
} from "react-konva";
// import URLImage from "./components/Image";
import { Html } from "react-konva-utils";
import Popup, { PopupBody, PopupHeader, PopupItem } from "./components/Popup";
import ToolsBar from "./components/ToolsBar";
import styles from "./styles.css";
import { isInsideShape } from "./utils/isInside";
import floorPlan from "./assets/PTS_Floor-Plan.png";
import useImage from "use-image";
import { PolygonConstructor } from "./lib/sb_Polygon_constructor/PolygonConstructor";
import { ANCHOR_RADIUS, CELL_SIZE } from "./config/anchor.config";
import Konva from "konva";

const generateLevels = ({
  cellSize,
  anchorPos,
  shape,
  scaleX,
  scaleY,
  anchorRange,
}) => {
  let arr = [];
  let x0 = anchorPos.x * scaleX,
    y0 = anchorPos.y * scaleY;
  let radius = anchorRange;
  let x = x0 - cellSize,
    y = y0 - cellSize;
  let level = 0;
  let cellIndex = 0;

  function interPolatePoints(point) {
    let x = point.x,
      y = point.y;
    let points = [];

    //top
    for (let i = x; i < x + 2 * (x0 - x); i += cellSize) {
      if (i <= x0) {
        if (
          checkIsPointInCircle(i, y) &&
          isInsideShape(shape, { x: i / scaleX, y: y / scaleY })
        ) {
          points.push({
            cellIndex: cellIndex++,
            tokenId: "",
            x: i / scaleX,
            y: y / scaleY,
            distance: Math.sqrt(Math.pow(x0 - i, 2) + Math.pow(y0 - y, 2)),
          });
        }
      } else {
        if (
          checkIsPointInCircle(cellSize + i, y) &&
          isInsideShape(shape, {
            x: (cellSize + i) / scaleX,
            y: y / scaleY,
          })
        ) {
          points.push({
            cellIndex: cellIndex++,
            tokenId: "",
            x: i / scaleX,
            y: y / scaleY,
            distance: Math.sqrt(
              Math.pow(x0 - (cellSize + i), 2) + Math.pow(y0 - y, 2)
            ),
          });
        }
      }
    }

    //right
    for (let i = y + cellSize; i < y + 2 * (y0 - y) - cellSize; i += cellSize) {
      if (i <= y0) {
        if (
          checkIsPointInCircle(x + 2 * (x0 - x), i) &&
          isInsideShape(shape, {
            x: (x + 2 * (x0 - x)) / scaleX,
            y: i / scaleY,
          })
        ) {
          points.push({
            cellIndex: cellIndex++,
            tokenId: "",
            x: (x + 2 * (x0 - x) - cellSize) / scaleX,
            y: i / scaleY,
            distance: Math.sqrt(
              Math.pow(x0 - (x + cellSize), 2) + Math.pow(y0 - i, 2)
            ),
          });
        }
      } else {
        if (
          checkIsPointInCircle(x + 2 * (x0 - x), i + cellSize) &&
          isInsideShape(shape, {
            x: (x + 2 * (x0 - x)) / scaleX,
            y: (i + cellSize) / scaleY,
          })
        ) {
          points.push({
            cellIndex: cellIndex++,
            tokenId: "",
            x: (x + 2 * (x0 - x) - cellSize) / scaleX,
            y: i / scaleY,
            distance: Math.sqrt(
              Math.pow(x0 - x, 2) + Math.pow(y0 - (i + cellSize), 2)
            ),
          });
        }
      }
    }

    // //bottom
    for (let i = x + 2 * (x0 - x) - cellSize; i >= x; i -= cellSize) {
      if (i > x0) {
        if (
          checkIsPointInCircle(i + cellSize, y + 2 * (y0 - y)) &&
          isInsideShape(shape, {
            x: (i + cellSize) / scaleX,
            y: (y + 2 * (y0 - y)) / scaleY,
          })
        ) {
          points.push({
            cellIndex: cellIndex++,
            tokenId: "",
            x: i / scaleX,
            y: (y + 2 * (y0 - y) - cellSize) / scaleY,
            distance: Math.sqrt(
              Math.pow(x0 - i + cellSize, 2) + Math.pow(y0 - y, 2)
            ),
          });
        }
      } else {
        if (
          checkIsPointInCircle(i, y + 2 * (y0 - y)) &&
          isInsideShape(shape, {
            x: i / scaleX,
            y: (y + 2 * (y0 - y)) / scaleY,
          })
        ) {
          points.push({
            cellIndex: cellIndex++,
            tokenId: "",
            x: i / scaleX,
            y: (y + 2 * (y0 - y) - cellSize) / scaleY,
            distance: Math.sqrt(
              Math.pow(x0 - i, 2) + Math.pow(y0 - (y + 2 * (y0 - y)), 2)
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
        if (
          checkIsPointInCircle(x, i) &&
          isInsideShape(shape, { x: x / scaleX, y: i / scaleY })
        ) {
          points.push({
            cellIndex: cellIndex++,
            tokenId: "",
            x: x / scaleX,
            y: i / scaleY,
            distance: Math.sqrt(Math.pow(x0 - x, 2) + Math.pow(y0 - i, 2)),
          });
        }
      } else {
        if (
          checkIsPointInCircle(x, i + cellSize) &&
          isInsideShape(shape, {
            x: x / scaleX,
            y: (i + cellSize) / scaleY,
          })
        ) {
          points.push({
            cellIndex: cellIndex++,
            tokenId: "",
            x: x / scaleX,
            y: i / scaleY,
            distance: Math.sqrt(
              Math.pow(x0 - x, 2) + Math.pow(y0 - (i + cellSize), 2)
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
  console.log(arr);
  return arr;
};

const Grid = ({ cellSize, anchorPos, scaleX, scaleY }) => {
  return (
    <>
      {anchorPos?.locations.map((level, i) => {
        return (
          <Group key={`${anchorPos.id}_level${i}`} opacity={1}>
            {level.map((cell, j) => (
              <React.Fragment key={`rect${anchorPos.id}_${i}_${j}`}>
                <Rect
                  x={cell.x * scaleX}
                  y={cell.y * scaleY}
                  width={cellSize}
                  height={cellSize}
                  stroke="black"
                  strokeWidth={0.5}
                  fill="yellow"
                  opacity={0.3}
                />
              </React.Fragment>
            ))}
          </Group>
        );
      })}
    </>
  );
};

const URLImage = ({ image }) => {
  const [img] = useImage(image.url);
  return <Image image={img} width={image.width} height={image.height} />;
};

const App = () => {
  const stageRef = useRef(null);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [anchors, setAnchors] = useState([]);
  const [draggedId, setDragedId] = useState(null);
  const [isSelected, setIsSelected] = useState(false);
  const [tooltip, setTooltip] = useState({});
  const [isMapping, setIsMapping] = useState(false);
  const [shape, setShape] = useState([]);
  const [anchorsIds, setAnchorsIds] = useState([]);
  const [zones, setZones] = useState([]);
  const scaleX = window.innerWidth / 100;
  const scaleY = window.innerHeight / 100;
  const [prevScale, setPrevScale] = useState({
    scaleX: scaleX,
    scaleY: scaleY,
  });
  const [cellSize, setCellSize] = useState(CELL_SIZE);
  const [anchorRange, setAnchorRange] = useState(ANCHOR_RADIUS);

  useEffect(() => {
    setCellSize((cellSize / prevScale.scaleX) * scaleX);
    setAnchorRange((anchorRange / prevScale.scaleX) * scaleX);
    setPrevScale({ ...prevScale, scaleX: scaleX, scaleY: scaleY });
  }, [scaleX, scaleY]);

  //listens when anchor is dropped in canvas
  const handleDrop = (e) => {
    e.preventDefault();
    stageRef.current?.setPointersPositions(e);
    let { x, y } = stageRef.current?.getPointersPositions()[0];

    if (stageRef.current.getIntersection({ x, y })?.className === "Line") {
      let anchorPos = {
        id: Date.now(),
        x: (x - stagePos.x) / scaleX,
        y: (y - stagePos.y) / scaleY,
        radius: ANCHOR_RADIUS / scaleX,
        locations: [[{}]],
        shape: [],
      };
      let points = stageRef.current.getIntersection({ x, y }).attrs.points;
      let shape = [];
      //cache the points of the room
      for (let i = 0; i < points.length; i += 2) {
        shape.push({ x: points[i] / scaleX, y: points[i + 1] / scaleY });
      }
      anchorPos.shape = shape;
      anchorPos.locations = [
        ...generateLevels({
          cellSize,
          anchorPos,
          shape,
          scaleX,
          scaleY,
          anchorRange,
        }),
      ];

      setAnchors((currentAnchors) => {
        currentAnchors.push(anchorPos);
        return [...currentAnchors];
      });
    } else {
      let anchorPos = {
        id: Date.now(),
        x: (x - stagePos.x) / scaleX,
        y: (y - stagePos.y) / scaleY,
        radius: ANCHOR_RADIUS / scaleX,
        locations: [[{}]],
        shape: [],
      };
      let shape = [
        { x: (x - ANCHOR_RADIUS) / scaleX, y: (y - ANCHOR_RADIUS) / scaleY },
        { x: (x + ANCHOR_RADIUS) / scaleX, y: (y - ANCHOR_RADIUS) / scaleY },
        { x: (x + ANCHOR_RADIUS) / scaleX, y: (y + ANCHOR_RADIUS) / scaleY },
        { x: (x - ANCHOR_RADIUS) / scaleX, y: (y + ANCHOR_RADIUS) / scaleY },
        { x: (x - ANCHOR_RADIUS) / scaleX, y: (y - ANCHOR_RADIUS) / scaleY },
      ];
      // anchorPos.shape = shape;s
      anchorPos.locations = [
        ...generateLevels({
          cellSize,
          anchorPos,
          shape,
          scaleX,
          scaleY,
          anchorRange,
        }),
      ];
      setAnchors((anchors) => {
        anchors.push(anchorPos);
        return [...anchors];
      });
    }
  };

  //listens when anchor is drageed in canvas
  const handleAnchorDrag = ({ e, anchorPos }) => {
    setDragedId(null);

    setAnchors((currentAnchors) => {
      currentAnchors.forEach((anchor) => {
        if (anchor.id === anchorPos.id) {
          anchor.x = e.target.attrs.x / scaleX;
          anchor.y = e.target.attrs.y / scaleY;
          let anchorPos = {
            id: anchor.id,
            x: e.target.attrs.x / scaleX,
            y: e.target.attrs.y / scaleY,
            radius: ANCHOR_RADIUS / scaleX,
          };
          let x = e.target.attrs.x;
          let y = e.target.attrs.y;
          anchor.locations = generateLevels({
            cellSize,
            anchorPos,
            shape: anchor.shape[0]
              ? anchor.shape
              : [
                  {
                    x: (x - ANCHOR_RADIUS) / scaleX,
                    y: (y - ANCHOR_RADIUS) / scaleY,
                  },
                  {
                    x: (x + ANCHOR_RADIUS) / scaleX,
                    y: (y - ANCHOR_RADIUS) / scaleY,
                  },
                  {
                    x: (x + ANCHOR_RADIUS) / scaleX,
                    y: (y + ANCHOR_RADIUS) / scaleY,
                  },
                  {
                    x: (x - ANCHOR_RADIUS) / scaleX,
                    y: (y + ANCHOR_RADIUS) / scaleY,
                  },
                  {
                    x: (x - ANCHOR_RADIUS) / scaleX,
                    y: (y - ANCHOR_RADIUS) / scaleY,
                  },
                ],
            scaleX,
            scaleY,
            anchorRange,
          });
        }
      });
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
    setAnchors((currentAnchorPos) => {
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

  useEffect(() => {
    axios
      .get("http://localhost:9000/api/1/anchors?Active_YN=Y")
      .then((res) => {
        console.log(res.data);
        if (!res.data[0]) return;
        setAnchors((currentAnchors) => {
          res.data.map((anchor) =>
            currentAnchors.push({
              id: anchor.id,
              locations: anchor.locations,
              shape: anchor.shape,
              x: anchor.x,
              y: anchor.y,
              radius: anchor.range,
              site_id: anchor.site_id,
            })
          );
          return [...currentAnchors];
        });
      })
      .catch((err) => console.log(err));
    axios.get("http://localhost:9000/api/1/anchors?Active_YN=N").then((res) => {
      setAnchorsIds([...res.data.flatMap((anchor) => [anchor.a_id])]);
    });
    axios.get("http://localhost:9000/api/1/zones").then((res) => {
      setZones([...res.data]);
    });
  }, []);

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
            let body = anchors;
            console.log(anchors);
            console.log("save");
            axios
              .post("http://localhost:9000/api/anchors", body)
              .then((res) => console.log("sucess"))
              .catch((err) => console.log(err));
          }}
        >
          Save
        </button>
        <button
          className="pts-toolsbar-btn"
          onClick={() => {
            setIsMapping(!isMapping);
          }}
        >
          Map
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
            setStagePos({
              ...stagePos,
              x: e.currentTarget.position().x,
              y: e.currentTarget.position().y,
            });
          }}
        >
          <Layer>
            <URLImage
              image={{
                url: floorPlan,
                width: window.innerWidth,
                height: window.innerHeight,
              }}
            />
            {shape[0] && (
              <Line
                stroke="green"
                strokeWidth={5}
                offsetX={0}
                closed
                points={shape.flatMap((point) => [
                  point.x * scaleX,
                  point.y * scaleY,
                ])}
                onClick={(e) => console.log(e.target)}
              />
            )}
            {anchors[0] &&
              anchors?.map((anchor, i) => (
                <Line
                  key={i}
                  stroke={Konva.Util.getRandomColor()}
                  strokeWidth={5}
                  points={anchor.shape.flatMap((point) => [
                    point.x * scaleX,
                    point.y * scaleY,
                  ])}
                />
              ))}
            {anchors[0] &&
              anchors?.map((anchorPos, i) => (
                <React.Fragment key={`radius${i}`}>
                  {!(draggedId === anchorPos.id) &&
                    // the radius coverage of the anchor
                    !anchorPos.shape[0] && (
                      <Circle
                        x={anchorPos.x * scaleX}
                        y={anchorPos.y * scaleY}
                        radius={anchorRange}
                        fill="blue"
                        opacity={0.2}
                      />
                    )}
                  {/* representing anchor in canvas */}
                  <Circle
                    x={anchorPos.x * scaleX}
                    y={anchorPos.y * scaleY}
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
              anchors[0] &&
              anchors.map((anchor) => (
                <Grid
                  key={anchor.id}
                  cellSize={cellSize}
                  anchorPos={anchor}
                  scaleX={scaleX}
                  scaleY={scaleY}
                />
              ))}
            {isMapping && (
              <PolygonConstructor
                stage={{ ref: stageRef, pos: stagePos }}
                width={window.innerWidth}
                height={window.innerHeight}
                isMultiple={false}
                setPolygons={(polygon) => {
                  console.log(polygon);
                  if (!polygon[0]) return;
                  let newShape = [];
                  polygon[0]?.points.forEach((point) => {
                    newShape.push({ x: point.x / scaleX, y: point.y / scaleY });
                  });
                  setShape([...newShape]);
                  console.log("im saving shape");
                  setIsMapping(false);
                }}
              />
            )}
          </Layer>
          {isSelected && (
            <Layer x={tooltip?.x} y={tooltip?.y}>
              <Html>
                <Popup className="sb-pts-popup">
                  <PopupHeader className="sb-pts-popup-hdr" label="id:">
                    <PopupItem
                      type="select"
                      options={anchorsIds}
                      onChange={(newId) => {
                        console.log(newId);
                        handleAnchorChange({
                          anchorId: tooltip.object.id,
                          property: "id",
                          value: newId,
                        });
                      }}
                    />
                  </PopupHeader>
                  <PopupBody className="sb-popup-body">
                    <PopupItem
                      type="select"
                      label="Zone"
                      options={zones.flatMap((zone) => [zone.zone])}
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
