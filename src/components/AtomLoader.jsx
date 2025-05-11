import { motion } from 'framer-motion'

const AtomLoader = () => {
  const orbitCount = 3
  const particlesPerOrbit = 4
  
  // Create an array for orbits
  const orbits = [...Array(orbitCount)].map((_, index) => {
    return {
      id: index,
      size: (index + 1) * 30,
      animationDelay: index * 0.5,
      rotateY: 30 * (index % 3),
      rotateX: 60 * (index % 2)
    }
  })
  
  // Create particles for each orbit
  const createParticles = (orbitId, size) => {
    return [...Array(particlesPerOrbit)].map((_, index) => {
      const angle = (360 / particlesPerOrbit) * index
      const delay = index * 0.2 + orbitId * 0.3
      
      return {
        id: `${orbitId}-${index}`,
        angle,
        delay
      }
    })
  }

  return (
    <motion.div 
      className="relative w-40 h-40 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Nucleus */}
      <motion.div 
        className="absolute w-6 h-6 bg-primary-500 rounded-full z-10"
        animate={{ 
          scale: [1, 1.2, 1],
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Orbits */}
      {orbits.map((orbit) => (
        <motion.div 
          key={orbit.id}
          className="absolute rounded-full border border-gray-200/30"
          style={{ 
            width: orbit.size * 2, 
            height: orbit.size * 2,
          }}
          animate={{ 
            rotateY: [orbit.rotateY, orbit.rotateY + 360],
            rotateX: [orbit.rotateX, orbit.rotateX + 360],
          }}
          transition={{ 
            duration: 8 - orbit.id,
            repeat: Infinity,
            ease: "linear",
            delay: orbit.animationDelay
          }}
        >
          {/* Particles */}
          {createParticles(orbit.id, orbit.size).map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-3 h-3 bg-secondary-400 rounded-full"
              style={{
                left: "calc(50% - 6px)",
                top: "calc(50% - 6px)",
                transformOrigin: "center"
              }}
              animate={{ 
                rotate: [particle.angle, particle.angle + 360],
              }}
              transition={{ 
                duration: 5 - orbit.id * 0.8,
                repeat: Infinity,
                ease: "linear",
                delay: particle.delay
              }}
            >
              <motion.div 
                className="w-full h-full rounded-full"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: particle.delay * 0.5
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      ))}
    </motion.div>
  )
}

export default AtomLoader 