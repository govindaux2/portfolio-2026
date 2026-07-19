import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { prototypes } from '../data/work';

const MotionLink = motion.create(Link);
const MotionAnchor = motion.a;

export function Prototypes() {
  const reduce = useReducedMotion();

  return (
    <section id="prototypes">
      <div className="wrap">
        <div className="sec-head">
          <h2>Clickable prototypes</h2>
          <p>
            Real flows you can tap through. Open a project to explore the
            prototype and the thinking behind it.
          </p>
        </div>
        <div className="proto-grid">
          {prototypes.map((p, i) => {
            const className = p.feature ? 'proto-card feature' : 'proto-card';
            const motionProps = {
              className,
              initial: reduce ? false : ({ opacity: 0, y: 32 } as const),
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true, amount: 0.25 },
              transition: {
                duration: 0.7,
                delay: (i % 2) * 0.08,
                ease: [0.16, 1, 0.3, 1] as const,
              },
            };

            const body = (
              <>
                <div className="proto-media">
                  <img src={p.cover} alt={p.title} loading="lazy" />
                </div>
                <div className="proto-meta">
                  <h3>{p.title}</h3>
                  <span className="tags">{p.tags}</span>
                </div>
                <span className="proto-open" aria-hidden>
                  {p.internal ? '→' : '↗'}
                </span>
              </>
            );

            if (p.internal) {
              return (
                <MotionLink
                  key={p.slug}
                  to={`/prototypes/${p.slug}`}
                  {...motionProps}
                >
                  {body}
                </MotionLink>
              );
            }

            return (
              <MotionAnchor
                key={p.slug}
                href={p.href ?? '#'}
                target="_blank"
                rel="noreferrer"
                {...motionProps}
              >
                {body}
              </MotionAnchor>
            );
          })}
        </div>
      </div>
    </section>
  );
}
