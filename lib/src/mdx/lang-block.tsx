import React, { type ReactElement, type ReactNode } from "react";

/**
 * Обёртка одного языкового варианта. Сам по себе только рендерит содержимое -
 * выбор нужного варианта делает LangSwitch по пропу locale.
 */
export function LangBlock({ children }: { locale?: string; children?: ReactNode }) {
  return <>{children}</>;
}

/**
 * Компоненты для языковых блоков MDX, привязанные к активной локали. remark-lang
 * превращает `:::lang{xx}` в `<LangSwitch><LangBlock locale="xx">…</LangBlock>…`,
 * а LangSwitch выбирает блок активной локали, иначе блок языка по умолчанию,
 * иначе первый доступный. Передаются в getMDXComponents при рендере страницы.
 */
export function langComponents(locale: string, defaultLocale: string) {
  function LangSwitch({ children }: { children?: ReactNode }) {
    const blocks = React.Children.toArray(children).filter(
      (child): child is ReactElement<{ locale?: string }> =>
        React.isValidElement(child),
    );
    const picked =
      blocks.find((block) => block.props.locale === locale) ??
      blocks.find((block) => block.props.locale === defaultLocale) ??
      blocks[0];
    return picked ?? null;
  }

  return { LangSwitch, LangBlock };
}
