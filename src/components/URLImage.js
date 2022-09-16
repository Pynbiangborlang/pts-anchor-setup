import React from "react";
import { Image } from "react-konva";
import useImage from "use-image";

const URLImage = ({ image }) => {
  const [img] = useImage(image.url);
  return <Image image={img} width={image.width} height={image.height} />;
};

export default URLImage;
