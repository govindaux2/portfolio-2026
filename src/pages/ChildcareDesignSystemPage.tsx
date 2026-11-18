import { useEffect, useState } from "react";

import {
  Avatar,
  Badge,
  Button,
  Card,
  Dialog,
  ExpiringCard,
  Field,
  Input,
  Switch,
  Textarea,
  TextLink,
  Toggle,
  type ControlSize,
} from "../design-systems/childcare";
import styles from "./childcare-design-system.module.css";

const sections = [
  ["primitives", "Primitives"],
  ["components", "Components"],
  ["layouts", "Layouts"],
  ["foundations", "Foundations"],
  ["theme", "Theme"],
  ["type", "Typography"],
] as const;

type SectionId = (typeof sections)[number][0];

const rail = [
  {
    label: "Controls & Forms",
    items: [
      ["button", "Button"],
      ["input", "Input"],
      ["textarea", "Textarea"],
      ["switch", "Switch"],
      ["toggle", "Toggle"],
    ],
  },
  { label: "Navigation", items: [["text-link", "Text link"]] },
  { label: "Overlays", items: [["dialog", "Dialog"]] },
  {
    label: "Data display",
    items: [
      ["avatar", "Avatar"],
      ["badge", "Badge"],
      ["expiring-card", "Expiring card"],
    ],
  },
  { label: "Containers", items: [["card", "Card"]] },
  { label: "Reference", items: [["libraries", "Libraries"]] },
] as const;

type PieceId = (typeof rail)[number]["items"][number][0];

const dialogCopy = {
  confirm: {
    title: "Share with parents?",
    description: "This note and photo go to Amina’s parents. Staff notes stay on your side.",
    showClose: true,
    stickyFooter: false,
    scrollable: false,
  },
  "no-close": {
    title: "Share with parents?",
    description: "This note and photo go to Amina’s parents. Staff notes stay on your side.",
    showClose: false,
    stickyFooter: false,
    scrollable: false,
  },
  sticky: {
    title: "Share with parents?",
    description:
      "This note and photo go to Amina’s parents. The staff note, other children’s names, and medicine for anyone else stay off the preview.",
    showClose: true,
    stickyFooter: true,
    scrollable: false,
  },
  scroll: {
    title: "Parent preview",
    description:
      "Amina had pasta at 12:10 and slept from 13:00 to 14:20. The photo is the one you confirmed. Allergy notes for other children are not in this preview. Medicine given to anyone else is not in this preview. You can still edit the sentence before it sends.",
    showClose: true,
    stickyFooter: true,
    scrollable: true,
  },
} as const;

type DialogVariant = keyof typeof dialogCopy;

const libraries = [
  ["shadcn/ui", "https://ui.shadcn.com", "Buttons, dialogs, inputs. Start here."],
  ["Radix", "https://www.radix-ui.com", "The unstyled pieces under shadcn."],
  ["Base UI", "https://base-ui.com", "Another unstyled set, from the MUI team."],
  ["React Aria", "https://react-spectrum.adobe.com/react-aria/", "Behaviour and keyboard support."],
  ["Ark UI", "https://ark-ui.com", "State machines for the same kinds of controls."],
];

export function ChildcareDesignSystemPage() {
  const [section, setSection] = useState<SectionId>("components");
  const [piece, setPiece] = useState<PieceId>("toggle");
  const [size, setSize] = useState<ControlSize>("default");
  const [theme, setTheme] = useState("dark");
  const [preview, setPreview] = useState("plain");
  const [dialogVariant, setDialogVariant] = useState<DialogVariant>("confirm");
  const [scrollTo, setScrollTo] = useState<string | null>(null);
  const dialog = dialogCopy[dialogVariant];

  useEffect(() => {
    if (!scrollTo) return;
    document.getElementById(scrollTo)?.scrollIntoView({ block: "start" });
  }, [scrollTo, section]);

  useEffect(() => {
    const previous = document.title;
    document.title = "Childcare design system";
    return () => {
      document.title = previous;
    };
  }, []);

  function openPiece(id: PieceId) {
    setPiece(id);
    if (id === "libraries") {
      setSection("foundations");
      setScrollTo("libraries");
      return;
    }
    setSection("components");
    setScrollTo(id);
  }

  return (
    <div className={styles.shell} data-preview={preview} data-theme={theme}>
      <aside className={styles.side}>
        <div className={styles.system}>Childcare</div>
        <nav aria-label="System" className={styles.nav}>
          {sections.map(([id, label], index) => (
            <button
              key={id}
              aria-current={section === id ? "page" : undefined}
              type="button"
              onClick={() => setSection(id)}
            >
              <span className={styles.num}>{String(index + 1).padStart(2, "0")}</span>
              {label}
            </button>
          ))}
        </nav>
        <div className={styles.sideFoot}>
          <label className={styles.choice}>
            Preview
            <select value={preview} onChange={(event) => setPreview(event.target.value)}>
              <option value="plain">Plain</option>
              <option value="card">On card</option>
            </select>
          </label>
          <label className={styles.choice}>
            Theme
            <select value={theme} onChange={(event) => setTheme(event.target.value)}>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="system">System</option>
            </select>
          </label>
        </div>
      </aside>

      <main className={styles.center}>
        {section === "components" ? (
          <div className={styles.sizes} role="group" aria-label="Size">
            {(
              [
                ["sm", "SM"],
                ["default", "Default"],
                ["lg", "LG"],
              ] as const
            ).map(([id, label]) => (
              <button key={id} aria-pressed={size === id} type="button" onClick={() => setSize(id)}>
                {label}
              </button>
            ))}
          </div>
        ) : null}

        <div className={styles.canvas}>
          {section === "primitives" ? <Primitives /> : null}
          {section === "components" ? <Components dialog={dialog} size={size} /> : null}
          {section === "layouts" ? <Layouts /> : null}
          {section === "foundations" ? <Foundations /> : null}
          {section === "theme" ? <Theme /> : null}
          {section === "type" ? <Type /> : null}
        </div>

        {section === "components" ? (
          <div className={styles.variants} role="group" aria-label="Dialog variant">
            {(
              [
                ["confirm", "Confirm share"],
                ["no-close", "No close"],
                ["sticky", "Sticky footer"],
                ["scroll", "Scrollable note"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                aria-pressed={dialogVariant === id}
                type="button"
                onClick={() => {
                  setDialogVariant(id);
                  document.getElementById("dialog")?.scrollIntoView({ block: "center" });
                }}
              >
                {label}
              </button>
            ))}
          </div>
        ) : null}
      </main>

      <aside className={styles.rail} aria-label="Components">
        {rail.map((group) => (
          <div key={group.label} className={styles.group}>
            <h2>{group.label}</h2>
            {group.items.map(([id, label]) => (
              <button
                key={id}
                aria-current={
                  piece === id && (id === "libraries" ? section === "foundations" : section === "components")
                    ? "true"
                    : undefined
                }
                type="button"
                onClick={() => openPiece(id)}
              >
                {label}
              </button>
            ))}
          </div>
        ))}
      </aside>
    </div>
  );
}

function Primitives() {
  const colors = [
    ["#070707", "Stage"],
    ["#f5f5f5", "Ink"],
    ["#222222", "Line"],
    ["#fd5894", "Card pink"],
    ["#f880af", "Card mid"],
    ["#dcfcff", "Card ice"],
  ];
  return (
    <section className={styles.lead}>
      <h2>Primitives</h2>
      <p>Color, corner, and space used by the childcare pieces. The pink comes from the expiring card.</p>
      <div className={styles.swatches}>
        {colors.map(([color, name]) => (
          <div key={name} className={styles.swatch}>
            <i style={{ background: color }} />
            <span>{name}</span>
          </div>
        ))}
      </div>
      <div className={styles.radii}>
        <b style={{ borderRadius: 8 }}>8</b>
        <b style={{ borderRadius: 16 }}>16</b>
        <b style={{ borderRadius: 26 }}>26</b>
        <b style={{ borderRadius: 999 }}>Pill</b>
      </div>
    </section>
  );
}

function Components({
  size,
  dialog,
}: {
  size: ControlSize;
  dialog: (typeof dialogCopy)[DialogVariant];
}) {
  return (
    <>
      <div className={styles.hero} id="button">
        <Button size={size}>Share update</Button>
      </div>

      <section className={styles.block} id="toggle">
        <h2>Toggle</h2>
        <p>Turn a routine, or parent visibility, on and off before anything is shared.</p>
        <div className={styles.row}>
          <Toggle defaultPressed mark size={size}>
            Parent visible
          </Toggle>
          <span style={{ display: "flex", gap: 8 }}>
            <Toggle defaultPressed size={size}>
              Meal
            </Toggle>
            <Toggle size={size}>Nap</Toggle>
          </span>
          <Toggle size={size}>Note</Toggle>
          <span style={{ display: "flex", gap: 8 }}>
            <Toggle disabled size={size}>
              Disabled
            </Toggle>
            <Toggle disabled size={size}>
              Disabled
            </Toggle>
          </span>
        </div>
      </section>

      <section className={styles.block} id="text-link">
        <h2>Navigation</h2>
        <p>Move between a child’s day, a draft, and what is already shared.</p>
        <hr className={styles.rule} />
        <h3 style={{ margin: "18px 0 0", fontSize: 16, fontWeight: 600 }}>Text link</h3>
        <div className={styles.links}>
          <TextLink href="#text-link">Today</TextLink>
          <TextLink href="#text-link" quiet>
            None set
          </TextLink>
          <TextLink href="#text-link">Memories</TextLink>
        </div>
      </section>

      <section className={styles.block} id="dialog">
        <h2>Overlays</h2>
        <p>A share waits here until a person confirms it.</p>
        <hr className={styles.rule} />
        <h3 style={{ margin: "18px 0 12px", fontSize: 16, fontWeight: 600 }}>Dialog</h3>
        <Dialog
          description={dialog.description}
          footer={
            <>
              <Button size={size} variant="ghost">
                Not yet
              </Button>
              <Button size={size}>Share update</Button>
            </>
          }
          scrollable={dialog.scrollable}
          showClose={dialog.showClose}
          stickyFooter={dialog.stickyFooter}
          title={dialog.title}
        />
      </section>

      <section className={styles.block} id="input">
        <h2>Fields</h2>
        <p>What the childminder types. A draft from the model can land in the note, and stays editable.</p>
        <div className={styles.stack}>
          <Field label="Meal">
            <Input defaultValue="Pasta, most of it" size={size} />
          </Field>
          <div id="textarea">
            <Field label="Note for parents">
              <Textarea defaultValue="She ate well and asked for more." />
            </Field>
          </div>
          <div className={styles.pair} id="switch">
            <Switch defaultChecked size={size} />
            <span>Parent visible</span>
          </div>
        </div>
      </section>

      <section className={styles.block} id="avatar">
        <h2>People and status</h2>
        <div className={styles.person}>
          <Avatar name="Amina" size={size} />
          <span>Amina</span>
        </div>
        <div className={styles.chips} id="badge">
          <Badge tone="draft">Draft</Badge>
          <Badge tone="allergy">Allergy</Badge>
          <Badge>Shared</Badge>
        </div>
        <div id="expiring-card" style={{ marginTop: 22 }}>
          <ExpiringCard />
        </div>
      </section>

      <section className={styles.block} id="card">
        <h2>Card</h2>
        <p>A plain container for a feed row. The pink card above is its own piece.</p>
        <div style={{ marginTop: 16, maxWidth: 360 }}>
          <Card>
            <strong>Nap</strong>
            <p className={styles.note}>13:00–14:20, in the cot.</p>
          </Card>
        </div>
      </section>
    </>
  );
}

function Layouts() {
  return (
    <section className={styles.lead}>
      <h2>Layouts</h2>
      <p>One column a childminder can scan: who, what is expiring, the note, then the confirm.</p>
      <div className={styles.layoutCard}>
        <div className={styles.person}>
          <Avatar name="Amina" />
          <span>Amina · today</span>
        </div>
        <ExpiringCard
          date="12th Jun"
          headline="Consent ends"
          message="Photo consent for Amina ends soon."
        />
        <Field label="Note for parents">
          <Textarea defaultValue="Park in the morning. She held the camera." />
        </Field>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button>Share update</Button>
        </div>
      </div>
    </section>
  );
}

function Foundations() {
  return (
    <section className={styles.lead}>
      <h2>Foundations</h2>
      <p>
        The model may draft a caption, a parent sentence, or a reply. Sharing, and anything that reads as an
        assessment, waits until a person confirms. These pieces are for the childcare app. Two more systems can
        sit beside this one later.
      </p>
      <h3 id="libraries" style={{ margin: "28px 0 0", fontSize: 16, fontWeight: 600 }}>
        Libraries
      </h3>
      <p>Use these when a control here is not enough. shadcn is the one to copy from first.</p>
      <ul className={styles.libraries}>
        {libraries.map(([name, href, why]) => (
          <li key={href}>
            <a href={href} rel="noreferrer" target="_blank">
              {name}
            </a>
            <span>{why}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Theme() {
  return (
    <section className={styles.lead}>
      <h2>Theme</h2>
      <p>Dark matches this browser. Light and System are on the Preview control at the lower left.</p>
      <div className={styles.pair}>
        <Button>Share update</Button>
        <Button variant="outline">Not yet</Button>
        <Button variant="ghost">Dismiss</Button>
      </div>
    </section>
  );
}

function Type() {
  return (
    <section className={styles.lead}>
      <h2>Typography</h2>
      <p>Interface text is DM Sans. The expiring card uses Bricolage Grotesque, the same face as the studio card.</p>
      <div className={styles.scale}>
        <p className={styles.typeCard}>Expiring soon</p>
        <p className={styles.typeUi}>She ate well and asked for more.</p>
        <p className={styles.note}>Staff note stays visually quieter than the parent sentence.</p>
      </div>
    </section>
  );
}
