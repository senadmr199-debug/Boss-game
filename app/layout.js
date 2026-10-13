import "./globals.css";

export const metadata = {
  title: "BOSS GAME",
  description: "BOSS GAME oyun platformu",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
