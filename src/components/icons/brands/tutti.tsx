import { SVGProps } from "react";

export function TuttiIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      {/* tutti.ch - Tag/price tag icon representing classifieds */}
      <path d="M21.41 11.58l-9-9A2 2 0 0011 2H4a2 2 0 00-2 2v7a2 2 0 00.59 1.42l9 9A2 2 0 0013 22a2 2 0 001.41-.59l7-7A2 2 0 0022 13a2 2 0 00-.59-1.42zM13 20l-9-9V4h7l9 9-7 7z" />
      <circle cx="6.5" cy="6.5" r="1.5" />
    </svg>
  );
}
