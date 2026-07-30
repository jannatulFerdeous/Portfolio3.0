// Tool marks, drawn from primitives rather than pasted brand path data.
// They are deliberately simplified — recognisable silhouettes in the real
// brand colours — and each card prints the tool's name underneath, so nothing
// depends on the mark alone. Swap any of these for an official SVG by
// replacing the case below.
export default function Mark({ id }) {
  switch (id) {
    case "react":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <circle cx="24" cy="24" r="4.2" fill="#61DAFB" />
          <g fill="none" stroke="#61DAFB" strokeWidth="2">
            <ellipse cx="24" cy="24" rx="19" ry="7.3" />
            <ellipse
              cx="24"
              cy="24"
              rx="19"
              ry="7.3"
              transform="rotate(60 24 24)"
            />
            <ellipse
              cx="24"
              cy="24"
              rx="19"
              ry="7.3"
              transform="rotate(120 24 24)"
            />
          </g>
        </svg>
      );

    case "next":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <g
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            fill="none"
          >
            <path d="M17 33V16l17 19" />
            <path d="M32 16v12" />
          </g>
        </svg>
      );

    case "typescript":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <rect x="5" y="5" width="38" height="38" rx="6" fill="#3178C6" />
          <text
            x="24"
            y="32"
            textAnchor="middle"
            fontSize="17"
            fontWeight="700"
            fontFamily="Space Grotesk, Helvetica, sans-serif"
            fill="#ffffff"
          >
            TS
          </text>
        </svg>
      );

    case "gsap":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <rect
            x="3"
            y="12"
            width="42"
            height="24"
            rx="12"
            fill="none"
            stroke="#0AE448"
            strokeWidth="2.2"
          />
          <text
            x="24"
            y="29"
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            letterSpacing="1"
            fontFamily="Space Grotesk, Helvetica, sans-serif"
            fill="#0AE448"
          >
            GSAP
          </text>
        </svg>
      );

    case "three":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          >
            <path d="M24 5 43 38 5 38Z" />
            <path d="M24 5 29 27M43 38 29 27M5 38 29 27" />
          </g>
        </svg>
      );

    case "figma":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path d="M17 5h7v13h-7a6.5 6.5 0 0 1 0-13Z" fill="#F24E1E" />
          <path d="M24 5h7a6.5 6.5 0 0 1 0 13h-7Z" fill="#FF7262" />
          <path d="M17 18h7v13h-7a6.5 6.5 0 0 1 0-13Z" fill="#A259FF" />
          <circle cx="30.5" cy="24.5" r="6.5" fill="#1ABCFE" />
          <path d="M17 31h7v6.5A6.5 6.5 0 1 1 17 31Z" fill="#0ACF83" />
        </svg>
      );

    case "tailwind":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <g fill="#38BDF8">
            <path d="M14 17c1.7-5 4.7-7.5 9-7.5 6.4 0 6.8 4.7 10.2 5.5 2.3.6 4.3-.2 6-2.5-1.7 5-4.7 7.5-9 7.5-6.4 0-6.8-4.7-10.2-5.5-2.3-.6-4.3.2-6 2.5Z" />
            <path d="M5 30c1.7-5 4.7-7.5 9-7.5 6.4 0 6.8 4.7 10.2 5.5 2.3.6 4.3-.2 6-2.5-1.7 5-4.7 7.5-9 7.5-6.4 0-6.8-4.7-10.2-5.5-2.3-.6-4.3.2-6 2.5Z" />
          </g>
        </svg>
      );

    case "node":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path
            d="M24 4 42 14v20L24 44 6 34V14Z"
            fill="none"
            stroke="#5FA04E"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <text
            x="24"
            y="29"
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
            fontFamily="Space Grotesk, Helvetica, sans-serif"
            fill="#5FA04E"
          >
            N
          </text>
        </svg>
      );

    case "webflow":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path
            d="M6 15 14 34 24 21 34 34 42 15"
            fill="none"
            stroke="#4353FF"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    /* The sprocket: an open ring with three spokes trailing off to nodes —
       one up-left, one straight up, one down-left. */
    case "hubspot":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true">
          {/* Drawn off-centre (the ring sits right of the spokes), so this
              recentres it and trims it to the same optical size as the
              other marks. */}
          <g transform="translate(24 24) scale(0.86) translate(-26.55 -24.8)">
            <g stroke="#FF7A59" strokeWidth="3.4" strokeLinecap="round">
              <path d="M18.6 15.6 23.2 20.2" />
              <path d="M31 10.3V17" />
              <path d="M18.6 40.4 23.2 35.8" />
            </g>
            <g fill="#FF7A59">
              <circle cx="15.4" cy="12.4" r="4.3" />
              <circle cx="31" cy="6" r="4.3" />
              <circle cx="15.4" cy="43.6" r="4.3" />
            </g>
            <circle
              cx="31"
              cy="28"
              r="9"
              fill="none"
              stroke="#FF7A59"
              strokeWidth="4"
            />
          </g>
        </svg>
      );

    case "framer":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <g fill="#BB4BFF">
            <path d="M13 5h22v11H24Z" />
            <path d="M13 16h22L24 27H13Z" />
            <path d="M13 27h11v11Z" />
          </g>
        </svg>
      );

    default:
      return null;
  }
}
