import styles from "./button.module.css";

type ButtonVariant = "primary" | "secondary" | "success" | "warning" | "danger";

export interface ButtonProps extends React.HTMLProps<HTMLButtonElement> {
  label: string;
  variant: ButtonVariant;
  a: React.ReactNode;
}

export function Button({ label, a }: ButtonProps) {
  return <button className={styles.Root}>{label} {a}</button>;
}
