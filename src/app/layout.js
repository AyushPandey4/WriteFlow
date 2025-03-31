import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import "./globals.css";
import SyncUser from "@/components/SyncUser";
import { ThemeProvider } from "@/ThemeProvider";

export const metadata = {
  title: "WriteFlow - Your Blogging Platform",
  description: "A powerful blogging platform with AI assistance.",
  icons: {
    icon: [
      { url: "/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/favicons/apple-touch-icon.png",
    other: [{ rel: "manifest", url: "/favicons/site.webmanifest" }],
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full">
        <body className="h-full flex flex-col">
          <ThemeProvider>
            <div className="flex flex-col min-h-full">
              <Navbar />
              <SyncUser />
              <main className="flex-1 bg-gray-100 dark:bg-gray-950">
                {children}
              </main>
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
