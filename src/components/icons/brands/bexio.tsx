import { SVGProps } from "react";

export function BexioIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      {/* Bexio "B" stylized icon */}
      <path d="M4 2h8c2.5 0 4.5 1 5.5 2.5.8 1.2 1 2.5.8 3.8-.2 1.3-.8 2.5-1.8 3.2 1.5.5 2.7 1.5 3.3 2.8.7 1.5.7 3.2.1 4.7-.6 1.5-1.8 2.7-3.3 3.3-.9.4-1.9.6-3 .6H4V2zm4 8h3.5c.8 0 1.5-.2 2-.7.5-.4.8-1 .8-1.8s-.3-1.3-.8-1.8c-.5-.4-1.2-.7-2-.7H8v5zm0 8h4c.9 0 1.7-.3 2.3-.8.6-.5.9-1.2.9-2s-.3-1.5-.9-2c-.6-.5-1.4-.8-2.3-.8H8v5.6z" />
    </svg>
  );
}
