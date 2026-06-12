type ButtonVariant = "primary" | "secondary" | "success" | "warning" | "danger";

export interface ButtonProps extends React.HTMLProps<HTMLButtonElement> {
  label: string;
  variant: ButtonVariant;
}

export function Button({ label }: ButtonProps) {
  return <button>{label}</button>;
}
