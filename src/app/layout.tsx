import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";
import { getLocale } from "@/lib/getLocale";

const inter = Inter({ subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: "bkmrX — Local X Bookmark Organizer",
  description: "Review, organize, export, and clean up X bookmarks locally.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-50 min-h-screen flex relative`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Sidebar locale={locale} />
          <main className="flex-1 flex flex-col h-screen overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {children}
            </div>
          </main>
          <Toaster theme="system" />
        </ThemeProvider>
      </body>
    </html>
  );
}
