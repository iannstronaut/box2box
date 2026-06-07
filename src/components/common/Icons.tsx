type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

const make = (path: React.ReactNode) =>
  ({ size = 18, className, ...rest }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      {path}
    </svg>
  );

export const IconBox = make(
  <>
    <path d="M3 7l9-4 9 4-9 4-9-4z" />
    <path d="M3 7v10l9 4 9-4V7" />
    <path d="M12 11v10" />
  </>,
);

export const IconTag = make(
  <>
    <path d="M20 12.5L12.5 20 4 11.5V4h7.5L20 12.5z" />
    <circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none" />
  </>,
);

export const IconCrosshair = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
    <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
  </>,
);

export const IconImage = make(
  <>
    <rect x="3" y="3" width="18" height="18" />
    <circle cx="9" cy="9" r="1.6" />
    <path d="M21 16l-5-5-9 9" />
  </>,
);

export const IconFolder = make(
  <path d="M3 6a2 2 0 012-2h4l2 3h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" />,
);

export const IconArrow = make(
  <>
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </>,
);

export const IconClose = make(
  <>
    <path d="M6 6l12 12" />
    <path d="M18 6L6 18" />
  </>,
);

export const IconUpload = make(
  <>
    <path d="M12 3v12" />
    <path d="M7 8l5-5 5 5" />
    <path d="M5 21h14" />
  </>,
);

export const IconDownload = make(
  <>
    <path d="M12 21V9" />
    <path d="M7 16l5 5 5-5" />
    <path d="M5 3h14" />
  </>,
);

export const IconCheck = make(<path d="M5 12l4 4L19 7" />);

export const IconPlus = make(
  <>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </>,
);

export const IconTrash = make(
  <>
    <path d="M4 7h16" />
    <path d="M9 7V4h6v3" />
    <path d="M6 7l1 13a2 2 0 002 2h6a2 2 0 002-2l1-13" />
  </>,
);

export const IconChevronDown = make(<path d="M6 9l6 6 6-6" />);

export const IconChevronRight = make(<path d="M9 6l6 6-6 6" />);

export const IconChevronLeft = make(<path d="M15 6l-6 6 6 6" />);

export const IconKeyboard = make(
  <>
    <rect x="2" y="6" width="20" height="12" rx="1" />
    <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M10 14h.01M14 14h12" />
  </>,
);

export const IconSpark = make(
  <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.5 2.5M16 16l2.5 2.5M18.5 5.5L16 8M8 16l-2.5 2.5" />,
);

export const IconLayers = make(
  <>
    <path d="M12 3l9 5-9 5-9-5 9-5z" />
    <path d="M3 13l9 5 9-5" />
  </>,
);

export const IconLock = make(
  <>
    <rect x="5" y="11" width="14" height="9" />
    <path d="M8 11V7a4 4 0 018 0v4" />
  </>,
);

export const IconSun = make(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </>,
);

export const IconMoon = make(
  <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />,
);

export const IconMonitor = make(
  <>
    <rect x="2" y="3" width="20" height="14" rx="1" />
    <path d="M8 21h8M12 17v4" />
  </>,
);
