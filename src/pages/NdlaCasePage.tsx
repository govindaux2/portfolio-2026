import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PersonalInfoScreen, UnfreezeScreen } from './ndla-proto-screens';
import { ExportStudio, StudioDock } from '../dev/ExportStudio';
import { Nav } from '../components/Nav';
import { Footer } from '../components/Footer';
import './ndla-case.css';

type View = 'phone' | 'tablet' | 'desktop';

const DEVICES: Record<Exclude<View, 'desktop'>, { w: number; h: number; label: string }> = {
  phone: { w: 402, h: 874, label: 'iPhone 17' },
  tablet: { w: 834, h: 1194, label: 'iPad' },
};

function Frame({ id, src, alt }: { id: string; src: string; alt: string }) {
  return (
    <figure className="ndla-frame" id={id}>
      <img src={src} alt={alt} />
    </figure>
  );
}

/** Figma node, as an image. Optional clip matches Figma overflow on the screenshot. */
function Fig({
  src,
  alt,
  caption,
  width,
  height,
  radius,
  clip,
}: {
  src: string;
  alt: string;
  caption?: string;
  width: number;
  height?: number;
  radius?: number;
  clip?: { w: string; h: string; left: string; top: string };
}) {
  return (
    <figure className="ndla-fig" style={{ width }}>
      <div
        className={clip ? 'ndla-fig-clip' : undefined}
        style={
          clip
            ? { width, height, borderRadius: radius }
            : undefined
        }
      >
        <img
          src={src}
          alt={alt}
          width={width}
          style={
            clip
              ? { width: clip.w, height: clip.h, left: clip.left, top: clip.top }
              : undefined
          }
        />
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

function FigRow({
  id,
  kicker,
  children,
}: {
  id?: string;
  kicker?: string;
  children: ReactNode;
}) {
  return (
    <div className="ndla-fig-row" id={id}>
      {kicker ? <p className="ndla-fig-kicker">{kicker}</p> : null}
      <div className="ndla-fig-row-inner">{children}</div>
    </div>
  );
}

function NdlaDocument({ zoom = 1 }: { zoom?: number }) {
  return (
    <div className="ndla-doc">
      <StudioDock />
      <Nav variant="inner" />
      <div className="ndla-zoom" style={{ zoom }}>
      <article className="ndla-article">
        <p className="ndla-kicker">
          <Link to="/">← Work</Link>
        </p>

        <nav className="ndla-toc" aria-label="Case sections">
          <a href="#cover">Cover</a>
          <a href="#context">Context</a>
          <a href="#problem">Problem</a>
          <a href="#findings">The brief</a>
          <a href="#finding-1">Amount</a>
          <a href="#iteration-name">Name on card</a>
          <a href="#finding-3">Unfreeze</a>
          <a href="#screens">Screens</a>
          <a href="#outcome">Outcome</a>
        </nav>

        <header id="cover" className="ndla-hero">
          <p className="ndla-eyebrow">Wells Fargo · Business line of credit · 2025 sprint</p>
          <h1>The application was fast. Funding was not.</h1>
          <p className="ndla-lede">
            NDLA is the digital apply for a small-business line of credit.
            Owners could finish the form in about ten minutes. The extra wait
            started after submit, when operations still opened most files by
            hand. I treated that as a routing and trust problem, not a visual
            polish pass. Screens here are refurbished. Live bank UI stays off
            the page (NDA).
          </p>
        </header>

        <section id="context" className="ndla-sec">
          <p className="ndla-eyebrow">Who it is for</p>
          <h2>Mary needs $40k while the bakery is still open</h2>
          <p>
            Mary is a composite, not a quoted research participant. She knows
            the number: about $40,000 to expand. She will apply at BankLeo and
            keep other banks in her pocket if the wait is opaque. She does not
            want a tour of the product. She wants a file that moves, a limit
            she can explain to herself, and enough control that she is not
            signing away the shop to get a line.
          </p>
          <p>
            BankLeo’s job is the other half of the same story: high volume,
            real risk, compliance that cannot be designed around. If the
            digital file is ambiguous, a human reopens it. That is where days
            accrue — not in the last text field.
          </p>
          <Frame
            id="frame-context"
            src="/case/ndla/cover.png"
            alt="Let’s imagine: Mary, goals, and pain points"
          />
        </section>

        <section id="problem" className="ndla-sec">
          <p className="ndla-eyebrow">The product problem</p>
          <h2>Submit felt like the finish line. For ops it was the start.</h2>
          <p>
            A ten-minute fill is a good number to put on a slide. It is the
            wrong number if the account still sits. After submit, most files
            went to manual processing. Flagged ones waited on a smart
            checklist. Average extra time to an open account sat around four
            days. Applicants experienced that as silence. The bank experienced
            it as cost and lost conversion to anyone faster.
          </p>
          <dl className="ndla-pair">
            <div>
              <dt>Constraint</dt>
              <dd>
                Legal, credit, and operations already had a complexity line
                around $50k. The UI did not expose it. A free amount from
                $5,000 to $100,000 looked simple and hid the queue.
              </dd>
            </div>
            <div>
              <dt>Goal I designed against</dt>
              <dd>
                Cut that post-submit delay by 3 to 4 days by making the file
                segmentable on day one, and shorten the path without lying
                about speed. That delay cut is the target, not a measured
                post-ship result.
              </dd>
            </div>
          </dl>
          <Frame
            id="frame-product"
            src="/case/ndla/apply.png"
            alt="NDLA apply screens with objectives: faster processing and a streamlined form"
          />
        </section>

        <section id="findings" className="ndla-sec">
          <p className="ndla-eyebrow">Live quarter · July 2025</p>
          <h2>The data said stop redesigning the happy path</h2>
          <p>
            27k small-business line of credit applications in one quarter. I
            used that as the brief: work the failure modes that already
            showed up at scale, so operations could trust the digital file
            instead of reconstructing it.
          </p>
          <ul className="ndla-facts">
            <li>72.4% (19.54k) asked for under $50k — and still sat in a long process</li>
            <li>68.18% (18.4k) went to manual processing</li>
            <li>8.3% (2.2k) held because credit was frozen</li>
            <li>Fill time averaged 10 minutes. The delay was not the form length.</li>
          </ul>
          <Frame
            id="frame-findings"
            src="/case/ndla/tcs.png"
            alt="Live-environment findings: 27k applications, amount mix, manual share, frozen credit, 10-minute fill"
          />
        </section>

        <section id="finding-1" className="ndla-sec">
          <p className="ndla-eyebrow">Decision 1 · Amount</p>
          <h2>Put the $50k split where the applicant already decides</h2>
          <p>
            Ops could filter after submit if the amount told the truth early.
            A typed field from $5k–$100k did not. It hid the policy line,
            invited a number the score would later undercut, and gave the
            majority — 72.4% under $50k — the same queue as the complex
            tail.
          </p>
          <p>
            The product move: make amount a routing control. Offer a small
            set of desired bands, send up to $50k toward express, and say
            out loud that the final limit depends on the score. Tradeoff:
            less “type any number” freedom, more honest speed for the mass
            of the book. That is the bet Mary actually needed — not a
            prettier slider.
          </p>
          <Frame
            id="frame-amount"
            src="/case/ndla/amount.png"
            alt="Finding 1: amount requested control and the 72.4 percent under 50k insight"
          />
        </section>

        <section id="iteration-name" className="ndla-sec">
          <p className="ndla-eyebrow">Decision 2 · Name on card</p>
          <h2>Print a name a human can match at 2 a.m.</h2>
          <p>
            54% of a quarter’s files flagged when the name on the card did
            not match the legal name. That is not a copy issue. It is a
            verification tax. Iteration 1 offered free text plus truncation
            pills. It read as multi-select, was slower to compute, and still
            let someone invent a nickname operations could not prove.
          </p>
          <p>
            Iteration 2, the one that shipped: one shortened legal name or a
            generic compliance name, with a preview of what prints. Fewer
            clever options. A file that does not come back because “M. Mathew”
            is not on the articles of organization.
          </p>
          <FigRow id="frame-name" kicker="Based on truncation logic">
            <ExportStudio id="iter-1">
              <Fig
                src="/case/ndla/fig/iter-1.png"
                alt="Iteration 1: pills for shortened names, and tradeoffs"
                width={369}
              />
            </ExportStudio>
            <ExportStudio id="iter-2">
              <Fig
                src="/case/ndla/fig/iter-2.png"
                alt="Iteration 2, approved: radio names, card preview, and benefits"
                width={429}
              />
            </ExportStudio>
          </FigRow>
        </section>

        <section id="finding-3" className="ndla-sec">
          <p className="ndla-eyebrow">Decision 3 · Unfreeze and terms</p>
          <h2>Do not let a frozen score kill the file after the work</h2>
          <p>
            8.3% of applications died because the score could not be fetched.
            Warning after submit is too late. A reminder with the unfreeze
            steps now sits before the form, while Mary still has the bureau
            apps on her phone.
          </p>
          <p>
            Policy pages were another kind of delay: four documents pretending
            to be four destinations. Combined into one terms step, the path
            goes from 9 to 5. Expected fill-time save is about three minutes.
            That is an estimate from step count, not a post-launch time
            study.
          </p>
          <FigRow id="frame-unfreeze" kicker="a. Unfreezing credit reminder with steps">
            <ExportStudio id="unfreeze-personal">
              <figure className="ndla-fig">
                <PersonalInfoScreen />
                <figcaption>
                  Added page level message to remind user to unfreeze credit
                </figcaption>
              </figure>
            </ExportStudio>
            <ExportStudio id="unfreeze-steps">
              <figure className="ndla-fig">
                <UnfreezeScreen />
                <figcaption>
                  Provided instructions to take necessary steps
                </figcaption>
              </figure>
            </ExportStudio>
          </FigRow>
        </section>

        <section id="screens" className="ndla-sec">
          <p className="ndla-eyebrow">The path</p>
          <h2>Landing, identity, business, numbers, then the legal beats</h2>
          <p>
            Refurbished BankLeo screens so the story is visible without the
            live UI. The legal work that used to be separate pages now sits
            in the same journey as amount and name — because that is where
            the file either becomes expressible or it does not.
          </p>
          <Frame
            id="frame-screens"
            src="/case/ndla/prototype.png"
            alt="Refurbished BankLeo screens, including the consent pages where the path changed"
          />
        </section>

        <section id="outcome" className="ndla-sec">
          <p className="ndla-eyebrow">What I will stand behind</p>
          <h2>Observed, expected, and not claimed</h2>
          <p>
            Observed: 30% of applications eligible for the express amount
            path. Expected: more than half if routing actually follows the
            $50k split. Not claimed: a measured drop in the four-day delay
            after ship — that remains the goal we designed to, not a number
            I will put on a case-study trophy.
          </p>
          <p>
            Two Team Spotlight awards landed on NDLA execution. Those are
            how the org noticed the work. They are not the product metric.
          </p>
        </section>
      </article>
      <Footer />
      </div>
    </div>
  );
}

function DeviceIcon({ view }: { view: View }) {
  if (view === 'phone') {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <rect x="4" y="1.5" width="6" height="11" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }
  if (view === 'tablet') {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <rect x="2.5" y="1.5" width="9" height="11" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <rect x="1.5" y="2.5" width="11" height="7" rx="1" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 11.5h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function ViewFab({
  view,
  onChange,
  onReset,
}: {
  view: View;
  onChange: (next: View) => void;
  onReset?: () => void;
}) {
  const options: { id: View; label: string }[] = [
    { id: 'desktop', label: 'Desktop' },
    { id: 'tablet', label: 'iPad' },
    { id: 'phone', label: 'iPhone 17' },
  ];

  return (
    <div className="ndla-fab">
      {onReset ? (
        <button type="button" className="ndla-fab-trigger" onClick={onReset} aria-label="Reset canvas">
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path
              d="M2.2 6a3.8 3.8 0 1 1 .8 2.3M2.2 6V3.2M2.2 6H5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      ) : null}
      <div className="ndla-fab-hover">
        <button
          type="button"
          className="ndla-fab-trigger"
          aria-label={`${view} preview. Hover for other sizes.`}
          aria-haspopup="true"
        >
          <DeviceIcon view={view} />
        </button>
        <div className="ndla-fab-menu" role="menu" aria-label="Preview size">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              role="menuitem"
              aria-pressed={view === opt.id}
              className={view === opt.id ? 'is-on' : undefined}
              onClick={() => onChange(opt.id)}
            >
              <DeviceIcon view={opt.id} />
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

type Cam = { x: number; y: number; z: number };

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function usePageZoom(enabled: boolean) {
  const [zoom, setZoomState] = useState(1);
  const zoomRef = useRef(1);
  zoomRef.current = zoom;

  const setZoom = (next: number) => {
    const z = clamp(next, 1, 2.5);
    zoomRef.current = z;
    setZoomState(z);
  };

  useEffect(() => {
    if (!enabled) return;

    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      setZoom(zoomRef.current * Math.exp(-e.deltaY * 0.01));
    };

    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.key === '=' || e.key === '+' || e.code === 'Equal' || e.code === 'NumpadAdd') {
        e.preventDefault();
        setZoom(zoomRef.current * 1.1);
        return;
      }
      if (e.key === '-' || e.code === 'Minus' || e.code === 'NumpadSubtract') {
        e.preventDefault();
        setZoom(zoomRef.current / 1.1);
        return;
      }
      if (e.key === '0' || e.code === 'Digit0' || e.code === 'Numpad0') {
        e.preventDefault();
        setZoom(1);
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
    };
  }, [enabled]);

  return { zoom };
}

export function NdlaCasePage() {
  const [params, setParams] = useSearchParams();
  const embed = params.get('embed') === '1';
  const view: View =
    params.get('view') === 'phone'
      ? 'phone'
      : params.get('view') === 'tablet'
        ? 'tablet'
        : 'desktop';

  const setView = (next: View) => {
    const nextParams = new URLSearchParams(params);
    nextParams.delete('embed');
    if (next === 'desktop') nextParams.delete('view');
    else nextParams.set('view', next);
    setParams(nextParams, { replace: true });
  };

  const pageZoom = usePageZoom(!embed && view === 'desktop');

  const stageRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const camRef = useRef<Cam>({ x: 0, y: 0, z: 1 });
  const dragRef = useRef<{ x: number; y: number; camX: number; camY: number } | null>(null);
  const [, setTick] = useState(0);

  const setCam = (next: Cam) => {
    camRef.current = next;
    setTick((n) => n + 1);
  };

  const fit = () => {
    const stage = stageRef.current;
    if (!stage || view === 'desktop') return;
    const { w, h } = DEVICES[view];
    const pad = 40;
    const z = Math.min((stage.clientWidth - pad) / w, (stage.clientHeight - pad) / h);
    setCam({
      x: (stage.clientWidth - w * z) / 2,
      y: (stage.clientHeight - h * z) / 2,
      z: Math.max(z, 0.15),
    });
  };

  const zoomAt = (clientX: number, clientY: number, factor: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    const cam = camRef.current;
    const nz = clamp(cam.z * factor, 0.2, 6);
    setCam({
      x: px - ((px - cam.x) / cam.z) * nz,
      y: py - ((py - cam.y) / cam.z) * nz,
      z: nz,
    });
  };

  useEffect(() => {
    if (embed || view === 'desktop') return;
    const t = window.setTimeout(fit, 50);
    window.addEventListener('resize', fit);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', fit);
    };
  }, [embed, view]);

  useEffect(() => {
    if (embed || view === 'desktop') return;
    const stage = stageRef.current;
    if (!stage) return;

    const onWheel = (e: WheelEvent) => {
      const pinch = e.ctrlKey || e.metaKey;
      e.preventDefault();
      if (pinch) {
        zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.01));
        return;
      }
      setCam({
        ...camRef.current,
        x: camRef.current.x - e.deltaX,
        y: camRef.current.y - e.deltaY,
      });
    };
    stage.addEventListener('wheel', onWheel, { passive: false });

    const iframe = iframeRef.current;
    const bindIframe = () => {
      const win = iframe?.contentWindow;
      if (!win) return;
      const onIframeWheel = (e: WheelEvent) => {
        if (!(e.ctrlKey || e.metaKey)) return;
        e.preventDefault();
        const box = iframe.getBoundingClientRect();
        zoomAt(
          box.left + e.clientX * (box.width / win.innerWidth),
          box.top + e.clientY * (box.height / win.innerHeight),
          Math.exp(-e.deltaY * 0.01),
        );
      };
      win.addEventListener('wheel', onIframeWheel, { passive: false });
      return () => win.removeEventListener('wheel', onIframeWheel);
    };
    let unbind = bindIframe();
    const onLoad = () => {
      unbind?.();
      unbind = bindIframe();
    };
    iframe?.addEventListener('load', onLoad);
    return () => {
      stage.removeEventListener('wheel', onWheel);
      iframe?.removeEventListener('load', onLoad);
      unbind?.();
    };
  }, [embed, view]);

  if (embed) return <NdlaDocument />;

  if (view === 'desktop') {
    return (
      <>
        <NdlaDocument zoom={pageZoom.zoom} />
        <ViewFab view={view} onChange={setView} />
      </>
    );
  }

  const cam = camRef.current;
  const { w, h, label } = DEVICES[view];

  return (
    <div
      className={`ndla-stage ndla-stage--${view}`}
      ref={stageRef}
      onPointerDown={(e) => {
        const t = e.target as HTMLElement;
        const fromCanvas = t === e.currentTarget || t.classList.contains('ndla-device');
        if (!fromCanvas) return;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        dragRef.current = { x: e.clientX, y: e.clientY, camX: camRef.current.x, camY: camRef.current.y };
      }}
      onPointerMove={(e) => {
        const drag = dragRef.current;
        if (!drag) return;
        setCam({
          ...camRef.current,
          x: drag.camX + (e.clientX - drag.x),
          y: drag.camY + (e.clientY - drag.y),
        });
      }}
      onPointerUp={() => {
        dragRef.current = null;
      }}
      onDoubleClick={(e) => {
        if (e.target !== e.currentTarget) return;
        fit();
      }}
    >
      <div
        className="ndla-world"
        style={{ transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.z})` }}
      >
        <div className="ndla-device" style={{ width: w, height: h }}>
          <iframe
            ref={iframeRef}
            title={`NDLA case, ${label} preview`}
            src="/work/ndla?embed=1"
            className="ndla-iframe"
            width={w}
            height={h}
          />
        </div>
      </div>
      <ViewFab view={view} onChange={setView} onReset={fit} />
    </div>
  );
}
