import { motion } from 'framer-motion'

interface PageTransitionProps {
  children: React.ReactNode
}

const pageVariants = {
  initial: { opacity: 0, y: 18, scale: 0.995 },
  in: { opacity: 1, y: 0, scale: 1 },
  out: { opacity: 0, y: -10, scale: 0.995 },
}

const pageTransition = {
  duration: 0.24,
  ease: [0.22, 1, 0.36, 1] as const,
}

export default function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="w-full min-h-screen"
    >
      {children}
    </motion.div>
  )
}
