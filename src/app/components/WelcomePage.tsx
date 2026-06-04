import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Plane } from 'lucide-react';

export function WelcomePage() {
  const navigate = useNavigate();
  const [showText, setShowText] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  const fullText = 'Safe Travel Monitor';

  useEffect(() => {
    const timer = setTimeout(() => setShowText(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showText) return;

    let index = 0;
    const typeInterval = setInterval(() => {
      if (index <= fullText.length) {
        setTypewriterText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(typeInterval);
      }
    }, 100);

    return () => clearInterval(typeInterval);
  }, [showText]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Stars background */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Globe */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="relative"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          {/* Globe circle - Earth colored */}
          <div className="w-64 h-64 rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 shadow-2xl relative overflow-hidden">
            {/* Continents (simplified) - Earth landmasses */}
            <div className="absolute inset-0">
              {/* North America */}
              <div className="absolute top-1/4 left-1/6 w-16 h-14 bg-green-700 rounded-bl-3xl opacity-90" />
              {/* Europe/Africa */}
              <div className="absolute top-1/3 left-1/2 w-12 h-20 bg-yellow-700 rounded-tr-2xl opacity-90" />
              {/* South America */}
              <div className="absolute top-2/3 left-1/4 w-10 h-12 bg-green-600 rounded-bl-2xl opacity-90" />
              {/* Asia */}
              <div className="absolute top-1/4 right-1/6 w-20 h-16 bg-amber-700 rounded-tl-3xl opacity-90" />
              {/* Australia */}
              <div className="absolute bottom-1/4 right-1/4 w-8 h-6 bg-orange-700 rounded-full opacity-90" />
              {/* More land details */}
              <div className="absolute top-1/2 left-1/3 w-6 h-8 bg-green-800 rounded-lg opacity-80" />
            </div>

            {/* Equator line (tarmac road) */}
            <div className="absolute top-1/2 left-0 right-0 h-2 -translate-y-1/2">
              <div className="w-full h-full bg-gray-900 relative">
                {/* White dashed road markings */}
                <motion.div
                  className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(to right, white 0px, white 15px, transparent 15px, transparent 25px)',
                  }}
                  animate={{
                    backgroundPosition: ['0px 0px', '25px 0px'],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </div>
            </div>

            {/* Globe shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-full" />
          </div>

          {/* Plane animation circling 3/4 of globe */}
          <motion.div
            className="absolute"
            initial={{ rotate: -135 }}
            animate={{ rotate: 135 }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              width: '100%',
              height: '100%',
              top: 0,
              left: 0,
            }}
          >
            <motion.div
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
              }}
            >
              <Plane className="w-8 h-8 text-white fill-white" style={{ transform: 'rotate(45deg)' }} />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Animated text */}
      {showText && (
        <motion.div
          className="absolute bottom-32 left-1/2 -translate-x-1/2 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Typewriter text */}
          <h1 className="font-bold text-white mb-8 min-h-[3rem]">
            {typewriterText}
            {typewriterText.length < fullText.length && (
              <motion.span
                className="inline-block w-0.5 h-8 bg-white ml-1"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            )}
          </h1>

          {typewriterText === fullText && (
            <>
              <motion.p
                className="text-white/90 mb-8 max-w-md mx-auto px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Keep your loved ones safe with real-time journey tracking and emergency alerts
              </motion.p>

              <motion.button
                onClick={() => navigate('/login')}
                className="px-8 py-3 bg-white text-blue-600 rounded-full font-semibold shadow-lg"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: 1,
                  scale: [0, 1.2, 0.9, 1.1, 1],
                }}
                transition={{
                  duration: 0.6,
                  times: [0, 0.4, 0.6, 0.8, 1],
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.span
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Get Started
                </motion.span>
              </motion.button>
            </>
          )}
        </motion.div>
      )}

      {/* Logo in corner */}
      <motion.div
        className="absolute top-8 left-8 flex items-center gap-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
          <Plane className="w-6 h-6 text-white" />
        </div>
        <span className="text-white font-bold">STM</span>
      </motion.div>
    </div>
  );
}
