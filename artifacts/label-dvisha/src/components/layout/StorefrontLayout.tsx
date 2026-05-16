import { motion, useReducedMotion } from "framer-motion";
import { useLocation } from "wouter";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface StorefrontLayoutProps {
  children: React.ReactNode;
}

export function StorefrontLayout({ children }: StorefrontLayoutProps) {
  const [location] = useLocation();
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <motion.main
        key={location}
        className="flex-1"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.45,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
}
