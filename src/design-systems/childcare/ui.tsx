import {
  useState,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";

import styles from "./ui.module.css";

export type ControlSize = "sm" | "default" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: ControlSize;
  variant?: "default" | "outline" | "ghost";
};

export function Button({
  size = "default",
  variant = "default",
  type = "button",
  ...props
}: ButtonProps) {
  return <button className={styles.button} data-size={size} data-variant={variant} type={type} {...props} />;
}

type ToggleProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> & {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  size?: ControlSize;
  mark?: boolean;
};

export function Toggle({
  pressed,
  defaultPressed = false,
  onPressedChange,
  size = "default",
  mark = false,
  children,
  onClick,
  ...props
}: ToggleProps) {
  const [local, setLocal] = useState(defaultPressed);
  const on = pressed ?? local;
  return (
    <button
      aria-pressed={on}
      className={styles.toggle}
      data-pressed={on}
      data-size={size}
      type="button"
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const next = !on;
        setLocal(next);
        onPressedChange?.(next);
      }}
      {...props}
    >
      {mark ? <span className={styles.mark} /> : null}
      {children}
    </button>
  );
}

type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  size?: ControlSize;
};

export function Switch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  size = "default",
  onClick,
  ...props
}: SwitchProps) {
  const [local, setLocal] = useState(defaultChecked);
  const on = checked ?? local;
  return (
    <button
      aria-checked={on}
      className={styles.switch}
      data-checked={on}
      data-size={size}
      role="switch"
      type="button"
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const next = !on;
        setLocal(next);
        onCheckedChange?.(next);
      }}
      {...props}
    >
      <span className={styles.thumb} />
    </button>
  );
}

type FieldProps = {
  label: string;
  children: ReactNode;
};

export function Field({ label, children }: FieldProps) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      {children}
    </label>
  );
}

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & { size?: ControlSize };

export function Input({ size = "default", ...props }: InputProps) {
  return <input className={styles.input} data-size={size} {...props} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={styles.textarea} {...props} />;
}

type TextLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { quiet?: boolean };

export function TextLink({ quiet = false, ...props }: TextLinkProps) {
  return <a className={styles.link} data-quiet={quiet} {...props} />;
}

export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "draft" | "allergy"; children: ReactNode }) {
  return (
    <span className={styles.badge} data-tone={tone}>
      {children}
    </span>
  );
}

export function Avatar({ name, size = "default" }: { name: string; size?: ControlSize }) {
  const letter = name.trim().slice(0, 1).toUpperCase();
  return (
    <span aria-hidden="true" className={styles.avatar} data-size={size}>
      {letter}
    </span>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <div className={styles.card}>{children}</div>;
}

type DialogProps = {
  title: string;
  description: string;
  footer?: ReactNode;
  showClose?: boolean;
  stickyFooter?: boolean;
  scrollable?: boolean;
  onClose?: () => void;
};

export function Dialog({
  title,
  description,
  footer,
  showClose = true,
  stickyFooter = false,
  scrollable = false,
  onClose,
}: DialogProps) {
  return (
    <section aria-label={title} className={styles.dialog}>
      <header className={styles.head}>
        <h3 className={styles.title}>{title}</h3>
        {showClose ? (
          <button aria-label="Close" className={styles.close} type="button" onClick={onClose}>
            ×
          </button>
        ) : null}
      </header>
      <p className={styles.body} data-scroll={scrollable}>
        {description}
      </p>
      {footer ? (
        <footer className={styles.foot} data-sticky={stickyFooter}>
          {footer}
        </footer>
      ) : null}
    </section>
  );
}
