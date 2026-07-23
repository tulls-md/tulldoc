import { Card } from "@/components";

export default function CardExample() {
  return (
    <Card.Root>
      <Card.Header title="Карточка" subtitle="Сборный компонент" />
      <Card.Content>Собирается из зон: шапка и контент.</Card.Content>
    </Card.Root>
  );
}
