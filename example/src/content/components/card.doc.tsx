import { type DocMeta } from "@tulls-md/tulldoc-code";
import { Card } from "@/components";
import CardExample from "@/examples/components/card.example";
import CardPlainExample from "@/examples/components/card-plain.example";

export default function CardDoc(): DocMeta<typeof Card.Root> {
  return {
    component: Card.Root,
    componentName: "Card.Root",
    description:
      "Сборная карточка. Собирается из зон `Card.Header` и `Card.Content`, " +
      "режим загрузки включается пропом `isLoading`. Описание поддерживает " +
      "**markdown**: [ссылки](https://example.com), списки и `инлайн-код`.",
    mainExample: <CardExample />,
    examples: [
      {
        prop: "isLoading",
        title: "Режим загрузки",
        description:
          "Пока `isLoading` равен `true`, контент приглушён - рядом с " +
          "заголовком примера показан проп, который он документирует.",
        defaultArgs: { children: "Содержимое карточки" },
      },
      {
        title: "Без канваса",
        description: 'Ручной пример с `view: "plain"` - без точечного фона.',
        example: <CardPlainExample />,
        view: "plain",
      },
      { prop: "children", disabled: true },
    ],
    subcomponents: [
      {
        component: Card.Header,
        componentName: "Card.Header",
        description:
          "Шапка карточки: обязательный `title` и необязательный `subtitle`.",
      },
      { component: Card.Content, componentName: "Card.Content" },
    ],
  };
}
