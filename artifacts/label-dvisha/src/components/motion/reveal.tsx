import { motion, useReducedMotion, type HTMLMotionProps, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const motionEase = [0.22, 1, 0.36, 1] as const;

export const revealItemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: motionEase },
  },
};

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.8, ease: motionEase },
  },
};

type RevealProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children?: ReactNode;
  y?: number;
  delay?: number;
  /** Larger negative margin = earlier trigger */
  viewMargin?: string;
};

/** Fade + slide in when the block enters the viewport (once). */
export function Reveal({
  children,
  className,
  y = 18,
  delay = 0,
  viewMargin = "-56px 0px -40px 0px",
  ...rest
}: RevealProps) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: viewMargin }}
      transition={{ duration: 0.55, delay, ease: motionEase }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

type RevealStaggerProps = {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
};

/** Parent for a grid/list; children should use `variants={revealItemVariants}`. */
export function RevealStagger({ children, className, stagger = 0.07, delayChildren = 0.06 }: RevealStaggerProps) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.12, margin: "-40px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren } },
      }}
    >
      {children}
    </motion.div>
  );
}
