import { SVGProps } from "react";

export function CarauktionIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      {/* CARAUKTION - Gavel/auction hammer with car element */}
      <path d="M14.5 3L13 5.5l4 4 2.5-1.5L14.5 3z" />
      <path d="M12.5 6L5 13.5 6.5 15l7.5-7.5L12.5 6z" />
      <path d="M3 17h8v2H3v-2z" />
      <path d="M14 16.5c0-.83.67-1.5 1.5-1.5h4c.83 0 1.5.67 1.5 1.5v.5h-7v-.5z" />
      <circle cx="15.5" cy="19" r="1.5" />
      <circle cx="19.5" cy="19" r="1.5" />
      <path d="M14 17h7v1h-7z" />
    </svg>
  );
}
