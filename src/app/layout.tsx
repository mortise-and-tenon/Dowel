import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "./utils/providers/I18nProvider";

export const metadata: Metadata = {
  title: "Truss tauri Framework",
  description: "Truss Web Framework Project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
