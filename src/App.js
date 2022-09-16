import axios from "axios";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Rect, Circle, Group, Line } from "react-konva";
import { Html } from "react-konva-utils";
import Popup, { PopupBody, PopupHeader, PopupItem } from "./components/Popup";
import ToolsBar from "./components/ToolsBar";
import styles from "./styles.css";
import { generateLevels } from "./utils/generatelevels";
import floorPlan from "./assets/PTS_Floor-Plan.png";
import { PolygonConstructor } from "./lib/sb_Polygon_constructor/PolygonConstructor";
import { ANCHOR_RADIUS, CELL_SIZE } from "./config/anchor.config";
import Konva from "konva";
import ToastContainer from "./components/ToastContainer";
import URLImage from "./components/URLImage";

const Grid = ({ cellSize, anchorPos, scaleX, scaleY }) => {
  return (
    <>
      {anchorPos?.locations.map((level, i) => {
        return (
          <Group key={`${anchorPos.id}_level${i}`} opacity={1}>
            {level.map((cell, j) => {
              if (i === 0) {
                return;
              }
              return (
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
              );
            })}
          </Group>
        );
      })}
    </>
  );
};

const App = () => {
  const [anchors, setAnchors] = useState([]);
  const [anchorsIds, setAnchorsIds] = useState([]);
  const [anchorRange, setAnchorRange] = useState(ANCHOR_RADIUS);
  const [cellSize, setCellSize] = useState(CELL_SIZE);
  const [draggedId, setDragedId] = useState(null);
  const [isMouseOver, setIsMouseOver] = useState(false);
  const [isMapping, setIsMapping] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [prevScale, setPrevScale] = useState({
    scaleX: window.innerWidth / 100,
    scaleY: window.innerHeight / 100,
  });
  const [shape, setShape] = useState([]);
  const stageRef = useRef(null);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const scaleX = window.innerWidth / 100;
  const scaleY = window.innerHeight / 100;
  const [toast, setToast] = useState({ type: "", message: "", show: false });
  const [tooltip, setTooltip] = useState({});
  const [zones, setZones] = useState([]);

  useMemo(() => {
    setCellSize((cellSize / prevScale.scaleX) * scaleX);
    setAnchorRange((anchorRange / prevScale.scaleX) * scaleX);
    setPrevScale({
      ...prevScale,
      scaleX: window.innerWidth / 100,
      scaleY: window.innerHeight / 100,
    });
  }, [scaleX, scaleY]);

  //listens when anchor is dropped in canvas
  const handleDrop = (e) => {
    e.preventDefault();
    stageRef.current?.setPointersPositions(e);
    let { x, y } = stageRef.current?.getPointersPositions()[0];

    if (stageRef.current.getIntersection({ x, y })?.className === "Line") {
      let anchorPos = {
        id: Date.now(),
        a_id: null,
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
        a_id: null,
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
    setIsSelected(false);
    setDragedId(null);

    setAnchors((currentAnchors) => {
      let newAnchors = currentAnchors;
      for (let i = 0; i < currentAnchors.length; i++) {
        if (
          newAnchors[i].id === anchorPos.id ||
          newAnchors[i].a_id === anchorPos.a_id
        ) {
          newAnchors[i].x = e.target.attrs.x / scaleX;
          newAnchors[i].y = e.target.attrs.y / scaleY;
          let newAnchorPos = {
            id: newAnchors[i]?.id,
            a_id: newAnchors[i].a_id,
            x: e.target.attrs.x / scaleX,
            y: e.target.attrs.y / scaleY,
            radius: ANCHOR_RADIUS / scaleX,
          };
          let x = e.target.attrs.x;
          let y = e.target.attrs.y;
          newAnchors[i].locations = generateLevels({
            cellSize,
            anchorPos: newAnchorPos,
            shape: newAnchors[i].shape[0]
              ? newAnchors[i].shape
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
          break;
        }
      }
      return [...newAnchors];
    });
  };

  //listens when newAnchors is clicked
  const handleAnchorClick = (e, anchor) => {
    // setIsMouseOver(false);
    setIsSelected(!isSelected);
    setTooltip({
      x: e.target.attrs.x + 5,
      y: e.target.attrs.y + 2,
      object: anchor,
    });
  };

  //listens when anchor property is changing
  const handleAnchorChange = ({ anchorId, property, value }) => {
    setAnchors((currentAnchorPos) => {
      currentAnchorPos.map((anchor) => {
        if (anchorId === anchor.id) {
          if (property === "id") {
            anchor.a_id = value;
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
  //listens when anchor is clicked
  const handleAnchorMouseOver = (e, anchor) => {
    setIsMouseOver(true);
    setTooltip({
      x: e.target.attrs.x + 5,
      y: e.target.attrs.y + 2,
      object: anchor,
    });
  };

  const throwToast = ({ type, message, show }) => {
    setToast({
      ...toast,
      type: type,
      message: message,
      show: show,
    });
    setTimeout(() => {
      setToast({
        ...toast,
        type: "",
        message: "",
        show: false,
      });
    }, 3000);
  };

  const refetch = () => {
    axios
      .get("http://localhost:9000/api/1/anchors?Active_YN=Y")
      .then((res) => {
        if (!res.data[0]) {
          setAnchors([...res.data]);
          setIsSelected(false);
          return;
        }
        setAnchors((currentAnchors) => {
          currentAnchors = [];
          let id = 0;
          res.data.map((anchor) =>
            currentAnchors.push({
              id: id++,
              a_id: anchor.a_id,
              locations: anchor.locations,
              shape: anchor.shape,
              x: anchor.x,
              y: anchor.y,
              radius: anchor.range,
              site_id: anchor.site_id,
              active_yn: anchor.Active_YN,
            })
          );
          return [...currentAnchors];
        });
        setIsSelected(false);
        axios
          .get("http://localhost:9000/api/1/anchors?Active_YN=N")
          .then((res) => {
            setAnchorsIds([...res.data.flatMap((anchor) => [anchor.a_id])]);
          });
      })
      .catch((err) => console.log(err));
  };

  const deactivate = ({ a_id }) => {
    axios
      .post(`http://localhost:9000/api/deactivate/anchors/${a_id}`)
      .then((res) => {
        refetch();
        throwToast({
          type: "success",
          message: "Anchor successfully deactivate",
          show: true,
        });
      })
      .catch((err) => console.log(err));
  };

  const save = (anchorsList) => {
    let body = anchorsList;
    for (let i = 0; i < anchorsList.length; i++) {
      if (anchorsList[i].a_id === null) {
        throwToast({
          type: "error",
          message: "Please select an anchor Id !",
          show: true,
        });
        return;
      }
    }
    axios
      .post("http://localhost:9000/api/anchors", body)
      .then((res) => {
        refetch();
        throwToast({
          type: "success",
          message: "Anchor successfully activated",
          show: true,
        });
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    axios
      .get("http://localhost:9000/api/1/anchors?Active_YN=Y")
      .then((res) => {
        if (!res.data[0]) return;
        let id = 0;
        setAnchors((currentAnchors) => {
          res.data.map((anchor) =>
            currentAnchors.push({
              id: id++,
              a_id: anchor.a_id,
              locations: anchor.locations,
              shape: anchor.shape,
              x: anchor.x,
              y: anchor.y,
              radius: anchor.range,
              site_id: anchor.site_id,
              active_yn: anchor.Active_YN,
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
      {toast.show && (
        <ToastContainer type={toast.type} message={toast.message} />
      )}
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
            save(anchors);
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
          width={10000}
          height={10000}
          ref={stageRef}
          onDragStart={() => setIsVisible(false)}
          onDragEnd={(e) => {
            setStagePos({
              ...stagePos,
              x: e.currentTarget.position().x,
              y: e.currentTarget.position().y,
            });
          }}
        >
          <Layer key={`layer1`}>
            <URLImage
              image={{
                url: floorPlan,
                width: 3840,
                height: 2917,
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
                lineJoin="round"
              />
            )}
            {anchors[0] &&
              anchors?.map((anchor, i) => (
                <Line
                  key={`room${i}`}
                  stroke="blue"
                  strokeWidth={5}
                  points={anchor.shape.flatMap((point) => [
                    point.x * scaleX,
                    point.y * scaleY,
                  ])}
                  lineJoin="round"
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
                        radius={anchorPos.radius * scaleX}
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
                    onMouseOver={(e) => {
                      !isSelected && handleAnchorMouseOver(e, anchorPos);
                    }}
                    onMouseOut={() => {
                      setIsMouseOver(false);
                    }}
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
                width={10000}
                height={10000}
                isMultiple={false}
                setPolygons={(polygon) => {
                  console.log(polygon);
                  if (!polygon[0]) return;
                  let newShape = [];
                  polygon[0]?.points.forEach((point) => {
                    newShape.push({ x: point.x / scaleX, y: point.y / scaleY });
                  });
                  setShape([...newShape]);
                  setIsMapping(false);
                }}
                polygons={undefined}
                scaleX={0.3}
                scaleY={0.3}
              />
            )}
          </Layer>
          {(isSelected || isMouseOver) && (
            <Layer key={`layer2`} x={tooltip?.x} y={tooltip?.y}>
              <Html>
                <Popup className="sb-pts-popup">
                  <PopupHeader
                    className="sb-pts-popup-hdr"
                    label={`Anchor Id:${
                      tooltip.object.a_id !== null ? tooltip.object.a_id : ""
                    }`}
                  >
                    {isSelected && tooltip.object.a_id === null && (
                      <PopupItem
                        type="select"
                        value={tooltip?.object.a_id}
                        options={anchorsIds}
                        onChange={(newId) => {
                          handleAnchorChange({
                            anchorId: tooltip.object.id,
                            property: "id",
                            value: newId,
                          });
                        }}
                      />
                    )}

                    {tooltip.object.active_yn ? (
                      <button
                        style={{
                          float: "right",
                          borderRadius: "50%",
                          backgroundColor: "green",
                          color: "white",
                        }}
                        onClick={() =>
                          deactivate({ a_id: tooltip.object.a_id })
                        }
                      >
                        -
                      </button>
                    ) : (
                      <button
                        style={{
                          float: "right",
                          borderRadius: "50%",
                          backgroundColor: "red",
                          color: "white",
                        }}
                        onClick={() => save([tooltip.object])}
                      >
                        +
                      </button>
                    )}
                  </PopupHeader>
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
