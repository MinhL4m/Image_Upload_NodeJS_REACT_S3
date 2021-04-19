import React from "react";
import ImageGallery from '@ncpa0cpl/react-image-gallery-for-react-17';
import "@ncpa0cpl/react-image-gallery-for-react-17/styles/css/image-gallery.css";

function Gallery({ images }) {
  return <ImageGallery items={images} />;
}

export default Gallery;