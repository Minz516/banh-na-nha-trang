type IconProps = { className?: string };

export function ZaloIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" fill="#0068FF" />
      <text
        x="12"
        y="16.3"
        textAnchor="middle"
        fontSize="10.5"
        fontWeight="700"
        fontFamily="Arial, Helvetica, sans-serif"
        fill="#fff"
      >
        Zalo
      </text>
    </svg>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path
        d="M13.6 20v-6.6h2.2l.3-2.6h-2.5V9.1c0-.75.2-1.27 1.28-1.27H16V5.5A17 17 0 0 0 14.2 5.4c-1.85 0-3.1 1.13-3.1 3.2v1.78H9v2.6h2.1V20h2.5Z"
        fill="#fff"
      />
    </svg>
  );
}

export function TiktokIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" fill="#010101" />
      <path
        d="M15.9 5.5a3.4 3.4 0 0 0 2.4 2.05v2.1a5.5 5.5 0 0 1-2.4-.66v4.51a4.1 4.1 0 1 1-4.1-4.1c.14 0 .28 0 .41.02v2.13a2 2 0 1 0 1.59 1.96V5.5h2.1Z"
        fill="#fff"
      />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" fill="#E4405F" />
      <rect x="6.5" y="6.5" width="11" height="11" rx="3" stroke="#fff" strokeWidth="1.3" />
      <circle cx="12" cy="12" r="2.8" stroke="#fff" strokeWidth="1.3" />
      <circle cx="15.3" cy="8.7" r="0.8" fill="#fff" />
    </svg>
  );
}
