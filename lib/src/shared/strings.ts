export interface DocStrings {
  anatomy: string;
  examples: string;
  api: string;
  documentation: string;
  noProps: string;
  exampleFailed: string;
  onThisPage: string;
  showCode: string;
  hideCode: string;
  required: string;
  inheritedFrom: string;
  editPage: string;
  componentSource: string;
  documentedInTulls: string;
}

const ru: DocStrings = {
  anatomy: "Анатомия",
  examples: "Примеры",
  api: "API",
  documentation: "Документация",
  noProps: "Компонент не принимает пропсов.",
  exampleFailed:
    "Не удалось сгенерировать пример - настройте его вручную (example) или отключите (disabled: true).",
  onThisPage: "На странице",
  showCode: "Посмотреть код",
  hideCode: "Скрыть код",
  required: "обязательный",
  inheritedFrom: "Наследуется от",
  editPage: "Редактировать страницу",
  componentSource: "Исходник",
  documentedInTulls: "Задокументировано в Tulldoc",
};

const en: DocStrings = {
  anatomy: "Anatomy",
  examples: "Examples",
  api: "API",
  documentation: "Documentation",
  noProps: "The component takes no props.",
  exampleFailed:
    "Couldn't generate this example - configure it manually (example) or turn it off (disabled: true).",
  onThisPage: "On this page",
  showCode: "View code",
  hideCode: "Hide code",
  required: "required",
  inheritedFrom: "Inherited from",
  editPage: "Edit this page",
  componentSource: "Source",
  documentedInTulls: "Documented in Tulldoc",
};

export function getDocStrings(lang?: string): DocStrings {
  return lang === "ru" ? ru : en;
}
