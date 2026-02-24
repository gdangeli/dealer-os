export default function TestDriveEmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Probefahrt buchen | Dealer OS</title>
      </head>
      <body className="bg-transparent">
        {children}
      </body>
    </html>
  );
}
