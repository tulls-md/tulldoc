import { Anatomy, type DocMeta } from "@tulls-md/tulldoc-code";
import { Button } from "@/components";

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
    description:
      "Кнопка. Вариант оформления задаётся пропом `variant`, текст - " +
      "пропом `label`.",
    defaultArgs: { label: "Click Me!" },
    mainExample: { label: "Click Me!", variant: "primary" },
    anatomy: AnatomyComponent,
    examples: [
      { prop: "disabled", description: "Кастомный пример" },
      {
        prop: "variant",
        title: "Варианты оформления",
        description: "Кастомный заголовок - имя пропа показано рядом.",
        view: "grid",
      },
      { prop: "variant", view: "cell" },
      { prop: "a", defaultArgs: { a: <div>Привет</div> } },
    ],
  };
}
