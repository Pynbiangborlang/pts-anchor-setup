import axios from "axios";
import React, { useEffect, useState } from "react";
import { Stage, Layer, Rect, Circle, Text, Group } from "react-konva";

const generateGrid = (cellSize, anchorPos) => {
  let radius = anchorPos.radius;
  let tempcells = [];

  for (let i = anchorPos.x - radius; i < anchorPos.x + radius; i += cellSize) {
    for (
      let j = anchorPos.y - radius;
      j < anchorPos.y + radius;
      j += cellSize
    ) {
      if (i === anchorPos.x) {
        if (j < anchorPos.y) {
          let distance = Math.floor(
            Math.sqrt(
              Math.pow(i - anchorPos.x, 2) + Math.pow(j - anchorPos.y, 2)
            )
          );
          if (distance <= radius) {
            tempcells.push({ x: i, y: j, distance: distance });
          }
        } else if (j >= anchorPos.y) {
          let distance = Math.floor(
            Math.sqrt(
              Math.pow(i - anchorPos.x, 2) +
                Math.pow(j + cellSize - anchorPos.y, 2)
            )
          );
          if (distance <= radius) {
            tempcells.push({ x: i, y: j, distance: distance });
          }
        }
      } else if (j === anchorPos.y) {
        if (i < anchorPos.x) {
          let distance = Math.floor(
            Math.sqrt(
              Math.pow(i - anchorPos.x, 2) + Math.pow(j - anchorPos.y, 2)
            )
          );
          if (distance <= radius) {
            tempcells.push({ x: i, y: j, distance: distance });
          }
        } else {
          let distance = Math.floor(
            Math.sqrt(
              Math.pow(i - anchorPos.x + cellSize, 2) +
                Math.pow(j - anchorPos.y, 2)
            )
          );
          if (distance <= radius) {
            tempcells.push({ x: i, y: j, distance: distance });
          }
        }
      } else if (i < anchorPos.x && j < anchorPos.y) {
        let distance = Math.floor(
          Math.sqrt(Math.pow(i - anchorPos.x, 2) + Math.pow(j - anchorPos.y, 2))
        );
        if (distance <= radius) {
          tempcells.push({ x: i, y: j, distance: distance });
        }
      } else if (i < anchorPos.x && j > anchorPos.y) {
        let distance = Math.floor(
          Math.sqrt(
            Math.pow(i - anchorPos.x, 2) +
              Math.pow(j + cellSize - anchorPos.y, 2)
          )
        );
        if (distance <= radius) {
          tempcells.push({ x: i, y: j, distance: distance });
        }
      } else if (i > anchorPos.x && j < anchorPos.y) {
        let distance = Math.floor(
          Math.sqrt(
            Math.pow(i + cellSize - anchorPos.x, 2) +
              Math.pow(j - anchorPos.y, 2)
          )
        );
        if (distance <= radius) {
          tempcells.push({ x: i, y: j, distance: distance });
        }
      } else {
        let distance = Math.floor(
          Math.sqrt(
            Math.pow(i + cellSize - anchorPos.x, 2) +
              Math.pow(j + cellSize - anchorPos.y, 2)
          )
        );
        if (distance <= radius) {
          tempcells.push({ x: i, y: j, distance: distance });
        }
      }
    }
  }

  return tempcells.sort((a, b) => a.distance - b.distance);
};

const generateLevels = ({ cellSize, anchorPos }) => {
  let arr = [];
  let x0 = anchorPos.x,
    y0 = anchorPos.y;
  let radius = anchorPos.radius;
  let x = x0 - cellSize,
    y = y0 - cellSize;
  let level = 0;

  console.log(`x0: ${x0} y0: ${y0}`);

  function interPolatePoints(point, anchorPos) {
    let x = point.x,
      y = point.y;
    let points = [];
    console.log(`x: ${x} y: ${y}`);

    //top
    for (let i = x; i < x + 2 * (x0 - x); i += cellSize) {
      //check if point lies in circle or not
      //if no increment x by cell size
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
      //check if point lies in circle or not
      //if no decrement x b cell size
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
      //check if point lies in circle or not
      // if no decrement x b cell size
      if (i > x0) {
        console.log("greater");
        console.log(
          "distance",
          Math.sqrt(
            Math.pow(x0 - i + cellSize, 2) + Math.pow(y0 - y + 2 * (y0 - y), 2)
          )
        );
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
        console.log("smaller");
        console.log(
          "distance",
          Math.sqrt(Math.pow(x0 - i, 2) + Math.pow(y0 - y + 2 * (y0 - y), 2)) +
            " " +
            checkIsPointInCircle(i, y + 2 * (y0 - y))
        );
        console.log(checkIsPointInCircle(i, y + 2 * (y0 - y)));
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
    console.log("check", Math.sqrt(Math.pow(a - x0, 2) + Math.pow(b - x0, 2)));
    return (
      Math.sqrt(Math.pow(a - x0, 2) + Math.pow(b - y0, 2)) <=
      Math.sqrt(Math.pow(radius, 2) + Math.pow(cellSize, 2))
    );
  }

  while (x0 - x <= radius && y0 - y <= radius) {
    arr[level] = interPolatePoints({ x: x, y: y }, anchorPos);
    x = x - cellSize;
    y = y - cellSize;
    level++;
  }

  console.log(arr);
  return arr;
};

const Grid = ({ cellSize, anchorPos }) => {
  const [cells, setCells] = useState([[{ x: NaN, y: NaN, distance: NaN }]]);
  const [isHover, setIsHover] = useState(false);

  useEffect(() => {
    setCells(generateLevels({ cellSize, anchorPos }));
  }, []);

  let k = 0;

  return (
    <>
      {cells.map((level, i) =>
        level.map((cell, j) => (
          <Group
            key={`group${i}${j}`}
            onMouseOver={(e) => {
              console.log(e);
              setIsHover(true);
            }}
            fill={isHover ? "black" : "transparent"}
            opacity={1}
            onMouseOut={(e) => {
              console.log(e);
              setIsHover(false);
            }}
          >
            <Rect
              key={`tile${k}`}
              x={cell.x}
              y={cell.y}
              width={cellSize}
              height={cellSize}
              stroke="black"
              strokeWidth={0.5}
              fill="yellow"
              opacity={0.3}
            />
            <Text key={`text${i}`} text={`${k++}`} x={cell.x} y={cell.y}></Text>
          </Group>
        ))
      )}
    </>
  );
};

const App = () => {
  const cellSize = 50;
  const anchorPos = [
    { x: 500, y: 300, radius: 300 },
    // { x: 600, y: 200, radius: 200 },
    // { x: 1000, y: 300, radius: 200 },
  ];
  return (
    <>
      <div>
        <Stage width={window.innerWidth} height={window.innerHeight}>
          <Layer>
            {anchorPos.map((anchorPos, i) => (
              <>
                <Circle
                  key={`radius${i}`}
                  x={anchorPos.x}
                  y={anchorPos.y}
                  radius={anchorPos.radius}
                  fill="red"
                  opacity={0.5}
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
