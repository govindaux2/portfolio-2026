import { Suspense, lazy } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { threeSpecs } from '../data/work';

const ThreeStage = lazy(() => import('./gl/ThreeStage'));

export function ThreeWork() {
  const reduce = useReducedMotion();

  return (
    <section id="three">
      <div className="wrap three-split">
        <motion.div
          className="three-copy"
          initial={reduce ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2>3D in production</h2>
          <p>
            Real-time scenes shipped inside apps and websites. Drag over the
            stage, it responds.
          </p>
          <ul>
            {threeSpecs.map((s) => (
              <li key={s.label}>
                <span>{s.label}</span>
                <span>{s.value}</span>
              </li>
            ))}
          </ul>
        </motion.div>
        <Suspense fallback={<div className="three-stage" />}>
          <ThreeStage />
        </Suspense>
      </div>
    </section>
  );
}
