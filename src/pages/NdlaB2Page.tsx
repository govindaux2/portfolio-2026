import { useEffect, useState } from 'react';
import { useLottie } from 'lottie-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Nav } from '../components/Nav';
import { Footer } from '../components/Footer';
import './ndla-b2.css';

const img = {
  hero: 'https://framerusercontent.com/images/Nnf7FO4FcIUMkNpjA2tgAb9vxIQ.png',
  mary: 'https://framerusercontent.com/images/o5KP41BnbuuvBXan1Qj45WxI.png',
  bank: 'https://framerusercontent.com/images/g6uIJWXcWyASfWvcHHbfUMkSnI.png',
  happyPath: 'https://framerusercontent.com/images/7NdtAGE5qVQpP0nVeXoGtQj8tU.png',
  caption: 'https://framerusercontent.com/images/BZCDg228iANetinWd3c3juHJlo.png',
  journey: 'https://framerusercontent.com/images/rdLN3DhulnDQGiTCzFhWDAwYec.svg',
  outcome: 'https://framerusercontent.com/images/9aG3cT2B7S0zcNKaTOELf5Rs8.jpg',
};

const lottie = {
  approach: 'https://framerusercontent.com/assets/Js3v9qGWfsxmWjF2qJ47sjnnkw.json',
  refurbished: 'https://framerusercontent.com/assets/XEXKQJfDsxR56NuDwEgHvPIok.json',
  iter1: 'https://framerusercontent.com/assets/SdRFeD4LD42Db1ArnVJJkDtyGs8.json',
  iter2: 'https://framerusercontent.com/assets/TJmSFPOXkwgUfTtfWYmGEjhMHL8.json',
  express: 'https://framerusercontent.com/assets/DGVEpYweBlOjn7ivyIyc5EMDwrg.json',
};

const steps = [
  ['Step 1', 'Researched users and data to identify key friction points in the lending flow'],
  ['Step 2', 'Synthesized insights into clear problem statements, user journeys, and opportunity areas'],
  ['Step 3', 'Aligned with PMs, stakeholders, developers, and legal teams on requirements'],
  ['Step 4', 'Designed and tested solutions through internal testing and feedback loops'],
  ['Step 5', 'Delivered high-fidelity designs with detailed specs, supported developer handoff, and ensured quality through QA reviews'],
  ['Step 6', 'Delivered high-fidelity designs with detailed specs, supported developer handoff, and ensured quality through QA reviews'],
];

const insights = [
  {
    title: 'Users prioritize speed over exploration',
    body: 'Most small business owners come with a clear goal—getting funds quickly. They move linearly through the flow with minimal tolerance for delays or distractions.',
  },
  {
    title: 'Trust is fragile and easily impacted by friction',
    body: 'Any ambiguity—whether in data usage, approvals, unfamiliar terminology or legal terms—reduces confidence, especially in high-stakes financial interactions.',
  },
  {
    title: 'Uncertainty increases anxiety and drop-offs',
    body: 'Lack of clarity around timelines, form-heavy flows and unclear steps creates stress, especially when users are making time-sensitive financial decisions.',
  },
];

const findings = [
  '72.4% (19.54K) users opted for amounts less than $50K and going through long process',
  '68.18% (18.4K) applications in one quarter underwent manual processing',
  '8.3% (2.2K) applications were kept on hold since the customers had frozen their credit score',
  'Avg time taken for completing the application is 10 mins',
];

const VIEWS = [
  { id: 'desktop', label: 'Desktop', width: 1200 },
  { id: 'tablet', label: 'Tablet', width: 810 },
  { id: 'phone-land', label: 'Phone landscape', width: 740 },
  { id: 'phone', label: 'Phone', width: 390 },
] as const;

type ViewId = (typeof VIEWS)[number]['id'];

function FramerLottie({ src, label }: { src: string; label: string }) {
  const [data, setData] = useState<object | null>(null);

  useEffect(() => {
    let live = true;
    fetch(src)
      .then((r) => r.json())
      .then((json: object) => {
        if (live) setData(json);
      })
      .catch(() => {
        if (live) setData(null);
      });
    return () => {
      live = false;
    };
  }, [src]);

  if (!data) return <div className="ndla-b2-lottie" aria-hidden />;
  return <FramerLottieView data={data} label={label} />;
}

function FramerLottieView({ data, label }: { data: object; label: string }) {
  const { View } = useLottie({
    animationData: data,
    loop: true,
    autoplay: true,
  });

  return (
    <div className="ndla-b2-lottie" role="img" aria-label={label}>
      {View}
    </div>
  );
}

export function NdlaB2Page() {
  const [params, setParams] = useSearchParams();
  const viewParam = params.get('view');
  const view: ViewId =
    viewParam === 'tablet' || viewParam === 'phone' || viewParam === 'phone-land'
      ? viewParam
      : 'desktop';
  const preview = VIEWS.find((v) => v.id === view) ?? VIEWS[0];

  const setView = (next: ViewId) => {
    const nextParams = new URLSearchParams(params);
    if (next === 'desktop') nextParams.delete('view');
    else nextParams.set('view', next);
    setParams(nextParams, { replace: true });
  };

  return (
    <div className="ndla-b2">
      <Nav variant="inner" />
      <div
        className="ndla-b2-scale"
        data-view={view}
        style={view === 'desktop' ? undefined : { width: preview.width }}
      >
        <article className="ndla-b2-doc">
          <p className="ndla-b2-kicker">
            <Link to="/work/ndla">← NDLA</Link>
            <span>NDLA B2 · from Framer</span>
          </p>
          <div className="ndla-b2-views" role="group" aria-label="Canvas size">
            {VIEWS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                aria-pressed={view === opt.id}
                className={view === opt.id ? 'is-on' : undefined}
                onClick={() => setView(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <header className="ndla-b2-hero">
            <img src={img.hero} alt="Small business owner at a bakery, with a bank in the background" />
            <h1>Speeding Up Financing for Small Businesses</h1>
          </header>

          <section>
            <h2>Project summary</h2>
            <p>
              Small business owners face delays of 2–7 days in accessing credit
              due to manual reviews and often need quick access to credit to
              seize growth opportunities—but traditional lending processes are
              slow, complex, and heavily dependent on manual reviews.
            </p>
            <p>
              <strong>Goal:</strong> Streamline the application flow, reduce
              delays caused by compliance and manual underwriting, and improve
              transparency for users throughout the process.
            </p>
            <p>
              <strong>Context:</strong> This work was part of the New Digital
              Lending Application (NDLA) initiative, with the objective of{' '}
              <strong>reducing processing delays by 3–4 days</strong> and
              improving the overall application experience.
            </p>
            <p>
              <strong>My role:</strong> As a Product Designer, I collaborated
              with PMs to define requirements and success metrics, partnered
              with developers to ensure feasibility and smooth handoffs,
              aligned with legal and compliance teams to meet regulatory
              standards, and engaged with business stakeholders to balance user
              needs with organizational goals. This cross-functional
              collaboration helped drive a solution that was both user-centric
              and operationally viable.
            </p>
            <p>
              <strong>Note:</strong> This work is based on Wells Fargo’s
              Business Line of Credit journey. All screens have been recreated
              for this case study to comply with confidentiality and regulatory
              guidelines.
            </p>
          </section>

          <section>
            <h2>Design approach</h2>
            <div className="ndla-b2-split">
              <ol className="ndla-b2-steps">
                {steps.map(([label, copy]) => (
                  <li key={label}>
                    <strong>{label}</strong>
                    <span>{copy}</span>
                  </li>
                ))}
              </ol>
              <FramerLottie src={lottie.approach} label="Design approach animation" />
            </div>
          </section>

          <section>
            <h2>Analysing user behaviour</h2>
            <p>
              I started by collaborating with the UX research team to understand
              user behavior, developed personas, and synthesized key insights.
              Then I partnered with PMs to analyze application data and funnel
              metrics to identify drop-offs and delays.
            </p>

            <div className="ndla-b2-persona">
              <img src={img.mary} alt="Mary Mathew, bakery owner" />
              <div>
                <h3>MARY MATHEW ( End User )</h3>
                <p>
                  A small business owner running a growing bakery. She needs
                  quick access to credit to expand her business but faces delays
                  and uncertainty in the current application process.
                </p>
                <p>
                  She has applied for business line of credit and needs $40,000
                  credit instantly &amp; is planning to apply to other banks for
                  credit too while waiting.
                </p>
              </div>
            </div>

            <div className="ndla-b2-persona ndla-b2-persona--flip">
              <div>
                <h3>BANKLEO ( The Bank )</h3>
                <p>
                  A financial institution processing a high volume of small
                  business credit applications while balancing risk, compliance,
                  and operational efficiency.
                </p>
                <p>
                  The bank currently faces delays in process, that are leading
                  to increased operational costs, lower conversion rates, and
                  loss of potential long-term customers to faster competitors.
                </p>
              </div>
              <img src={img.bank} alt="BankLeo institution" />
            </div>

            <h3 className="ndla-b2-sub">Key behavioural insights</h3>
            <div className="ndla-b2-insights">
              {insights.map((item) => (
                <article key={item.title}>
                  <h4>{item.title}</h4>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section>
            <h2>Understanding the application journey</h2>
            <p>
              I reviewed existing screens and flows to identify
              inconsistencies, areas of high cognitive load, and points of
              confusion. This helped uncover gaps in clarity and opportunities
              to simplify the overall user experience.
            </p>
            <p className="ndla-b2-label">Happy path screens</p>
            <figure className="ndla-b2-figure ndla-b2-figure--wash">
              <img src={img.happyPath} alt="Happy path application screens" />
              <img className="ndla-b2-caption" src={img.caption} alt="" />
            </figure>
            <p className="ndla-b2-label">Refurbished screens of the application journey</p>
            <FramerLottie
              src={lottie.refurbished}
              label="Refurbished application journey"
            />
            <p className="ndla-b2-hint">Click to restart the video</p>
          </section>

          <section>
            <h2>Identifying Problems</h2>
            <p>
              I mapped the end-to-end user journey and conducted heuristic
              evaluations to uncover usability issues and friction points. I
              also performed a competitive analysis to understand industry
              standards and identify gaps in speed, transparency, and user
              experience.
            </p>
            <p className="ndla-b2-label">User journey</p>
            <img className="ndla-b2-diagram" src={img.journey} alt="User journey diagram" />
            <p>
              In parallel, I collaborated with product and business
              stakeholders to understand operational challenges like manual
              reviews and compliance, helping me define the core problems from
              both user and business perspectives.
            </p>
            <p className="ndla-b2-label">Key findings</p>
            <ul className="ndla-b2-findings">
              {findings.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2>Fixing the slow processing issue</h2>
            <p>
              The amount requested field plays a key role in how applications
              are processed, with higher amounts triggering stricter reviews
              and longer processing times. Since most users opt for amounts
              under $50K, treating all applications the same leads to
              unnecessary manual processing and delays. By not differentiating
              early in the flow, the system slows down simpler cases, increasing
              turnaround time for the majority of users.
            </p>
            <p>
              Discussions with operational teams revealed that the applications
              can be filtered right after submission, if there was a way to
              give the user a few desired options to select from. After creating
              multiple iterations, I prioritised &amp; reviewed the following 2
              iterations with stakeholders. I tested them internally with other
              PMs and designers to craft an intuitive behaviour for the
              components &amp; I also consulted with dev team experts to check
              for feasibility.
            </p>
            <div className="ndla-b2-iters">
              <div>
                <p className="ndla-b2-label">Iteration 1</p>
                <FramerLottie src={lottie.iter1} label="Iteration 1" />
              </div>
              <div>
                <p className="ndla-b2-label">Iteration 2</p>
                <FramerLottie src={lottie.iter2} label="Iteration 2" />
              </div>
            </div>
            <p className="ndla-b2-label">Outcome</p>
            <p className="ndla-b2-hint">*Refurbished screen</p>
            <div className="ndla-b2-split">
              <FramerLottie src={lottie.express} label="Express processing outcome" />
              <div>
                <p>Applications became eligible for Express processing.</p>
                <img className="ndla-b2-shot" src={img.outcome} alt="Express processing screen" />
              </div>
            </div>
          </section>
        </article>
      </div>
      <Footer />
    </div>
  );
}
