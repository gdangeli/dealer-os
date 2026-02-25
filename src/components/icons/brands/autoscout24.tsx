import { SVGProps } from "react";

export function AutoScout24Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      {/* AutoScout24 - Stylized AS24 car icon */}
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
      <path d="M7.5 14.5h9a1.5 1.5 0 001.5-1.5v-2a1.5 1.5 0 00-1.5-1.5l-1-2.5H8.5l-1 2.5A1.5 1.5 0 006 11v2a1.5 1.5 0 001.5 1.5zm.75-3a.75.75 0 110-1.5.75.75 0 010 1.5zm7.5 0a.75.75 0 110-1.5.75.75 0 010 1.5z" />
    </svg>
  );
}
