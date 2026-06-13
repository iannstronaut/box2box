// Structured, bilingual documentation content for the Docs page.
// Kept separate from the short-string i18n dictionary (translations.ts) because
// docs are long-form prose; here we store full content per locale and pick by
// the active locale at render time.

import type { Locale } from "./translations";

export type DocBlock =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "code"; code: string }
  | { kind: "note"; text: string }
  | { kind: "table"; head: string[]; rows: string[][] };

export interface DocSection {
  id: string;
  group: string;
  title: string;
  blocks: DocBlock[];
}

export interface DocGroup {
  id: string;
  label: string;
}

export interface DocsContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  tocLabel: string;
  backToTop: string;
  groups: DocGroup[];
  sections: DocSection[];
}

// ---------------------------------------------------------------------------
// English (US)
// ---------------------------------------------------------------------------
const en: DocsContent = {
  eyebrow: "Documentation",
  title: "Box2Box, explained",
  subtitle:
    "Everything you need to go from a folder of images to a training-ready dataset — without uploading anything. Box2Box runs entirely in your browser.",
  tocLabel: "On this page",
  backToTop: "Back to top",
  groups: [
    { id: "start", label: "Getting started" },
    { id: "annotate", label: "Annotating" },
    { id: "formats", label: "Exporting & formats" },
    { id: "about", label: "About" },
  ],
  sections: [
    {
      id: "overview",
      group: "start",
      title: "Overview",
      blocks: [
        {
          kind: "p",
          text: "Box2Box is a local-first annotation studio for computer vision. It helps you label images for two tasks: object detection (drawing bounding boxes) and image classification (tagging whole images), then export the result into the format your training pipeline expects.",
        },
        {
          kind: "p",
          text: "Because everything runs on your own machine, your images and labels never leave your device. There is no account, no server, and no upload step.",
        },
        { kind: "h", text: "What you can do" },
        {
          kind: "ul",
          items: [
            "Open a local folder of images and edit labels in place.",
            "Draw, move, and resize bounding boxes for detection.",
            "Tag images with one or more classes for classification.",
            "Manage classes with custom colors and number hotkeys.",
            "Export to YOLO, COCO, Pascal VOC, JSON, CSV, or JSON Lines.",
            "Work entirely offline, keyboard-first.",
          ],
        },
        {
          kind: "note",
          text: "Box2Box uses the browser File System Access API to read and write files. It works best in Chromium-based browsers such as Chrome and Edge.",
        },
      ],
    },
    {
      id: "workspace",
      group: "start",
      title: "The workspace",
      blocks: [
        {
          kind: "p",
          text: "The workspace is where you do all your labeling. Open it from the top navigation (Open studio) or the Open folder button.",
        },
        { kind: "h", text: "Opening a folder" },
        {
          kind: "ol",
          items: [
            "Click Open folder and choose the directory that holds your images.",
            "Grant the browser permission to read (and optionally write) that folder.",
            "Box2Box scans the folder, lists every image, and automatically loads any labels it already finds.",
            "Pick an image from the left panel to start labeling.",
          ],
        },
        { kind: "h", text: "Trying a demo" },
        {
          kind: "p",
          text: "Not ready to open your own files? Use Try detection demo or Try classification demo to explore a small sample dataset instantly.",
        },
        { kind: "h", text: "Expected folder layout" },
        {
          kind: "p",
          text: "Box2Box looks for an images folder and a matching labels folder. Each label file shares the file name of its image.",
        },
        {
          kind: "code",
          code: "root/\n├── images/\n│   ├── img_001.jpg\n│   ├── img_002.jpg\n│   └── ...\n└── labels/\n    ├── img_001.txt\n    ├── img_002.txt\n    └── ...",
        },
        {
          kind: "note",
          text: "Nothing is uploaded. Files are read directly from disk, and exports are written back to the same folder (or downloaded) only when you choose to save.",
        },
      ],
    },
    {
      id: "detection",
      group: "annotate",
      title: "Detection mode",
      blocks: [
        {
          kind: "p",
          text: "Detection mode is for drawing bounding boxes around objects. Each box belongs to exactly one class.",
        },
        { kind: "h", text: "Drawing a box" },
        {
          kind: "ol",
          items: [
            "Select a class in the right sidebar (or just start drawing — new boxes use the active class).",
            "Click and drag on the image to draw a rectangle.",
            "Release to create the box. It becomes selected automatically.",
          ],
        },
        { kind: "h", text: "Editing a box" },
        {
          kind: "ul",
          items: [
            "Click a box to select it.",
            "Drag any of the eight handles to resize it.",
            "Press Delete or Backspace to remove the selected box.",
            "The size in pixels is shown beneath the selected box.",
          ],
        },
        {
          kind: "note",
          text: "If you draw before choosing a class, the box is labeled unclass so you never lose work. Re-assign it later from the annotation list.",
        },
      ],
    },
    {
      id: "classification",
      group: "annotate",
      title: "Classification mode",
      blocks: [
        {
          kind: "p",
          text: "Classification mode tags an entire image instead of drawing regions. A single image can carry one or several class tags.",
        },
        {
          kind: "ol",
          items: [
            "Open a folder (or demo) that was loaded in classification mode.",
            "Select an image from the left panel.",
            "Click the class chips along the bottom bar to toggle tags on or off.",
          ],
        },
        {
          kind: "p",
          text: "Active tags are highlighted with the class color. Click a chip again to remove that tag.",
        },
        {
          kind: "note",
          text: "If you have not created any classes yet, add them from the Classes tab in the right sidebar first.",
        },
      ],
    },
    {
      id: "classes",
      group: "annotate",
      title: "Managing classes",
      blocks: [
        {
          kind: "p",
          text: "Classes are shared across the whole dataset. Manage them from the Classes tab in the right sidebar.",
        },
        {
          kind: "ul",
          items: [
            "Add a class by typing a name and pressing Add.",
            "Click the color swatch to change a class color.",
            "Each of the first nine classes gets a number hotkey (1–9) so you can switch instantly.",
            "The built-in unclass class catches any box drawn before a class is chosen.",
          ],
        },
      ],
    },
    {
      id: "canvas",
      group: "annotate",
      title: "Canvas controls",
      blocks: [
        {
          kind: "p",
          text: "The canvas supports smooth zooming and panning so you can work precisely, even on very large images.",
        },
        {
          kind: "table",
          head: ["Action", "How"],
          rows: [
            ["Zoom in / out", "Scroll, or Ctrl / Cmd with + or −"],
            ["Pan", "Shift-drag, Space-drag, or middle-mouse drag"],
            ["Fit to screen", "Press F or 0"],
            ["Reset to 100%", "Press 1"],
            ["Jump around", "Click the minimap in the top-right corner"],
          ],
        },
        {
          kind: "p",
          text: "A live readout at the bottom shows the current box count and zoom level.",
        },
      ],
    },
    {
      id: "shortcuts",
      group: "annotate",
      title: "Keyboard shortcuts",
      blocks: [
        {
          kind: "table",
          head: ["Keys", "Action"],
          rows: [
            ["Scroll", "Zoom in / out"],
            ["Ctrl / Cmd  +  /  −", "Zoom in / out"],
            ["Shift-drag / Space-drag", "Pan around"],
            ["Drag", "Draw a box"],
            ["Delete", "Remove selected box"],
            ["F  /  0", "Fit to screen"],
            ["1", "Reset to 100%"],
            ["[  /  P", "Previous image"],
            ["]  /  N", "Next image"],
            ["1 – 9", "Pick class by number"],
            ["Ctrl / Cmd + S", "Export everything"],
            ["Esc", "Close dialog"],
            ["?", "Open the in-app shortcut list"],
          ],
        },
      ],
    },
    {
      id: "export",
      group: "formats",
      title: "Exporting",
      blocks: [
        {
          kind: "p",
          text: "When your labels are ready, export them from the top bar. Box2Box converts your work into the format you choose.",
        },
        { kind: "h", text: "How saving works" },
        {
          kind: "ul",
          items: [
            "If you granted write access, the export is written straight into your folder (for example, a labels folder).",
            "Otherwise the file is offered as a download.",
            "A progress overlay appears while large datasets are written.",
          ],
        },
        { kind: "h", text: "Available formats" },
        {
          kind: "ul",
          items: [
            "Detection: YOLO, COCO, Pascal VOC, JSON.",
            "Classification: CSV, JSON Lines, JSON.",
          ],
        },
        {
          kind: "note",
          text: "Press Ctrl / Cmd + S at any time to export everything.",
        },
      ],
    },
    {
      id: "formats",
      group: "formats",
      title: "Formats overview",
      blocks: [
        {
          kind: "p",
          text: "Box2Box supports the most common dataset formats so it drops into your existing pipeline. The sections below describe each one and when to use it.",
        },
      ],
    },
    {
      id: "format-yolo",
      group: "formats",
      title: "YOLO",
      blocks: [
        {
          kind: "p",
          text: "YOLO uses one plain-text .txt file per image, sharing the image file name. Each line is one box, with coordinates normalized to the range 0–1 relative to the image size.",
        },
        {
          kind: "p",
          text: "Each line is: class_id center_x center_y width height",
        },
        {
          kind: "code",
          code: "# img_001.txt\n0 0.523 0.491 0.218 0.336\n2 0.140 0.778 0.090 0.144",
        },
        {
          kind: "ul",
          items: [
            "class_id is the zero-based index of the class.",
            "center_x and center_y are the box center, divided by image width and height.",
            "width and height are the box size, divided by image width and height.",
            "A classes.txt file lists class names, one per line, in index order.",
          ],
        },
      ],
    },
    {
      id: "format-coco",
      group: "formats",
      title: "COCO",
      blocks: [
        {
          kind: "p",
          text: "COCO stores the whole dataset in a single JSON file with three main arrays: images, annotations, and categories. Bounding boxes use absolute pixel values.",
        },
        {
          kind: "p",
          text: "Each bbox is [x, y, width, height], where x and y are the top-left corner in pixels.",
        },
        {
          kind: "code",
          code: '{\n  "images": [\n    { "id": 1, "file_name": "img_001.jpg", "width": 1280, "height": 720 }\n  ],\n  "annotations": [\n    { "id": 1, "image_id": 1, "category_id": 1, "bbox": [669, 354, 279, 242], "area": 67518, "iscrowd": 0 }\n  ],\n  "categories": [\n    { "id": 1, "name": "person" }\n  ]\n}',
        },
      ],
    },
    {
      id: "format-voc",
      group: "formats",
      title: "Pascal VOC",
      blocks: [
        {
          kind: "p",
          text: "Pascal VOC uses one XML file per image. Each object is described by its class name and a pixel bounding box with xmin, ymin, xmax, and ymax corners.",
        },
        {
          kind: "code",
          code: "<annotation>\n  <filename>img_001.jpg</filename>\n  <size>\n    <width>1280</width>\n    <height>720</height>\n    <depth>3</depth>\n  </size>\n  <object>\n    <name>person</name>\n    <bndbox>\n      <xmin>669</xmin>\n      <ymin>354</ymin>\n      <xmax>948</xmax>\n      <ymax>596</ymax>\n    </bndbox>\n  </object>\n</annotation>",
        },
      ],
    },
    {
      id: "format-json",
      group: "formats",
      title: "JSON",
      blocks: [
        {
          kind: "p",
          text: "The native Box2Box JSON keeps the full project in one readable file — handy for backups or your own scripts. It includes every image, its boxes, and the class list.",
        },
        {
          kind: "code",
          code: '{\n  "classes": [\n    { "id": "c1", "name": "person", "color": "#1c69d4" }\n  ],\n  "images": [\n    {\n      "name": "img_001.jpg",\n      "width": 1280,\n      "height": 720,\n      "boxes": [\n        { "class": "person", "x": 669, "y": 354, "w": 279, "h": 242 }\n      ]\n    }\n  ]\n}',
        },
      ],
    },
    {
      id: "format-csv",
      group: "formats",
      title: "CSV (classification)",
      blocks: [
        {
          kind: "p",
          text: "For classification, CSV is the simplest export: a header row followed by one row per image-tag pair.",
        },
        {
          kind: "code",
          code: "filename,label\nimg_001.jpg,cat\nimg_002.jpg,dog\nimg_002.jpg,outdoor",
        },
        {
          kind: "note",
          text: "An image with several tags appears on several rows.",
        },
      ],
    },
    {
      id: "format-jsonl",
      group: "formats",
      title: "JSON Lines (classification)",
      blocks: [
        {
          kind: "p",
          text: "JSON Lines (.jsonl) stores one JSON object per line. It streams well and is easy to read line by line in data pipelines.",
        },
        {
          kind: "code",
          code: '{"filename": "img_001.jpg", "labels": ["cat"]}\n{"filename": "img_002.jpg", "labels": ["dog", "outdoor"]}',
        },
      ],
    },
    {
      id: "about",
      group: "about",
      title: "About Box2Box",
      blocks: [
        {
          kind: "p",
          text: "Box2Box is a focused, local-first tool for building computer-vision datasets. It favors speed, calm design, and open formats over lock-in.",
        },
        { kind: "p", text: "Version 0.1.0." },
      ],
    },
    {
      id: "privacy",
      group: "about",
      title: "Privacy",
      blocks: [
        {
          kind: "p",
          text: "Box2Box is private by design. Your images and labels are read directly from your device and are never uploaded to any server. There is no account and no analytics tied to your files.",
        },
        {
          kind: "ul",
          items: [
            "Files stay on your machine.",
            "Exports are written locally or downloaded by you.",
            "Closing the tab clears the in-memory session.",
          ],
        },
      ],
    },
    {
      id: "changelog",
      group: "about",
      title: "Changelog",
      blocks: [
        { kind: "h", text: "v0.1.0" },
        {
          kind: "ul",
          items: [
            "Detection and classification modes.",
            "Export to YOLO, COCO, Pascal VOC, JSON, CSV, and JSON Lines.",
            "Local folder reading and writing.",
            "Light and dark themes.",
            "English (US) and Indonesian languages.",
          ],
        },
      ],
    },
    {
      id: "terms",
      group: "about",
      title: "Terms",
      blocks: [
        {
          kind: "p",
          text: "Box2Box is provided as-is, without warranty. You are responsible for your data and for how you use exported datasets. Because processing happens locally, you keep full ownership and control of your files.",
        },
      ],
    },
    {
      id: "contact",
      group: "about",
      title: "Contact",
      blocks: [
        {
          kind: "p",
          text: "Found a bug or have a feature request? Please open an issue on the project's GitHub repository — it is the best way to reach the team and track progress.",
        },
        {
          kind: "ol",
          items: [
            "Open the GitHub repository where Box2Box is hosted.",
            "Go to the Issues tab and click New issue.",
            "Describe what you expected, what happened, and the steps to reproduce it. Screenshots help.",
          ],
        },
        {
          kind: "note",
          text: "Since Box2Box is local-first, we cannot see your files or data — so please include enough detail in the issue for us to understand the problem.",
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Bahasa Indonesia
// ---------------------------------------------------------------------------
const id: DocsContent = {
  eyebrow: "Dokumentasi",
  title: "Box2Box, dijelaskan",
  subtitle:
    "Semua yang kamu butuhkan untuk berubah dari satu folder gambar menjadi dataset yang siap dilatih — tanpa mengunggah apa pun. Box2Box berjalan sepenuhnya di browser kamu.",
  tocLabel: "Di halaman ini",
  backToTop: "Kembali ke atas",
  groups: [
    { id: "start", label: "Memulai" },
    { id: "annotate", label: "Anotasi" },
    { id: "formats", label: "Ekspor & format" },
    { id: "about", label: "Tentang" },
  ],
  sections: [
    {
      id: "overview",
      group: "start",
      title: "Ringkasan",
      blocks: [
        {
          kind: "p",
          text: "Box2Box adalah studio anotasi yang mengutamakan pemrosesan lokal untuk computer vision. Aplikasi ini membantu kamu memberi label pada gambar untuk dua tugas: deteksi objek (menggambar bounding box) dan klasifikasi gambar (memberi tag pada seluruh gambar), lalu mengekspor hasilnya ke format yang dibutuhkan pipeline pelatihan kamu.",
        },
        {
          kind: "p",
          text: "Karena semuanya berjalan di perangkat kamu sendiri, gambar dan label kamu tidak pernah keluar dari perangkat. Tidak ada akun, tidak ada server, dan tidak ada langkah unggah.",
        },
        { kind: "h", text: "Apa yang bisa kamu lakukan" },
        {
          kind: "ul",
          items: [
            "Membuka folder gambar lokal dan menyunting label langsung di tempat.",
            "Menggambar, memindahkan, dan mengubah ukuran bounding box untuk deteksi.",
            "Memberi tag satu atau beberapa kelas pada gambar untuk klasifikasi.",
            "Mengelola kelas dengan warna khusus dan pintasan angka.",
            "Mengekspor ke YOLO, COCO, Pascal VOC, JSON, CSV, atau JSON Lines.",
            "Bekerja sepenuhnya offline dan mengutamakan keyboard.",
          ],
        },
        {
          kind: "note",
          text: "Box2Box memakai File System Access API browser untuk membaca dan menulis file. Aplikasi ini bekerja paling baik di browser berbasis Chromium seperti Chrome dan Edge.",
        },
      ],
    },
    {
      id: "workspace",
      group: "start",
      title: "Workspace",
      blocks: [
        {
          kind: "p",
          text: "Workspace adalah tempat kamu melakukan semua pelabelan. Buka dari navigasi atas (Open studio) atau tombol Buka folder.",
        },
        { kind: "h", text: "Membuka folder" },
        {
          kind: "ol",
          items: [
            "Klik Buka folder lalu pilih direktori yang berisi gambar kamu.",
            "Beri izin browser untuk membaca (dan opsional menulis) folder tersebut.",
            "Box2Box memindai folder, mendaftar setiap gambar, dan otomatis memuat label yang sudah ada.",
            "Pilih sebuah gambar dari panel kiri untuk mulai memberi label.",
          ],
        },
        { kind: "h", text: "Mencoba demo" },
        {
          kind: "p",
          text: "Belum siap membuka file sendiri? Gunakan Coba demo deteksi atau Coba demo klasifikasi untuk menjelajahi dataset contoh kecil secara instan.",
        },
        { kind: "h", text: "Tata letak folder yang diharapkan" },
        {
          kind: "p",
          text: "Box2Box mencari folder images dan folder labels yang berpasangan. Setiap file label memakai nama file yang sama dengan gambarnya.",
        },
        {
          kind: "code",
          code: "root/\n├── images/\n│   ├── img_001.jpg\n│   ├── img_002.jpg\n│   └── ...\n└── labels/\n    ├── img_001.txt\n    ├── img_002.txt\n    └── ...",
        },
        {
          kind: "note",
          text: "Tidak ada yang diunggah. File dibaca langsung dari disk, dan hasil ekspor ditulis kembali ke folder yang sama (atau diunduh) hanya saat kamu memilih untuk menyimpan.",
        },
      ],
    },
    {
      id: "detection",
      group: "annotate",
      title: "Mode deteksi",
      blocks: [
        {
          kind: "p",
          text: "Mode deteksi dipakai untuk menggambar bounding box di sekitar objek. Setiap kotak hanya milik satu kelas.",
        },
        { kind: "h", text: "Menggambar kotak" },
        {
          kind: "ol",
          items: [
            "Pilih sebuah kelas di sidebar kanan (atau langsung menggambar — kotak baru memakai kelas yang aktif).",
            "Klik dan seret pada gambar untuk menggambar persegi panjang.",
            "Lepaskan untuk membuat kotak. Kotak itu otomatis terpilih.",
          ],
        },
        { kind: "h", text: "Menyunting kotak" },
        {
          kind: "ul",
          items: [
            "Klik sebuah kotak untuk memilihnya.",
            "Seret salah satu dari delapan pegangan untuk mengubah ukuran.",
            "Tekan Delete atau Backspace untuk menghapus kotak yang terpilih.",
            "Ukuran dalam piksel ditampilkan di bawah kotak yang terpilih.",
          ],
        },
        {
          kind: "note",
          text: "Jika kamu menggambar sebelum memilih kelas, kotak diberi label unclass agar pekerjaanmu tidak hilang. Tetapkan kelasnya nanti dari daftar anotasi.",
        },
      ],
    },
    {
      id: "classification",
      group: "annotate",
      title: "Mode klasifikasi",
      blocks: [
        {
          kind: "p",
          text: "Mode klasifikasi memberi tag pada seluruh gambar, bukan menggambar area. Satu gambar bisa membawa satu atau beberapa tag kelas.",
        },
        {
          kind: "ol",
          items: [
            "Buka folder (atau demo) yang dimuat dalam mode klasifikasi.",
            "Pilih sebuah gambar dari panel kiri.",
            "Klik chip kelas di bilah bawah untuk mengaktifkan atau menonaktifkan tag.",
          ],
        },
        {
          kind: "p",
          text: "Tag yang aktif disorot dengan warna kelasnya. Klik chip sekali lagi untuk menghapus tag itu.",
        },
        {
          kind: "note",
          text: "Jika kamu belum membuat kelas apa pun, tambahkan dulu dari tab Kelas di sidebar kanan.",
        },
      ],
    },
    {
      id: "classes",
      group: "annotate",
      title: "Mengelola kelas",
      blocks: [
        {
          kind: "p",
          text: "Kelas digunakan bersama di seluruh dataset. Kelola dari tab Kelas di sidebar kanan.",
        },
        {
          kind: "ul",
          items: [
            "Tambahkan kelas dengan mengetik nama lalu menekan Tambah.",
            "Klik kotak warna untuk mengubah warna kelas.",
            "Sembilan kelas pertama mendapat pintasan angka (1–9) agar bisa berganti seketika.",
            "Kelas bawaan unclass menampung kotak mana pun yang digambar sebelum kelas dipilih.",
          ],
        },
      ],
    },
    {
      id: "canvas",
      group: "annotate",
      title: "Kontrol kanvas",
      blocks: [
        {
          kind: "p",
          text: "Kanvas mendukung perbesaran dan geser yang mulus sehingga kamu bisa bekerja dengan presisi, bahkan pada gambar yang sangat besar.",
        },
        {
          kind: "table",
          head: ["Aksi", "Cara"],
          rows: [
            ["Perbesar / perkecil", "Scroll, atau Ctrl / Cmd dengan + atau −"],
            ["Geser", "Shift-seret, Space-seret, atau seret tombol tengah mouse"],
            ["Paskan ke layar", "Tekan F atau 0"],
            ["Atur ulang ke 100%", "Tekan 1"],
            ["Lompat cepat", "Klik minimap di pojok kanan atas"],
          ],
        },
        {
          kind: "p",
          text: "Penunjuk langsung di bagian bawah menampilkan jumlah kotak dan tingkat perbesaran saat ini.",
        },
      ],
    },
    {
      id: "shortcuts",
      group: "annotate",
      title: "Pintasan keyboard",
      blocks: [
        {
          kind: "table",
          head: ["Tombol", "Aksi"],
          rows: [
            ["Scroll", "Perbesar / perkecil"],
            ["Ctrl / Cmd  +  /  −", "Perbesar / perkecil"],
            ["Shift-seret / Space-seret", "Geser tampilan"],
            ["Seret", "Menggambar kotak"],
            ["Delete", "Hapus kotak terpilih"],
            ["F  /  0", "Paskan ke layar"],
            ["1", "Atur ulang ke 100%"],
            ["[  /  P", "Gambar sebelumnya"],
            ["]  /  N", "Gambar berikutnya"],
            ["1 – 9", "Pilih kelas berdasarkan angka"],
            ["Ctrl / Cmd + S", "Ekspor semuanya"],
            ["Esc", "Tutup dialog"],
            ["?", "Buka daftar pintasan di aplikasi"],
          ],
        },
      ],
    },
    {
      id: "export",
      group: "formats",
      title: "Mengekspor",
      blocks: [
        {
          kind: "p",
          text: "Saat label kamu siap, ekspor dari bilah atas. Box2Box mengubah pekerjaanmu ke format yang kamu pilih.",
        },
        { kind: "h", text: "Cara penyimpanan bekerja" },
        {
          kind: "ul",
          items: [
            "Jika kamu memberi izin tulis, hasil ekspor ditulis langsung ke folder kamu (misalnya folder labels).",
            "Jika tidak, file ditawarkan sebagai unduhan.",
            "Overlay progres muncul saat dataset besar sedang ditulis.",
          ],
        },
        { kind: "h", text: "Format yang tersedia" },
        {
          kind: "ul",
          items: [
            "Deteksi: YOLO, COCO, Pascal VOC, JSON.",
            "Klasifikasi: CSV, JSON Lines, JSON.",
          ],
        },
        {
          kind: "note",
          text: "Tekan Ctrl / Cmd + S kapan saja untuk mengekspor semuanya.",
        },
      ],
    },
    {
      id: "formats",
      group: "formats",
      title: "Ringkasan format",
      blocks: [
        {
          kind: "p",
          text: "Box2Box mendukung format dataset yang paling umum sehingga cocok dengan pipeline kamu yang sudah ada. Bagian di bawah menjelaskan masing-masing format dan kapan memakainya.",
        },
      ],
    },
    {
      id: "format-yolo",
      group: "formats",
      title: "YOLO",
      blocks: [
        {
          kind: "p",
          text: "YOLO memakai satu file teks .txt per gambar, dengan nama file yang sama. Setiap baris adalah satu kotak, dengan koordinat yang dinormalisasi ke rentang 0–1 relatif terhadap ukuran gambar.",
        },
        {
          kind: "p",
          text: "Setiap baris berbentuk: class_id center_x center_y width height",
        },
        {
          kind: "code",
          code: "# img_001.txt\n0 0.523 0.491 0.218 0.336\n2 0.140 0.778 0.090 0.144",
        },
        {
          kind: "ul",
          items: [
            "class_id adalah indeks kelas berbasis nol.",
            "center_x dan center_y adalah pusat kotak, dibagi lebar dan tinggi gambar.",
            "width dan height adalah ukuran kotak, dibagi lebar dan tinggi gambar.",
            "File classes.txt mendaftar nama kelas, satu per baris, sesuai urutan indeks.",
          ],
        },
      ],
    },
    {
      id: "format-coco",
      group: "formats",
      title: "COCO",
      blocks: [
        {
          kind: "p",
          text: "COCO menyimpan seluruh dataset dalam satu file JSON dengan tiga larik utama: images, annotations, dan categories. Bounding box memakai nilai piksel absolut.",
        },
        {
          kind: "p",
          text: "Setiap bbox berbentuk [x, y, width, height], dengan x dan y sebagai sudut kiri atas dalam piksel.",
        },
        {
          kind: "code",
          code: '{\n  "images": [\n    { "id": 1, "file_name": "img_001.jpg", "width": 1280, "height": 720 }\n  ],\n  "annotations": [\n    { "id": 1, "image_id": 1, "category_id": 1, "bbox": [669, 354, 279, 242], "area": 67518, "iscrowd": 0 }\n  ],\n  "categories": [\n    { "id": 1, "name": "person" }\n  ]\n}',
        },
      ],
    },
    {
      id: "format-voc",
      group: "formats",
      title: "Pascal VOC",
      blocks: [
        {
          kind: "p",
          text: "Pascal VOC memakai satu file XML per gambar. Setiap objek dijelaskan oleh nama kelasnya dan bounding box piksel dengan sudut xmin, ymin, xmax, dan ymax.",
        },
        {
          kind: "code",
          code: "<annotation>\n  <filename>img_001.jpg</filename>\n  <size>\n    <width>1280</width>\n    <height>720</height>\n    <depth>3</depth>\n  </size>\n  <object>\n    <name>person</name>\n    <bndbox>\n      <xmin>669</xmin>\n      <ymin>354</ymin>\n      <xmax>948</xmax>\n      <ymax>596</ymax>\n    </bndbox>\n  </object>\n</annotation>",
        },
      ],
    },
    {
      id: "format-json",
      group: "formats",
      title: "JSON",
      blocks: [
        {
          kind: "p",
          text: "JSON bawaan Box2Box menyimpan seluruh proyek dalam satu file yang mudah dibaca — berguna untuk cadangan atau skrip kamu sendiri. Berisi setiap gambar, kotak-kotaknya, dan daftar kelas.",
        },
        {
          kind: "code",
          code: '{\n  "classes": [\n    { "id": "c1", "name": "person", "color": "#1c69d4" }\n  ],\n  "images": [\n    {\n      "name": "img_001.jpg",\n      "width": 1280,\n      "height": 720,\n      "boxes": [\n        { "class": "person", "x": 669, "y": 354, "w": 279, "h": 242 }\n      ]\n    }\n  ]\n}',
        },
      ],
    },
    {
      id: "format-csv",
      group: "formats",
      title: "CSV (klasifikasi)",
      blocks: [
        {
          kind: "p",
          text: "Untuk klasifikasi, CSV adalah ekspor paling sederhana: satu baris header diikuti satu baris per pasangan gambar-tag.",
        },
        {
          kind: "code",
          code: "filename,label\nimg_001.jpg,cat\nimg_002.jpg,dog\nimg_002.jpg,outdoor",
        },
        {
          kind: "note",
          text: "Gambar dengan beberapa tag muncul di beberapa baris.",
        },
      ],
    },
    {
      id: "format-jsonl",
      group: "formats",
      title: "JSON Lines (klasifikasi)",
      blocks: [
        {
          kind: "p",
          text: "JSON Lines (.jsonl) menyimpan satu objek JSON per baris. Format ini mudah dialirkan dan dibaca baris demi baris di pipeline data.",
        },
        {
          kind: "code",
          code: '{"filename": "img_001.jpg", "labels": ["cat"]}\n{"filename": "img_002.jpg", "labels": ["dog", "outdoor"]}',
        },
      ],
    },
    {
      id: "about",
      group: "about",
      title: "Tentang Box2Box",
      blocks: [
        {
          kind: "p",
          text: "Box2Box adalah alat yang fokus dan mengutamakan pemrosesan lokal untuk membangun dataset computer vision. Aplikasi ini mengutamakan kecepatan, desain yang tenang, dan format terbuka ketimbang penguncian vendor.",
        },
        { kind: "p", text: "Versi 0.1.0." },
      ],
    },
    {
      id: "privacy",
      group: "about",
      title: "Privasi",
      blocks: [
        {
          kind: "p",
          text: "Box2Box privat secara desain. Gambar dan label kamu dibaca langsung dari perangkatmu dan tidak pernah diunggah ke server mana pun. Tidak ada akun dan tidak ada analitik yang terkait dengan file kamu.",
        },
        {
          kind: "ul",
          items: [
            "File tetap berada di perangkat kamu.",
            "Hasil ekspor ditulis secara lokal atau diunduh olehmu.",
            "Menutup tab akan menghapus sesi yang ada di memori.",
          ],
        },
      ],
    },
    {
      id: "changelog",
      group: "about",
      title: "Catatan perubahan",
      blocks: [
        { kind: "h", text: "v0.1.0" },
        {
          kind: "ul",
          items: [
            "Mode deteksi dan klasifikasi.",
            "Ekspor ke YOLO, COCO, Pascal VOC, JSON, CSV, dan JSON Lines.",
            "Membaca dan menulis folder lokal.",
            "Tema terang dan gelap.",
            "Bahasa Inggris (US) dan Indonesia.",
          ],
        },
      ],
    },
    {
      id: "terms",
      group: "about",
      title: "Ketentuan",
      blocks: [
        {
          kind: "p",
          text: "Box2Box disediakan apa adanya, tanpa jaminan. Kamu bertanggung jawab atas datamu dan atas cara kamu menggunakan dataset hasil ekspor. Karena pemrosesan terjadi secara lokal, kamu tetap memiliki kepemilikan dan kendali penuh atas file kamu.",
        },
      ],
    },
    {
      id: "contact",
      group: "about",
      title: "Kontak",
      blocks: [
        {
          kind: "p",
          text: "Menemukan bug atau punya permintaan fitur? Silakan buka issue di repo GitHub proyek ini — itu cara terbaik untuk menghubungi tim dan memantau perkembangannya.",
        },
        {
          kind: "ol",
          items: [
            "Buka repo GitHub tempat Box2Box dihosting.",
            "Masuk ke tab Issues lalu klik New issue.",
            "Jelaskan apa yang kamu harapkan, apa yang terjadi, dan langkah untuk menirunya. Tangkapan layar sangat membantu.",
          ],
        },
        {
          kind: "note",
          text: "Karena Box2Box mengutamakan pemrosesan lokal, kami tidak bisa melihat file atau data kamu — jadi mohon sertakan detail yang cukup pada issue agar kami memahami masalahnya.",
        },
      ],
    },
  ],
};

export const DOCS: Record<Locale, DocsContent> = { en, id };
