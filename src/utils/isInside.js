const INF = 10000;

const onSegment = (p, q, r) => {
  if (
    q.x <= Math.max(p.x, r.x) &&
    q.x >= Math.min(p.x, r.x) &&
    q.y <= Math.max(p.y, r.y) &&
    q.y >= Math.min(p.y, r.y)
  ) {
    return true;
  }
  return false;
};

const orientation = (p, q, r) => {
  let val = (q.y - p.y) * (r.x - p.x) - (r.y - p.y) * (q.x - p.x);
  if (val === 0) {
    return 0;
  }
  return val > 0 ? 1 : 2;
};
const doIntersect = (p1, q1, p2, q2) => {
  let o1 = orientation(p1, q1, p2);
  let o2 = orientation(p1, q1, q2);
  let o3 = orientation(p1, p2, q2);
  let o4 = orientation(q1, p2, q2);

  if (o1 !== o2 && o3 !== o4) {
    return true;
  }

  // Special Cases
  // p1, q1 and p2 are collinear and
  // p2 lies on segment p1q1

  if (o1 == 0 && onSegment(p1, p2, q1)) {
    return true;
  }

  // p1, q1 and p2 are collinear and
  // q2 lies on segment p1q1

  if (o2 == 0 && onSegment(p1, q2, q1)) {
    return true;
  }

  // p2, q2 and p1 are collinear and
  // p1 lies on segment p2q2

  if (o3 == 0 && onSegment(p2, p1, q2)) {
    return true;
  }

  // p2, q2 and q1 are collinear and
  // q1 lies on segment p2q2

  if (o4 == 0 && onSegment(p2, q1, q2)) {
    return true;
  }

  // Doesn't fall in any of the above cases
  return false;
};

const isInsideShape = (polygon, point) => {
  if (polygon.length < 3) {
    return false;
  }

  const extreme = { x: INF, y: point.y };

  let count = 0,
    i = 0;

  do {
    let next = (i + 1) % polygon.length;

    if (doIntersect(polygon[i], polygon[next], point, extreme)) {
      // If the point 'p' is collinear with line
      // segment 'i-next', then check if it lies
      // on segment. If it lies, return true, otherwise false
      if (orientation(polygon[i], point, polygon[next]) == 0) {
        return onSegment(polygon[i], point, polygon[next]);
      }

      count++;
    }
    i = next;
  } while (i !== 0);
  return count % 2 === 1;
};

export { isInsideShape };
