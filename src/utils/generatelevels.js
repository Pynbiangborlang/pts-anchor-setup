import { isInsideShape } from "./isInside";
const generateLevels = ({ cellSize, anchorPos, shape, anchorRange }) => {
  let arr = [];
  let x0 = anchorPos.x,
    y0 = anchorPos.y;
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
          isInsideShape(shape, { x: i, y: y })
        ) {
          points.push({
            cellIndex: cellIndex++,
            tokenId: "",
            x: i,
            y: y,
            distance: Math.sqrt(Math.pow(x0 - i, 2) + Math.pow(y0 - y, 2)),
          });
        }
      } else {
        if (
          checkIsPointInCircle(cellSize + i, y) &&
          isInsideShape(shape, {
            x: cellSize + i,
            y: y,
          })
        ) {
          points.push({
            cellIndex: cellIndex++,
            tokenId: "",
            x: i,
            y: y,
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
            x: x + 2 * (x0 - x),
            y: i,
          })
        ) {
          points.push({
            cellIndex: cellIndex++,
            tokenId: "",
            x: x + 2 * (x0 - x) - cellSize,
            y: i,
            distance: Math.sqrt(
              Math.pow(x0 - (x + cellSize), 2) + Math.pow(y0 - i, 2)
            ),
          });
        }
      } else {
        if (
          checkIsPointInCircle(x + 2 * (x0 - x), i + cellSize) &&
          isInsideShape(shape, {
            x: x + 2 * (x0 - x),
            y: i + cellSize,
          })
        ) {
          points.push({
            cellIndex: cellIndex++,
            tokenId: "",
            x: x + 2 * (x0 - x) - cellSize,
            y: i,
            distance: Math.sqrt(
              Math.pow(x0 - x, 2) + Math.pow(y0 - (i + cellSize), 2)
            ),
          });
        }
      }
    }

    ///bottom
    for (let i = x + 2 * (x0 - x) - cellSize; i >= x; i -= cellSize) {
      if (i > x0) {
        if (
          checkIsPointInCircle(i + cellSize, y + 2 * (y0 - y)) &&
          isInsideShape(shape, {
            x: i + cellSize,
            y: y + 2 * (y0 - y),
          })
        ) {
          points.push({
            cellIndex: cellIndex++,
            tokenId: "",
            x: i,
            y: y + 2 * (y0 - y) - cellSize,
            distance: Math.sqrt(
              Math.pow(x0 - i + cellSize, 2) + Math.pow(y0 - y, 2)
            ),
          });
        }
      } else {
        if (
          checkIsPointInCircle(i, y + 2 * (y0 - y)) &&
          isInsideShape(shape, {
            x: i,
            y: y + 2 * (y0 - y),
          })
        ) {
          points.push({
            cellIndex: cellIndex++,
            tokenId: "",
            x: i,
            y: y + 2 * (y0 - y) - cellSize,
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
          isInsideShape(shape, { x: x, y: i })
        ) {
          points.push({
            cellIndex: cellIndex++,
            tokenId: "",
            x: x,
            y: i,
            distance: Math.sqrt(Math.pow(x0 - x, 2) + Math.pow(y0 - i, 2)),
          });
        }
      } else {
        if (
          checkIsPointInCircle(x, i + cellSize) &&
          isInsideShape(shape, {
            x: x,
            y: i + cellSize,
          })
        ) {
          points.push({
            cellIndex: cellIndex++,
            tokenId: "",
            x: x,
            y: i,
            distance: Math.sqrt(
              Math.pow(x0 - x, 2) + Math.pow(y0 - (i + cellSize), 2)
            ),
          });
        }
      }
    }
    console.log(points, `level ${level}`);
    return points.sort((a, b) => a.distance - b.distance);
  }

  function checkIsPointInCircle(a, b) {
    return (
      Math.sqrt(Math.pow(a - x0, 2) + Math.pow(b - y0, 2)) <=
      Math.sqrt(Math.pow(radius, 2) + Math.pow(cellSize, 2))
    );
  }

  while (x0 - x <= radius && y0 - y <= radius) {
    let newLevels = interPolatePoints({ x: x, y: y });
    if (!newLevels[0]) {
      break;
    }
    arr[level] = newLevels;
    x = x - cellSize;
    y = y - cellSize;
    level++;
  }
  console.log(arr);
  return arr;
};

export { generateLevels };
