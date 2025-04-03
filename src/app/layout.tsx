import "@/styles/globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Provider from "./provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Club Management",
    template: "%s | Club Management",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body className={inter.className}>
        <Provider>
          <div className="">{children}</div>
        </Provider>
      </body>
    </html>
  );
}
