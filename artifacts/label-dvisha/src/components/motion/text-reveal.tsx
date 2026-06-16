import { motion, useReducedMotion } from "framer-motion";
import { motionEase } from "./reveal";

type TextRevealProps = {
  text: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "p" | "span";
};

/** Word-by-word editorial text reveal. */
export function TextReveal({ text, className, delay = 0, as = "span" }: TextRevealProps) {
  const reduceMotion = useReducedMotion();
  const words = text.split(" ");
  const Tag = as;

  if (reduceMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.75,
              delay: delay + i * 0.06,
              ease: motionEase,
            }}
          >
            {word}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
