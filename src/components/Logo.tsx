interface LogoProps {
  className?: string;
}

/**
 * Marca FIZ — SVG inline em `currentColor`, herdando `text-text`.
 * Adapta-se ao tema claro/escuro sem trocar de arquivo.
 */
export function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 96 32"
      role="img"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <circle
        cx="16"
        cy="16"
        r="12"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        d="M10.5 16.5l4 4 7-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="34"
        y="23.5"
        fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
        fontWeight="700"
        fontSize="21"
        letterSpacing="0.5"
        fill="currentColor"
      >
        FIZ
      </text>
    </svg>
  );
}
