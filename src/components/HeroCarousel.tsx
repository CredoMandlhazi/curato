import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import mdu1 from "@/assets/mdu-1.jpg";
import mdu2 from "@/assets/mdu-2.jpg";
import mdu3 from "@/assets/mdu-3.jpg";
import mdu4 from "@/assets/mdu-4.jpg";

const heroImages = [
  { src: mdu1, alt: "DJ performing live set" },
  { src: mdu2, alt: "Producer in the studio" },
  { src: mdu3, alt: "Musician with instrument" },
  { src: mdu4, alt: "FL Studio production" },
];

export const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % heroImages.length);
  };

  const getSlideIndex = (offset: number) => {
    return (currentIndex + offset + heroImages.length) % heroImages.length;
  };

  return (
    <div className="relative w-full h-full">
      <div className="relative h-[350px] md:h-[400px] lg:h-[450px] flex items-center justify-center overflow-hidden">
        <motion.div
          className="absolute left-0 w-1/5 opacity-40 blur-sm"
          style={{ zIndex: 1, aspectRatio: "1/1" }}
        >
          <img
            src={heroImages[getSlideIndex(-1)].src}
            alt={heroImages[getSlideIndex(-1)].alt}
            className="w-full h-full object-cover rounded-lg"
            style={{ aspectRatio: "1/1" }}
          />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
            style={{ 
              width: "min(350px, 70vw)",
              height: "min(350px, 70vw)",
            }}
          >
            <img
              src={heroImages[currentIndex].src}
              alt={heroImages[currentIndex].alt}
              className="w-full h-full object-cover rounded-2xl shadow-2xl"
              style={{ aspectRatio: "1/1" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent rounded-2xl" />
          </motion.div>
        </AnimatePresence>

        <motion.div
          className="absolute right-0 w-1/5 opacity-40 blur-sm"
          style={{ zIndex: 1, aspectRatio: "1/1" }}
        >
          <img
            src={heroImages[getSlideIndex(1)].src}
            alt={heroImages[getSlideIndex(1)].alt}
            className="w-full h-full object-cover rounded-lg"
            style={{ aspectRatio: "1/1" }}
          />
        </motion.div>
      </div>

      <div className="absolute inset-y-0 left-4 flex items-center z-20">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={goToPrev}
          className="p-3 bg-background/80 backdrop-blur-sm rounded-full border border-border hover:bg-card transition-colors"
        >
          <ChevronLeft size={24} />
        </motion.button>
      </div>
      <div className="absolute inset-y-0 right-4 flex items-center z-20">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={goToNext}
          className="p-3 bg-background/80 backdrop-blur-sm rounded-full border border-border hover:bg-card transition-colors"
        >
          <ChevronRight size={24} />
        </motion.button>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsAutoPlaying(false);
              setCurrentIndex(index);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-foreground w-6' : 'bg-foreground/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
