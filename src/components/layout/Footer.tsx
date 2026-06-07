import { MStripe } from "../common/MStripe";

export function Footer() {
  return (
    <footer className="mt-section border-t border-hairline">
      <MStripe />
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {[
            {
              h: "Product",
              links: ["Overview", "Workspace", "Formats", "Changelog"],
            },
            {
              h: "Annotation",
              links: ["Object Detection", "Classification", "Export", "Shortcuts"],
            },
            {
              h: "Resources",
              links: ["YOLO", "COCO", "Pascal VOC", "Documentation"],
            },
            {
              h: "Company",
              links: ["About", "Privacy", "Terms", "Contact"],
            },
          ].map((col) => (
            <div key={col.h}>
              <div className="type-label text-on-dark mb-4">{col.h}</div>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-body-sm text-body hover:text-on-dark transition-colors"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-hairline flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-caption text-muted">
            © {new Date().getFullYear()} BOX2BOX. All rights reserved. Images
            and labels stay on your device.
          </p>
          <div className="flex items-center gap-4 text-caption text-muted">
            <span>v0.1.0</span>
            <span>·</span>
            <span>LOCAL-FIRST</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
