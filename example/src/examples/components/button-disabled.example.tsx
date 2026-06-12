import { Button } from "@/components";

interface ButtonDisabledExampleProps {
  disabled?: boolean;
}

export default function ButtonDisabledExample(
  props: ButtonDisabledExampleProps,
) {
  return <Button label="Click me!" {...props} />;
}
