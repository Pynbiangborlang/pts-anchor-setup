import axios from "axios";
import React, { useEffect, useState } from "react";
import { Stage, Layer, Rect, Circle, Text, Group } from "react-konva";

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
            x: i,
            y: y,
            distance: Math.sqrt(Math.pow(x0 - i, 2) + Math.pow(y0 - y, 2)),
          });
        }
      } else {
        if (checkIsPointInCircle(cellSize + i, y)) {
          points.push({
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
            x: x,
            y: i,
            distance: Math.sqrt(Math.pow(x0 - x, 2) + Math.pow(y0 - i, 2)),
          });
        }
      } else {
        if (checkIsPointInCircle(x, i + cellSize)) {
          points.push({
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

  console.log(arr);
  return arr;
};

const Grid = ({ cellSize, anchorPos }) => {
  const [cells, setCells] = useState([[{}]]);
  let k = 0;
  useEffect(() => {
    setCells(generateLevels({ cellSize, anchorPos }));
  }, []);

  return (
    <>
      {cells.map((level, i) => {
        return (
          <Group
            key={`${anchorPos.id}_level${i}`}
            onMouseOver={(e) => {
              console.log(e);
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
              <>
                <Rect
                  key={`${anchorPos.id}_${i}_tile${j}_${cell.x}_${cell.y}`}
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
                  key={`${anchorPos.id}_${i}_text${cell.x}_${cell.y}`}
                  text={`${k++}`}
                  x={cell.x}
                  y={cell.y}
                ></Text>
              </>
            ))}
          </Group>
        );
      })}
    </>
  );
};

const App = () => {
  const cellSize = 30;
  const anchorPos = [
    { id: 1, x: 700, y: 400, radius: 210 },
    { id: 2, x: 300, y: 210, radius: 210 },
    { id: 3, x: 1200, y: 200, radius: 210 },
  ];
  return (
    <>
      <div style={{ cursor: "grab" }}>
        <Stage width={window.innerWidth} height={window.innerHeight} draggable>
          <Layer>
            {anchorPos.map((anchorPos, i) => (
              <>
                <Circle
                  key={`radius${i}`}
                  x={anchorPos.x}
                  y={anchorPos.y}
                  radius={anchorPos.radius}
                  fill="blue"
                  opacity={0.1}
                />
                <Circle
                  key={`anchor${i}`}
                  x={anchorPos.x}
                  y={anchorPos.y}
                  radius={10}
                  fill="red"
                  opacity={1}
                />
              </>
            ))}
            {anchorPos.map((anchorPos) => (
              <Grid cellSize={cellSize} anchorPos={anchorPos} />
            ))}
          </Layer>
        </Stage>
      </div>
    </>
  );
};

export default App;
