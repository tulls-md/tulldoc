import { Anatomy, type DocMeta } from "@tulls-md/tulldoc-code";
import { Button } from "@/components";
import ButtonExample from "@/examples/components/button.example";

export default function ButtonDoc(): DocMeta<typeof Button> {
  const AnatomyComponent = (
    <Anatomy.Root>
      <Anatomy.Part label={"Button"}>
        <Anatomy.Part label={"label"} />
      </Anatomy.Part>
    </Anatomy.Root>
  );

  return {
    component: Button,
    defaultArgs: { label: "Click Me!" },
    mainExample: <ButtonExample />,
    anatomy: AnatomyComponent,
    examples: [
      { prop: "disabled", description: "Кастомный пример" },
      { prop: "variant", view: "grid" },
      { prop: "variant", view: "cell" },
    ],
  };
}
