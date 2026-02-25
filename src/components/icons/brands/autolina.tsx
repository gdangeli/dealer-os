import { SVGProps } from "react";

export function AutolinaIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      {/* Autolina - Stylized "A" with car elements */}
      <path d="M12 2L3 20h3.5l1.5-3h8l1.5 3H21L12 2zm0 5l3 8H9l3-8z" />
      <circle cx="7" cy="20" r="1.5" />
      <circle cx="17" cy="20" r="1.5" />
    </svg>
  );
}
