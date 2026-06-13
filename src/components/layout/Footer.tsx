import { Link } from "react-router-dom";
import b2bLight from "/b2b-light.png";
import b2bDark from "/b2b-dark.png";
import { useTheme } from "../../context/ThemeContext";
import { IconShield, IconGithub } from "../common/Icons";
import { useLocale } from "../../context/LocaleContext";

// TODO: replace with the real repository URL once the GitHub repo exists.
const GITHUB_REPO_URL = "https://github.com/iannstronaut/box2box";

type FooterLink = { label: string; to: string };

const COLUMNS: { h: string; links: FooterLink[] }[] = [
  {
    h: "footer.col.product",
    links: [
      { label: "footer.link.overview", to: "/docs#overview" },
      { label: "footer.link.workspace", to: "/workspace" },
      { label: "footer.link.formats", to: "/docs#formats" },
      { label: "footer.link.changelog", to: "/docs#changelog" },
    ],
  },
  {
    h: "footer.col.annotate",
    links: [
      { label: "footer.link.detection", to: "/docs#detection" },
      { label: "footer.link.classification", to: "/docs#classification" },
      { label: "footer.link.export", to: "/docs#export" },
      { label: "footer.link.shortcuts", to: "/docs#shortcuts" },
    ],
  },
  {
    h: "footer.col.formats",
    links: [
      { label: "YOLO", to: "/docs#format-yolo" },
      { label: "COCO", to: "/docs#format-coco" },
      { label: "Pascal VOC", to: "/docs#format-voc" },
      { label: "JSON", to: "/docs#format-json" },
    ],
  },
  {
    h: "footer.col.company",
    links: [
      { label: "footer.link.about", to: "/docs#about" },
      { label: "footer.link.privacy", to: "/docs#privacy" },
      { label: "footer.link.terms", to: "/docs#terms" },
      { label: "footer.link.contact", to: "/docs#contact" },
    ],
  },
];

export function Footer() {
  const { resolved } = useTheme();
  const { t } = useLocale();
  return (
    <footer className="mt-section border-t border-hairline">
      <div className="mx-auto max-w-[1320px] px-5 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <img
                src={resolved === "dark" ? b2bDark : b2bLight}
                alt="Box2Box"
                className="h-8 w-8 object-contain"
                draggable={false}
              />
              <span className="font-display font-semibold text-[15px] tracking-tight text-on-dark">
                Box2Box
              </span>
            </Link>
            <p className="text-body-sm text-muted mt-4 max-w-[220px] leading-relaxed">
              {t("footer.tagline")}
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.h}>
              <div className="text-[13px] font-semibold font-display text-on-dark mb-4">
                {t(col.h)}
              </div>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-body-sm text-muted hover:text-on-dark transition-colors"
                    >
                      {t(l.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-hairline flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-caption text-muted">
            {t("footer.rights", { year: new Date().getFullYear() })}
          </p>
          <div className="flex items-center gap-3 text-caption text-muted">
            <span className="inline-flex items-center gap-1.5">
              <IconShield size={13} className="text-success" />
              {t("nav.localFirst")}
            </span>
            <span className="w-1 h-1 rounded-full bg-[var(--hairline-strong)]" />
            <span>v0.1.0</span>
            <span className="w-1 h-1 rounded-full bg-[var(--hairline-strong)]" />
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              title="GitHub"
              className="inline-flex items-center justify-center text-muted hover:text-on-dark transition-colors"
            >
              <IconGithub size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
