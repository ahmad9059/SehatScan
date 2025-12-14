import type { Metadata } from "next";
import { Inter, Poppins, Noto_Nastaliq_Urdu } from "next/font/google";
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

const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
  variable: "--font-urdu",
  weight: ["400", "500", "600", "700"],
  subsets: ["arabic"],
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

import { ThemeProvider } from "./components/ThemeProvider";
import { SessionProvider } from "./components/SessionProvider";
import { SimpleLanguageProvider } from "./components/SimpleLanguageContext";
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
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css"
        />
      </head>
      <body
        className={`${inter.variable} ${poppins.variable} ${notoNastaliqUrdu.variable} antialiased`}
      >
        <SessionProvider>
          <SimpleLanguageProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem={true}
              disableTransitionOnChange={false}
              storageKey="theme"
            >
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
          </SimpleLanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
