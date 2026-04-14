import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import curatoLogo from "@/assets/curato-logo-new.png";

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 600);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "hsl(0 0% 2%)" }}
        >
          {/* Ambient background glow */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 300,
              height: 300,
              background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Floating particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: i % 3 === 0 ? 4 : 2,
                height: i % 3 === 0 ? 4 : 2,
                background: "rgba(255,255,255,0.4)",
              }}
              initial={{
                x: (i - 4) * 30,
                y: 40,
                opacity: 0,
                scale: 0,
              }}
              animate={{
                y: [40, -20 - i * 8, -60],
                opacity: [0, 0.6, 0],
                scale: [0, 1, 0.5],
              }}
              transition={{
                duration: 2,
                delay: 0.8 + i * 0.12,
                ease: "easeOut",
                repeat: Infinity,
                repeatDelay: 1,
              }}
            />
          ))}

          {/* Logo container with reveal */}
          <div className="relative flex flex-col items-center">
            {/* Logo image with stroke-draw reveal effect */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 1.2,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            >
              {/* Clip mask reveal - simulates drawing from top to bottom */}
              <motion.div
                className="overflow-hidden"
                initial={{ height: 0 }}
                animate={{ height: 120 }}
                transition={{
                  duration: 1.4,
                  ease: [0.4, 0, 0.2, 1],
                  delay: 0.3,
                }}
              >
                <img
                  src={curatoLogo}
                  alt="Curato"
                  className="w-[120px] h-[120px] object-contain object-top"
                  style={{
                    filter: "drop-shadow(0 0 20px rgba(255,255,255,0.1))",
                  }}
                />
              </motion.div>

              {/* Shimmer sweep across logo */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
                }}
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{
                  duration: 1,
                  delay: 1.6,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              />
            </motion.div>

            {/* "Curato" text reveal */}
            <motion.h1
              className="mt-4 text-2xl md:text-3xl font-bold tracking-[0.15em] uppercase"
              style={{
                color: "hsl(0 0% 90%)",
                fontFamily: "'Tektur', sans-serif",
              }}
              initial={{
                opacity: 0,
                y: 16,
                filter: "blur(8px)",
              }}
              animate={{
                opacity: 1,
                y: [16, -2, 0],
                filter: "blur(0px)",
              }}
              transition={{
                duration: 0.8,
                delay: 1.5,
                ease: [0.25, 0.1, 0.25, 1],
                y: {
                  duration: 0.6,
                  delay: 1.5,
                  ease: [0.34, 1.56, 0.64, 1], // micro-bounce
                },
              }}
            >
              Curato
            </motion.h1>

            {/* Reflection / ambient glow beneath */}
            <motion.div
              className="mt-6"
              style={{
                width: 140,
                height: 2,
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                borderRadius: 999,
              }}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{
                opacity: [0, 0.6, 0.3],
                scaleX: [0, 1, 0.8],
              }}
              transition={{
                duration: 1,
                delay: 2,
                ease: "easeOut",
              }}
            />

            {/* Subtle reflection of logo below */}
            <motion.div
              className="mt-2 overflow-hidden"
              style={{
                height: 30,
                opacity: 0.08,
                transform: "scaleY(-1)",
                filter: "blur(4px)",
                maskImage: "linear-gradient(to bottom, white, transparent)",
                WebkitMaskImage: "linear-gradient(to bottom, white, transparent)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.08 }}
              transition={{ delay: 1.8, duration: 0.6 }}
            >
              <img
                src={curatoLogo}
                alt=""
                className="w-[120px] h-[120px] object-contain object-top mx-auto"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
