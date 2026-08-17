import { type ComponentProps } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import './glass-waitlist.css';

type GlassWaitlistButtonProps = Omit<
  ComponentProps<typeof motion.button>,
  'children' | 'whileHover' | 'whileTap' | 'transition'
> & {
  label?: string;
};

export function GlassWaitlistButton({
  label = 'Join Waitlist',
  className,
  ...props
}: GlassWaitlistButtonProps) {
  const reduce = useReducedMotion();

  return (
    <motion.button
      type="button"
      className={['gwb', className].filter(Boolean).join(' ')}
      whileHover={reduce ? undefined : { y: -1 }}
      whileTap={reduce ? undefined : { scale: 0.985, y: 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      {...props}
    >
      <span className="gwb-label">{label}</span>
    </motion.button>
  );
}
