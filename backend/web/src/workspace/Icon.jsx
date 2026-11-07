const PATHS = {
  home: "M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  folder: "M3 6h7l2 2h9v11H3z",
  help: "M12 17v.01M9.5 9a2.5 2.5 0 115 0c0 1.7-2.5 2-2.5 4M12 21a9 9 0 110-18 9 9 0 010 18z",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "M6 6l12 12M18 6L6 18",
  search: "M11 18a7 7 0 110-14 7 7 0 010 14zM21 21l-5-5",
  back: "M15 5l-7 7 7 7",
  external: "M14 4h6v6M20 4l-9 9M18 14v6H4V6h6",
};

export default function Icon({ name, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={PATHS[name]} />
    </svg>
  );
}
