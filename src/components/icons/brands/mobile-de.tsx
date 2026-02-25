import { SVGProps } from "react";

export function MobileDeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      {/* mobile.de - Stylized M icon with car silhouette */}
      <path d="M2 6v12h20V6H2zm18 10H4V8h16v8z" />
      <path d="M6 14h12l-1.5-4H7.5L6 14zm1.5-2h9l.75 2H6.75l.75-2z" />
      <path d="M8 15a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
    </svg>
  );
}
