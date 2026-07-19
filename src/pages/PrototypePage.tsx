import { Link, Navigate, useParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { useLottie } from 'lottie-react';
import { Nav } from '../components/Nav';
import { Footer } from '../components/Footer';
import { getPrototype } from '../data/work';
import allScreensLottie from '../../lottie/All-screens.json';

function CoverLottie({ label, reduce }: { label: string; reduce: boolean | null }) {
  const { View } = useLottie({
    animationData: allScreensLottie,
    loop: true,
    autoplay: !reduce,
    rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
  });

  return (
    <div className="project-cover-lottie" role="img" aria-label={label}>
      {View}
    </div>
  );
}

export function PrototypePage() {
  const { slug } = useParams<{ slug: string }>();
  const project = slug ? getPrototype(slug) : undefined;
  const reduce = useReducedMotion();

  if (!project || !project.internal) {
    return <Navigate to="/#prototypes" replace />;
  }

  return (
    <>
      <Nav variant="inner" />
      <main className="project-page">
        <div className="wrap">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link to="/#prototypes" className="project-back">
              ← Prototypes
            </Link>
          </motion.div>

          <motion.header
            className="project-hero"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="project-eyebrow">{project.tags}</p>
            <h1>{project.title}</h1>
            {project.summary ? (
              <p className="project-summary">{project.summary}</p>
            ) : null}
            <dl className="project-meta">
              {project.role ? (
                <div>
                  <dt>Role</dt>
                  <dd>{project.role}</dd>
                </div>
              ) : null}
              {project.year ? (
                <div>
                  <dt>Year</dt>
                  <dd>{project.year}</dd>
                </div>
              ) : null}
              {project.platform ? (
                <div>
                  <dt>Platform</dt>
                  <dd>{project.platform}</dd>
                </div>
              ) : null}
            </dl>
          </motion.header>
        </div>

        <motion.div
          className="project-cover"
          initial={reduce ? false : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        >
          <CoverLottie
            label={`${project.title} screen flow`}
            reduce={reduce}
          />
        </motion.div>

        <div className="wrap project-body">
          {project.highlights?.length ? (
            <section className="project-highlights">
              <h2>What you can try</h2>
              <ol>
                {project.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </section>
          ) : null}

          <section className="project-proto">
            <div className="project-proto-copy">
              <h2>Clickable prototype</h2>
              <p>
                Tap through the live iOS flow. Balances, transfers, and spend
                review — designed to feel like the finished app.
              </p>
              {project.href && project.href !== '#' ? (
                <a
                  className="hero-cta"
                  href={project.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open live prototype ↗
                </a>
              ) : (
                <p className="project-proto-note">
                  Live link coming soon — screens below show the core path.
                </p>
              )}
            </div>

            <div className="project-phone" aria-hidden>
              <div className="project-phone-bezel">
                <div className="project-phone-notch" />
                <div className="project-phone-screen">
                  <div className="ll-status">
                    <span>9:41</span>
                    <span className="ll-status-dots" />
                  </div>
                  <div className="ll-home">
                    <p className="ll-greeting">Good evening</p>
                    <h3 className="ll-balance-label">Total balance</h3>
                    <p className="ll-balance">$12,480.20</p>
                    <div className="ll-actions">
                      <button type="button">Send</button>
                      <button type="button">Request</button>
                      <button type="button">More</button>
                    </div>
                    <div className="ll-card">
                      <span>Spending this week</span>
                      <strong>−$248.60</strong>
                    </div>
                    <div className="ll-row">
                      <span>Everyday</span>
                      <span>$3,210.00</span>
                    </div>
                    <div className="ll-row">
                      <span>Savings</span>
                      <span>$9,270.20</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="project-next">
            <Link to="/#prototypes" className="project-back">
              ← Back to all prototypes
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
