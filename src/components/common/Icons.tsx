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

// GitHub mark. Uses a filled path (not the stroke-based `make` helper).
export function IconGithub({ size = 18, className, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.05-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.92 1.24 3.23 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.22.7.83.58A12 12 0 0024 12.5C24 5.87 18.63.5 12 .5z" />
    </svg>
  );
}

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

export const IconSearch = make(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </>,
);

export const IconHelp = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9a2.5 2.5 0 015 0c0 1.7-2.5 2-2.5 4" />
    <path d="M12 17h.01" />
  </>,
);

export const IconInfo = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <path d="M12 8h.01" />
  </>,
);

export const IconZoomIn = make(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="M11 8v6M8 11h6" />
    <path d="M21 21l-4.3-4.3" />
  </>,
);

export const IconZoomOut = make(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="M8 11h6" />
    <path d="M21 21l-4.3-4.3" />
  </>,
);

export const IconFit = make(
  <>
    <path d="M4 9V5a1 1 0 011-1h4" />
    <path d="M20 9V5a1 1 0 00-1-1h-4" />
    <path d="M4 15v4a1 1 0 001 1h4" />
    <path d="M20 15v4a1 1 0 01-1 1h-4" />
  </>,
);

export const IconHand = make(
  <path d="M8 13V5.5a1.5 1.5 0 013 0V11m0-1V4.5a1.5 1.5 0 013 0V11m0-.5V6a1.5 1.5 0 013 0v6.5a6.5 6.5 0 01-6.5 6.5H11a5 5 0 01-3.5-1.4L4 14.5a1.5 1.5 0 012-2.2l2 1.7" />,
);

export const IconGrid = make(
  <>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </>,
);

export const IconList = make(
  <>
    <path d="M8 6h13M8 12h13M8 18h13" />
    <path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
  </>,
);

export const IconShield = make(
  <>
    <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </>,
);

export const IconBolt = make(
  <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />,
);

export const IconRefresh = make(
  <>
    <path d="M21 12a9 9 0 11-2.6-6.4" />
    <path d="M21 3v5h-5" />
  </>,
);

export const IconExternal = make(
  <>
    <path d="M14 4h6v6" />
    <path d="M20 4l-9 9" />
    <path d="M19 14v5a1 1 0 01-1 1H6a1 1 0 01-1-1V7a1 1 0 011-1h5" />
  </>,
);

export const IconTarget = make(
  <>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
  </>,
);
