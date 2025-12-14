import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SehatScan - AI-Powered Health Risk Assessment",
  description:
    "Transform your medical reports and photos into actionable health insights using advanced AI and computer vision technology.",
  icons: {
    icon: "/logo.svg",
  },
};

import { ThemeProvider } from "./context/ThemeContext";
import { SessionProvider } from "./components/SessionProvider";
import { Toaster } from "react-hot-toast";
import { validateEnvironmentOnStartup } from "@/lib/env-validation";

// Validate environment variables on startup (server-side only)
if (typeof window === "undefined") {
  validateEnvironmentOnStartup();
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth dark">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'dark';
                document.documentElement.className = 'scroll-smooth' + (theme === 'dark' ? ' dark' : '');
              } catch (e) {
                document.documentElement.className = 'scroll-smooth dark';
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${poppins.variable} antialiased`}>
        <SessionProvider>
          <ThemeProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#363636",
                  color: "#fff",
                },
                success: {
                  style: {
                    background: "#10B981",
                  },
                },
                error: {
                  style: {
                    background: "#EF4444",
                  },
                },
              }}
            />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
