import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { TopNav } from "../components/layout/TopNav";
import { Footer } from "../components/layout/Footer";
import { useLocale } from "../context/LocaleContext";
import { DOCS } from "../i18n/docs";
import type { DocBlock, DocSection } from "../i18n/docs";

function Block({ block }: { block: DocBlock }) {
  switch (block.kind) {
    case "p":
      return (
        <p className="text-body-md text-body leading-relaxed mb-4">
          {block.text}
        </p>
      );
    case "h":
      return (
        <h3 className="font-display font-semibold text-[15px] text-on-dark mt-7 mb-2.5">
          {block.text}
        </h3>
      );
    case "ul":
      return (
        <ul className="list-disc pl-5 space-y-1.5 mb-4 text-body-md text-body">
          {block.items.map((it, i) => (
            <li key={i} className="leading-relaxed">
              {it}
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="list-decimal pl-5 space-y-1.5 mb-4 text-body-md text-body">
          {block.items.map((it, i) => (
            <li key={i} className="leading-relaxed">
              {it}
            </li>
          ))}
        </ol>
      );
    case "code":
      return (
        <pre className="font-mono text-[12.5px] leading-relaxed bg-[var(--tint-a)] border border-hairline rounded-xl p-4 overflow-x-auto text-on-dark whitespace-pre mb-4">
          {block.code}
        </pre>
      );
    case "note":
      return (
        <div className="flex gap-3 rounded-xl border border-hairline border-l-2 border-l-accent bg-[var(--tint-a)] px-4 py-3 mb-4">
          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
          <p className="text-body-sm text-body leading-relaxed">{block.text}</p>
        </div>
      );
    case "table":
      return (
        <div className="overflow-x-auto mb-4 rounded-xl border border-hairline">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-hairline">
                {block.head.map((h, i) => (
                  <th
                    key={i}
                    className="px-4 py-2.5 text-caption font-semibold text-on-dark bg-[var(--tint-a)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr
                  key={ri}
                  className="border-b border-hairline last:border-0"
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={
                        ci === 0
                          ? "px-4 py-2.5 text-body-sm font-medium text-on-dark whitespace-nowrap"
                          : "px-4 py-2.5 text-body-sm text-body"
                      }
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

export function Docs() {
  const { locale } = useLocale();
  const location = useLocation();
  const docs = DOCS[locale];

  // Scroll to the anchored section when arriving via a hash link (e.g. from
  // the footer), and re-run if the locale swap changes layout height.
  useEffect(() => {
    if (location.hash) {
      const targetId = decodeURIComponent(location.hash.slice(1));
      const el = document.getElementById(targetId);
      if (el) {
        window.setTimeout(
          () => el.scrollIntoView({ behavior: "smooth", block: "start" }),
          60,
        );
        return;
      }
    }
    window.scrollTo({ top: 0 });
  }, [location.hash, locale]);

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <TopNav />

      <main className="flex-1">
        <div className="mx-auto max-w-[1320px] px-5 lg:px-8 py-12 lg:py-16">
          {/* Header */}
          <div className="max-w-2xl">
            <div className="type-eyebrow mb-3">{docs.eyebrow}</div>
            <h1 className="type-display text-display-lg text-on-dark mb-4">
              {docs.title}
            </h1>
            <p className="text-body-md text-body leading-relaxed">
              {docs.subtitle}
            </p>
          </div>

          <div className="mt-12 grid lg:grid-cols-[240px_minmax(0,1fr)] gap-10 lg:gap-14">
            {/* Table of contents */}
            <aside className="hidden lg:block">
              <nav className="sticky top-24">
                <div className="type-eyebrow mb-3">{docs.tocLabel}</div>
                <div className="space-y-5">
                  {docs.groups.map((g) => {
                    const groupSections = docs.sections.filter(
                      (s) => s.group === g.id,
                    );
                    if (groupSections.length === 0) return null;
                    return (
                      <div key={g.id}>
                        <div className="text-[12px] font-semibold font-display text-on-dark mb-2">
                          {g.label}
                        </div>
                        <ul className="space-y-1 border-l border-hairline">
                          {groupSections.map((s) => (
                            <li key={s.id}>
                              <a
                                href={"#" + s.id}
                                className="block -ml-px pl-3 border-l border-transparent text-body-sm text-muted hover:text-on-dark hover:border-l-accent transition-colors"
                              >
                                {s.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </nav>
            </aside>

            {/* Content */}
            <div className="min-w-0 max-w-2xl">
              {docs.sections.map((section: DocSection) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-24 mb-14 last:mb-0"
                >
                  <h2 className="type-display text-display-sm text-on-dark mb-4 pb-3 border-b border-hairline">
                    {section.title}
                  </h2>
                  {section.blocks.map((block, i) => (
                    <Block key={i} block={block} />
                  ))}
                </section>
              ))}

              <div className="pt-2">
                <a
                  href="#top"
                  onClick={(e) => {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-body-sm text-accent hover:underline"
                >
                  {docs.backToTop} ↑
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
