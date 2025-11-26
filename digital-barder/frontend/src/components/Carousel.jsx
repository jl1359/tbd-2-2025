// components/Carousel.jsx
import React, { useState, useEffect } from "react";

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = [
    "/images/aurela.png",
    "/images/publicit.png", 
    "/images/aurella.png",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl shadow-2xl">
      {/* Slides */}
      <div
        className="flex h-full transition-transform duration-500"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={index} className="w-full h-full flex-shrink-0">
            <img
              src={image}
              alt={`slide-${index}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Puntitos de navegación */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full ${
              currentIndex === index 
                ? 'bg-[#034828]'  // Verde oscuro cuando está activo
                : 'bg-white/70'   // Blanco semitransparente cuando no está activo
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;