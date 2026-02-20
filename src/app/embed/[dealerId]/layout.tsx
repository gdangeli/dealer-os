import "@/app/globals.css";

export const metadata = {
  title: "Fahrzeuge",
  robots: "noindex, nofollow",
};

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="m-0 p-0">
        {children}
      </body>
    </html>
  );
}
