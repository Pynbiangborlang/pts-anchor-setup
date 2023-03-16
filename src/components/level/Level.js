import React, { useEffect, useMemo, useState } from "react";
import Konva from "konva";
import { Stage, Layer, Line, Circle, Image } from "react-konva";
import floorPlan from "../../assets/PTS_Floor-Plan.png";
import useImage from "use-image";
import token from "../../assets/token.svg";
import axios from "axios";

const URLImage = ({ x = 0, y = 0, image }) => {
  const [img] = useImage(image.url);
  return (
    <Image x={x} y={y} image={img} width={image.width} height={image.height} />
  );
};

const Level = () => {
  const [anchors, setAnchors] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [scaleX, setScaleX] = useState(0.3);
  const [scaleY, setScaleY] = useState(0.3);

  const updateTokens = ({ tokenId, a_id, cell_index }) => {};

  const data = useMemo(() => {
    setAnchors((currentAnchors) => {
      let i = 0;
      let count = 0;

      while (i < tokens.length) {
        count = 0;
        for (let j = 0; j < currentAnchors.length; j++) {
          if (tokens[i].anchorId === currentAnchors[j].a_id) {
            let locations = currentAnchors[j].locations;

            for (let k = 1; k < locations.length; k++) {
              let m = 0;
              while (m < locations[k].length) {
                if (locations[k][m].tokenId === "") {
                  locations[k][m].tokenId = tokens[i].tokenId;
                  count++;
                  i++;
                  break;
                }
                m += 2;
              }
              if (count !== 0) {
                break;
              }
            }
          }
          if (count !== 0) {
            break;
          }
        }
        if (count === 0) {
          i++;
        }
        if (i === tokens.length) break;
      }
      return [...currentAnchors];
    });
    return [...anchors];
  }, [tokens]);
  useEffect(() => {
    axios.get("http://localhost:9000/api/1/anchors?Active_YN=Y").then((res) => {
      setAnchors([...res.data]);
    });
    axios.get("http://localhost:9000/api/tokens").then((res) => {
      setTokens([...res.data]);
    });
  }, []);

  return (
    <>
      <Stage
        scaleX={scaleX}
        scaleY={scaleY}
        width={5000}
        height={5000}
        draggable
      >
        <Layer>
          <URLImage
            image={{
              url: floorPlan,
              width: 3840,
              height: 2917,
            }}
          />
          {anchors[0] &&
            anchors.map((anchor, i) => (
              <Circle
                key={i}
                x={anchor.x}
                y={anchor.y}
                radius={10 / scaleX}
                fill="red"
              />
            ))}
          {anchors[0] &&
            anchors.map((anchor, i) => (
              <Line
                key={`zone-${i}`}
                points={anchor.shape.flatMap((point) => [point.x, point.y])}
                stroke="green"
                strokeWidth={10}
                lineCap="round"
                lineJoin="round"
              />
            ))}
          {anchors[0] &&
            anchors.map((anchor) =>
              anchor.locations.map((level) =>
                level.map(
                  (point) =>
                    point.tokenId !== "" && (
                      <URLImage
                        x={point.x}
                        y={point.y}
                        image={{
                          url: token,
                          width: 10 / scaleX,
                          height: 10 / scaleX,
                        }}
                      />
                    )
                )
              )
            )}
        </Layer>
      </Stage>
    </>
  );
};

export default Level;
