import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "./utils/providers/I18nProvider";
import { ThemeProvider } from "./utils/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "Truss Web Framework",
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
        <I18nProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
