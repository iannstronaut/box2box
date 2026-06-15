// Lightweight, dependency-free i18n dictionary for Box2Box.
// Two languages are supported: English (US) and Indonesian.
// Placeholders use single braces, e.g. "{count} files", and are filled by translate().

export type Locale = "en" | "id";

type Dict = Record<string, string>;

const en: Dict = {
  // ---- common ----
  "common.add": "Add",
  "common.close": "Close",
  "common.box": "box",
  "common.boxes": "boxes",
  "common.tag": "tag",
  "common.tags": "tags",
  "common.file": "file",
  "common.files": "files",

  // ---- top nav (landing) ----
  "nav.overview": "Overview",
  "nav.workspace": "Workspace",
  "nav.features": "Features",
  "nav.formats": "Formats",
  "nav.docs": "Docs",
  "nav.localFirst": "Local-first",
  "nav.openStudio": "Open studio",

  // ---- hero ----
  "hero.badge": "Local-first · nothing leaves your device",
  "hero.titleLine1": "Box images.",
  "hero.titlePre": "Build datasets that are ",
  "hero.titleHighlight": "training-ready.",
  "hero.subtitle":
    "A calm, fast studio for object detection and image classification. Draw boxes, tag images, and export straight to YOLO, COCO, Pascal VOC, or JSON — all on your own machine.",
  "hero.startAnnotating": "Start annotating",
  "hero.seeHow": "See how it works",
  "hero.point1": "No account needed",
  "hero.point2": "Works offline",
  "hero.point3": "Free & open formats",
  "hero.savedToLabels": "Saved to /labels",
  "hero.boxesClasses": "3 boxes · 3 classes",

  // ---- strip stats ----
  "strip.onDevice": "On-device",
  "strip.exportFormats": "Export formats",
  "strip.cloudUploads": "Cloud uploads",
  "strip.keyboardFirst": "Keyboard-first",

  // ---- features ----
  "features.eyebrow": "Why Box2Box",
  "features.title": "Built to get out of your way.",
  "features.subtitle":
    "Thoughtful defaults, gentle motion, and shortcuts for everything — so you can stay in flow while you label.",
  "features.openFolder.title": "Open a folder",
  "features.openFolder.desc":
    "Use your OS file picker. Box2Box reads images and existing labels in place — nothing is uploaded.",
  "features.draw.title": "Draw to annotate",
  "features.draw.desc":
    "Click and drag precise boxes, switch classes instantly, and fine-tune with resize handles.",
  "features.keyboard.title": "Keyboard-first",
  "features.keyboard.desc":
    "Class hotkeys, next / previous image, fit, delete, and save — your hands stay on the keyboard.",
  "features.anyFormat.title": "Any format",
  "features.anyFormat.desc":
    "YOLO, COCO, Pascal VOC, or plain JSON. Import existing datasets or start completely fresh.",
  "features.instant.title": "Instant & smooth",
  "features.instant.desc":
    "Buttery zoom, pan, and a live minimap keep large images responsive on any machine.",
  "features.private.title": "Private by design",
  "features.private.desc":
    "No backend, no telemetry, no cloud. The File System Access API keeps everything on disk.",

  // ---- formats ----
  "formats.eyebrow": "Export",
  "formats.title": "Drops straight into your pipeline.",
  "formats.bodyA":
    "Choose a format per project. Box2Box writes labels into your local ",
  "formats.bodyB":
    " folder using the matching image name — ready for Ultralytics, MMDetection, Detectron2, or your own trainer.",
  "formats.classNote":
    "Working in classification mode? Box2Box switches to image-level labels and exports as CSV or JSON Lines instead.",
  "formats.yolo.desc":
    "Normalized class, cx, cy, w, h. Pair with classes.txt for Ultralytics in one step.",
  "formats.coco.desc":
    "A single JSON with images, categories, and bboxes. Native to MMDetection & Detectron2.",
  "formats.voc.desc":
    "Per-image XML with absolute pixel boxes — the legacy standard that still works everywhere.",
  "formats.json.desc":
    "A clean, human-readable schema per image. Easy to read and easy to transform.",
  "formats.csv.desc":
    "Classification mode — one row per image (filename, labels). Opens in any spreadsheet or pandas.",
  "formats.jsonl.desc":
    "Classification mode — one JSON object per line. Stream-friendly for large datasets.",

  // ---- CTA ----
  "cta.eyebrow": "Ready when you are",
  "cta.title": "Your dataset. Your disk. Your model.",
  "cta.body":
    "Open a folder and start drawing in seconds. No sign-up, no upload, no waiting.",

  // ---- footer ----
  "footer.tagline":
    "A calm, local-first studio for building training-ready image datasets.",
  "footer.rights":
    "© {year} Box2Box by iannstronaut · Your images and labels never leave your device.",
  "footer.col.product": "Product",
  "footer.col.annotate": "Annotate",
  "footer.col.formats": "Formats",
  "footer.col.company": "Company",
  "footer.link.overview": "Overview",
  "footer.link.workspace": "Workspace",
  "footer.link.formats": "Formats",
  "footer.link.changelog": "Changelog",
  "footer.link.detection": "Object detection",
  "footer.link.classification": "Classification",
  "footer.link.export": "Export",
  "footer.link.shortcuts": "Shortcuts",
  "footer.link.about": "About",
  "footer.link.privacy": "Privacy",
  "footer.link.terms": "Terms",
  "footer.link.contact": "Contact",

  // ---- get-boxes modal ----
  "modal.step": "Step 1 of 2",
  "modal.title": "What are you labeling?",
  "modal.subtitle":
    "Pick a mode and Box2Box tailors the canvas and export formats to match. You’ll choose your image folder next.",
  "modal.detection.tag": "Bounding boxes",
  "modal.detection.title": "Object detection",
  "modal.detection.desc":
    "Draw boxes around objects in each image. Exports to YOLO, COCO or Pascal VOC.",
  "modal.classification.tag": "Image tags",
  "modal.classification.title": "Classification",
  "modal.classification.desc":
    "Tag each image with one or more labels. Exports to a single labels.json.",
  "modal.neverUploaded": "Your folder is never uploaded.",
  "modal.press": "Press",
  "modal.toClose": "to close",
  "modal.chooseThis": "Choose this",

  // ---- alerts ----
  "alert.noFsLanding":
    "This browser can’t open local folders yet. Try Chrome, Edge, or another Chromium-based browser — or explore the demo inside the studio.",
  "alert.noFsWorkspace":
    "This browser can’t open local folders yet. Try Chrome or Edge — or explore a demo dataset below.",
  "alert.cantOpenFolder": "Couldn’t open that folder.",

  // ---- workspace empty state ----
  "ws.eyebrow": "Workspace",
  "ws.emptyTitle": "Open a folder to start.",
  "ws.emptyBody":
    "Box2Box reads your images and labels right where they live — nothing is uploaded. New here? Try a demo dataset first.",
  "ws.openFolder": "Open folder",
  "ws.tryDetection": "Try detection demo",
  "ws.tryClassification": "Try classification demo",
  "ws.expectedLayout": "Expected folder layout",
  "ws.goodToKnow": "Good to know",
  "ws.note1": "Your files never leave your device.",
  "ws.note2": "Existing labels are detected and drawn automatically.",
  "ws.note3pre": "Press",
  "ws.note3post": "anytime for shortcuts.",
  "ws.selectImage": "Select an image from the left to begin.",

  // ---- export overlay ----
  "export.exporting": "Exporting your dataset",
  "export.working": "Working…",

  // ---- import overlay ----
  "import.importing": "Importing project",
  "import.folder": "Opening folder…",
  "import.images": "Reading images",
  "import.labels": "Reading labels",
  "import.detect": "Detecting label format…",
  "import.working": "Working…",

  // ---- help / shortcuts ----
  "help.shortcuts": "Shortcuts",
  "help.button": "Keyboard shortcuts",
  "help.subtitle": "Everything you need stays under your fingertips.",
  "help.group.canvas": "Canvas",
  "help.group.navigate": "Navigate",
  "help.group.annotate": "Annotate",
  "help.group.export": "Export",
  "help.group.general": "General",
  "help.zoom": "Zoom in / out",
  "help.pan": "Pan around",
  "help.draw": "Draw a box",
  "help.remove": "Remove selected box",
  "help.fit": "Fit to screen",
  "help.reset": "Reset to 100%",
  "help.prev": "Previous image",
  "help.next": "Next image",
  "help.pickClass": "Pick class by number",
  "help.exportAll": "Export everything",
  "help.closeDialog": "Close dialog",

  // ---- top bar (workspace) ----
  "topbar.detection": "Detection",
  "topbar.classification": "Classification",
  "topbar.prev": "Previous image",
  "topbar.prevTitle": "Previous image ( [ or P )",
  "topbar.next": "Next image",
  "topbar.nextTitle": "Next image ( ] or N )",
  "topbar.statBoxes": "{boxes} boxes · {classes} classes",
  "topbar.statTagged": "{tagged} tagged · {classes} classes",
  "topbar.import": "Import",
  "topbar.importTitle": "Import class names from a .txt file",
  "topbar.addImages": "Add",
  "topbar.addTitle": "Add more images",
  "topbar.export": "Export",
  "topbar.exportTitle": "Export dataset ( ⌘/Ctrl + S )",
  "topbar.closeConfirm": "Close this workspace and return home?",
  "topbar.closeWorkspace": "Close workspace",

  // ---- export dropdown ----
  "dropdown.choose": "Choose an export format",
  "dropdown.writesDirect": "Writes directly to your /labels folder.",
  "dropdown.willDownload": "No folder open — files will download instead.",
  "dropdown.classFormats": " These formats are built for image classification.",
  "dropdown.saved": "Saved {count} {files} to /labels",
  "dropdown.downloaded": "Downloaded {count} {files}",
  "dropdown.error": "Something went wrong: {message}",

  // ---- annotation list ----
  "list.annotations": "Annotations",
  "list.classes": "Classes",
  "list.addPlaceholder": "Add a class…",
  "list.importTxt": "Import from .txt",
  "list.noClasses":
    "No classes yet. Add one above or import a .txt file to get started.",
  "list.default": "Default",
  "list.deleteClass": "Delete class",
  "list.unclassTitle":
    "Default class — boxes can be drawn and reassigned later",
  "list.setActiveTitle": "Click to set as the active class",
  "list.changeColor": "Click to change color",
  "list.changeColorAria": "Change color for {name}",
  "list.selectImageAnns": "Select an image to see its annotations.",
  "list.count": "{count} {unit}",
  "list.clearAll": "Clear all",
  "list.clearConfirm": "Remove all boxes from this image?",
  "list.noAnnotations1": "No annotations yet.",
  "list.noAnnotations2":
    "Pick a class, then drag on the canvas to draw your first box.",
  "list.changeClassTitle": "Click to change class",
  "list.unknown": "unknown",
  "list.deleteBox": "Delete box",

  // ---- image list ----
  "imagelist.images": "Images",
  "imagelist.progress": "{done} of {total} annotated",
  "imagelist.noImages": "No images yet.",

  // ---- canvas ----
  "canvas.tagImage": "Tag this image",
  "canvas.activeClass": "Active class",
  "canvas.drawingUnclass":
    "Drawing as 'unclass' — change class in the right sidebar",
  "canvas.unclass": "unclass",
  "canvas.dragHint": "Drag to draw · Shift-drag to pan · Scroll to zoom",
  "canvas.boxSelected": "Box selected",
  "canvas.zoomOut": "Zoom out",
  "canvas.zoomIn": "Zoom in",
  "canvas.resetZoom": "Click to reset to 100%",
  "canvas.fit": "Fit to screen (F)",
  "canvas.fitBtn": "Fit",
  "canvas.minimap": "Minimap · click to jump",
  "canvas.tagLabel": "Tag:",
  "canvas.createClassFirst": "Create a class first →",
};

const id: Dict = {
  // ---- common ----
  "common.add": "Tambah",
  "common.close": "Tutup",
  "common.box": "kotak",
  "common.boxes": "kotak",
  "common.tag": "tag",
  "common.tags": "tag",
  "common.file": "file",
  "common.files": "file",

  // ---- top nav (landing) ----
  "nav.overview": "Ikhtisar",
  "nav.workspace": "Workspace",
  "nav.features": "Fitur",
  "nav.formats": "Format",
  "nav.docs": "Dokumen",
  "nav.localFirst": "Berbasis lokal",
  "nav.openStudio": "Buka studio",

  // ---- hero ----
  "hero.badge": "Berbasis lokal · tidak ada yang keluar dari perangkat Anda",
  "hero.titleLine1": "Kotak-i gambar.",
  "hero.titlePre": "Bangun dataset yang ",
  "hero.titleHighlight": "siap dilatih.",
  "hero.subtitle":
    "Studio yang tenang dan cepat untuk deteksi objek dan klasifikasi gambar. Gambar kotak, beri tag, lalu ekspor langsung ke YOLO, COCO, Pascal VOC, atau JSON — semuanya di perangkat Anda sendiri.",
  "hero.startAnnotating": "Mulai anotasi",
  "hero.seeHow": "Lihat cara kerjanya",
  "hero.point1": "Tanpa akun",
  "hero.point2": "Bisa offline",
  "hero.point3": "Format gratis & terbuka",
  "hero.savedToLabels": "Tersimpan ke /labels",
  "hero.boxesClasses": "3 kotak · 3 kelas",

  // ---- strip stats ----
  "strip.onDevice": "Di perangkat",
  "strip.exportFormats": "Format ekspor",
  "strip.cloudUploads": "Unggahan cloud",
  "strip.keyboardFirst": "Berbasis keyboard",

  // ---- features ----
  "features.eyebrow": "Kenapa Box2Box",
  "features.title": "Dibuat agar tidak menghalangi Anda.",
  "features.subtitle":
    "Default yang dipikirkan matang, animasi halus, dan pintasan untuk semuanya — agar Anda tetap fokus saat melabeli.",
  "features.openFolder.title": "Buka folder",
  "features.openFolder.desc":
    "Gunakan pemilih berkas OS Anda. Box2Box membaca gambar dan label yang ada di tempatnya — tidak ada yang diunggah.",
  "features.draw.title": "Gambar untuk menganotasi",
  "features.draw.desc":
    "Klik dan seret kotak yang presisi, ganti kelas seketika, dan sesuaikan dengan pegangan ukuran.",
  "features.keyboard.title": "Berbasis keyboard",
  "features.keyboard.desc":
    "Hotkey kelas, gambar berikutnya / sebelumnya, fit, hapus, dan simpan — tangan Anda tetap di keyboard.",
  "features.anyFormat.title": "Format apa pun",
  "features.anyFormat.desc":
    "YOLO, COCO, Pascal VOC, atau JSON biasa. Impor dataset yang ada atau mulai dari nol.",
  "features.instant.title": "Instan & mulus",
  "features.instant.desc":
    "Zoom dan pan yang halus serta minimap langsung menjaga gambar besar tetap responsif di mesin apa pun.",
  "features.private.title": "Privat sejak awal",
  "features.private.desc":
    "Tanpa backend, tanpa telemetri, tanpa cloud. File System Access API menyimpan semuanya di disk.",

  // ---- formats ----
  "formats.eyebrow": "Ekspor",
  "formats.title": "Langsung masuk ke pipeline Anda.",
  "formats.bodyA":
    "Pilih format per proyek. Box2Box menulis label ke folder lokal ",
  "formats.bodyB":
    " Anda menggunakan nama gambar yang cocok — siap untuk Ultralytics, MMDetection, Detectron2, atau trainer Anda sendiri.",
  "formats.classNote":
    "Bekerja dalam mode klasifikasi? Box2Box beralih ke label tingkat gambar dan mengekspor sebagai CSV atau JSON Lines.",
  "formats.yolo.desc":
    "Kelas ternormalisasi, cx, cy, w, h. Padukan dengan classes.txt untuk Ultralytics dalam satu langkah.",
  "formats.coco.desc":
    "Satu JSON berisi gambar, kategori, dan bbox. Native untuk MMDetection & Detectron2.",
  "formats.voc.desc":
    "XML per gambar dengan kotak piksel absolut — standar lama yang masih berfungsi di mana saja.",
  "formats.json.desc":
    "Skema yang rapi dan mudah dibaca per gambar. Gampang dibaca dan diolah.",
  "formats.csv.desc":
    "Mode klasifikasi — satu baris per gambar (nama file, label). Bisa dibuka di spreadsheet apa pun atau pandas.",
  "formats.jsonl.desc":
    "Mode klasifikasi — satu objek JSON per baris. Ramah streaming untuk dataset besar.",

  // ---- CTA ----
  "cta.eyebrow": "Siap kapan pun Anda siap",
  "cta.title": "Dataset Anda. Disk Anda. Model Anda.",
  "cta.body":
    "Buka folder dan mulai menggambar dalam hitungan detik. Tanpa daftar, tanpa unggah, tanpa menunggu.",

  // ---- footer ----
  "footer.tagline":
    "Studio berbasis lokal yang tenang untuk membangun dataset gambar yang siap dilatih.",
  "footer.rights":
    "© {year} Box2Box oleh iannstronaut · Gambar dan label Anda tidak pernah keluar dari perangkat Anda.",
  "footer.col.product": "Produk",
  "footer.col.annotate": "Anotasi",
  "footer.col.formats": "Format",
  "footer.col.company": "Perusahaan",
  "footer.link.overview": "Ikhtisar",
  "footer.link.workspace": "Workspace",
  "footer.link.formats": "Format",
  "footer.link.changelog": "Changelog",
  "footer.link.detection": "Deteksi objek",
  "footer.link.classification": "Klasifikasi",
  "footer.link.export": "Ekspor",
  "footer.link.shortcuts": "Pintasan",
  "footer.link.about": "Tentang",
  "footer.link.privacy": "Privasi",
  "footer.link.terms": "Ketentuan",
  "footer.link.contact": "Kontak",

  // ---- get-boxes modal ----
  "modal.step": "Langkah 1 dari 2",
  "modal.title": "Apa yang ingin Anda labeli?",
  "modal.subtitle":
    "Pilih mode dan Box2Box menyesuaikan kanvas serta format ekspornya. Anda akan memilih folder gambar berikutnya.",
  "modal.detection.tag": "Bounding box",
  "modal.detection.title": "Deteksi objek",
  "modal.detection.desc":
    "Gambar kotak di sekitar objek pada setiap gambar. Ekspor ke YOLO, COCO, atau Pascal VOC.",
  "modal.classification.tag": "Tag gambar",
  "modal.classification.title": "Klasifikasi",
  "modal.classification.desc":
    "Beri satu atau lebih label pada tiap gambar. Ekspor ke satu file labels.json.",
  "modal.neverUploaded": "Folder Anda tidak pernah diunggah.",
  "modal.press": "Tekan",
  "modal.toClose": "untuk menutup",
  "modal.chooseThis": "Pilih ini",

  // ---- alerts ----
  "alert.noFsLanding":
    "Browser ini belum bisa membuka folder lokal. Coba Chrome, Edge, atau browser berbasis Chromium lain — atau jelajahi demo di dalam studio.",
  "alert.noFsWorkspace":
    "Browser ini belum bisa membuka folder lokal. Coba Chrome atau Edge — atau jelajahi dataset demo di bawah.",
  "alert.cantOpenFolder": "Tidak bisa membuka folder itu.",

  // ---- workspace empty state ----
  "ws.eyebrow": "Workspace",
  "ws.emptyTitle": "Buka folder untuk memulai.",
  "ws.emptyBody":
    "Box2Box membaca gambar dan label Anda langsung di tempatnya — tidak ada yang diunggah. Baru di sini? Coba dataset demo dulu.",
  "ws.openFolder": "Buka folder",
  "ws.tryDetection": "Coba demo deteksi",
  "ws.tryClassification": "Coba demo klasifikasi",
  "ws.expectedLayout": "Tata letak folder yang diharapkan",
  "ws.goodToKnow": "Yang perlu diketahui",
  "ws.note1": "File Anda tidak pernah keluar dari perangkat Anda.",
  "ws.note2": "Label yang sudah ada terdeteksi dan digambar otomatis.",
  "ws.note3pre": "Tekan",
  "ws.note3post": "kapan saja untuk pintasan.",
  "ws.selectImage": "Pilih gambar dari kiri untuk memulai.",

  // ---- export overlay ----
  "export.exporting": "Mengekspor dataset Anda",
  "export.working": "Memproses…",

  // ---- import overlay ----
  "import.importing": "Mengimpor proyek",
  "import.folder": "Membuka folder…",
  "import.images": "Membaca gambar",
  "import.labels": "Membaca label",
  "import.detect": "Mendeteksi format label…",
  "import.working": "Memproses…",

  // ---- help / shortcuts ----
  "help.shortcuts": "Pintasan",
  "help.button": "Pintasan keyboard",
  "help.subtitle": "Semua yang Anda butuhkan tetap di ujung jari.",
  "help.group.canvas": "Kanvas",
  "help.group.navigate": "Navigasi",
  "help.group.annotate": "Anotasi",
  "help.group.export": "Ekspor",
  "help.group.general": "Umum",
  "help.zoom": "Perbesar / perkecil",
  "help.pan": "Geser tampilan",
  "help.draw": "Gambar kotak",
  "help.remove": "Hapus kotak terpilih",
  "help.fit": "Paskan ke layar",
  "help.reset": "Atur ulang ke 100%",
  "help.prev": "Gambar sebelumnya",
  "help.next": "Gambar berikutnya",
  "help.pickClass": "Pilih kelas berdasarkan nomor",
  "help.exportAll": "Ekspor semua",
  "help.closeDialog": "Tutup dialog",

  // ---- top bar (workspace) ----
  "topbar.detection": "Deteksi",
  "topbar.classification": "Klasifikasi",
  "topbar.prev": "Gambar sebelumnya",
  "topbar.prevTitle": "Gambar sebelumnya ( [ atau P )",
  "topbar.next": "Gambar berikutnya",
  "topbar.nextTitle": "Gambar berikutnya ( ] atau N )",
  "topbar.statBoxes": "{boxes} kotak · {classes} kelas",
  "topbar.statTagged": "{tagged} ditandai · {classes} kelas",
  "topbar.import": "Impor",
  "topbar.importTitle": "Impor nama kelas dari file .txt",
  "topbar.addImages": "Tambah",
  "topbar.addTitle": "Tambah gambar lain",
  "topbar.export": "Ekspor",
  "topbar.exportTitle": "Ekspor dataset ( ⌘/Ctrl + S )",
  "topbar.closeConfirm": "Tutup workspace ini dan kembali ke beranda?",
  "topbar.closeWorkspace": "Tutup workspace",

  // ---- export dropdown ----
  "dropdown.choose": "Pilih format ekspor",
  "dropdown.writesDirect": "Menulis langsung ke folder /labels Anda.",
  "dropdown.willDownload":
    "Tidak ada folder terbuka — file akan diunduh sebagai gantinya.",
  "dropdown.classFormats": " Format ini dibuat untuk klasifikasi gambar.",
  "dropdown.saved": "Menyimpan {count} {files} ke /labels",
  "dropdown.downloaded": "Mengunduh {count} {files}",
  "dropdown.error": "Terjadi kesalahan: {message}",

  // ---- annotation list ----
  "list.annotations": "Anotasi",
  "list.classes": "Kelas",
  "list.addPlaceholder": "Tambah kelas…",
  "list.importTxt": "Impor dari .txt",
  "list.noClasses":
    "Belum ada kelas. Tambahkan di atas atau impor file .txt untuk memulai.",
  "list.default": "Default",
  "list.deleteClass": "Hapus kelas",
  "list.unclassTitle":
    "Kelas default — kotak bisa digambar dan dipindahkan kelasnya nanti",
  "list.setActiveTitle": "Klik untuk menjadikan kelas aktif",
  "list.changeColor": "Klik untuk mengubah warna",
  "list.changeColorAria": "Ubah warna untuk {name}",
  "list.selectImageAnns": "Pilih gambar untuk melihat anotasinya.",
  "list.count": "{count} {unit}",
  "list.clearAll": "Hapus semua",
  "list.clearConfirm": "Hapus semua kotak dari gambar ini?",
  "list.noAnnotations1": "Belum ada anotasi.",
  "list.noAnnotations2":
    "Pilih kelas, lalu seret pada kanvas untuk menggambar kotak pertama Anda.",
  "list.changeClassTitle": "Klik untuk mengubah kelas",
  "list.unknown": "tidak diketahui",
  "list.deleteBox": "Hapus kotak",

  // ---- image list ----
  "imagelist.images": "Gambar",
  "imagelist.progress": "{done} dari {total} dianotasi",
  "imagelist.noImages": "Belum ada gambar.",

  // ---- canvas ----
  "canvas.tagImage": "Beri tag gambar ini",
  "canvas.activeClass": "Kelas aktif",
  "canvas.drawingUnclass":
    "Menggambar sebagai 'unclass' — ubah kelas di sidebar kanan",
  "canvas.unclass": "unclass",
  "canvas.dragHint":
    "Seret untuk menggambar · Shift-seret untuk geser · Scroll untuk zoom",
  "canvas.boxSelected": "Kotak terpilih",
  "canvas.zoomOut": "Perkecil",
  "canvas.zoomIn": "Perbesar",
  "canvas.resetZoom": "Klik untuk atur ulang ke 100%",
  "canvas.fit": "Paskan ke layar (F)",
  "canvas.fitBtn": "Paskan",
  "canvas.minimap": "Minimap · klik untuk lompat",
  "canvas.tagLabel": "Tag:",
  "canvas.createClassFirst": "Buat kelas dulu →",
};

export const translations: Record<Locale, Dict> = { en, id };

export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>,
): string {
  const dict = translations[locale] ?? en;
  let s = dict[key];
  if (s === undefined) s = en[key] ?? key;
  if (params) {
    for (const k of Object.keys(params)) {
      s = s.split("{" + k + "}").join(String(params[k]));
    }
  }
  return s;
}
