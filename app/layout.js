import { Poppins } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/component/navbar";

const inter = Poppins({ subsets: ["latin"], weight: ["100", "500"] });

export const metadata = {
  title: "Eksperimen Named Data Networking",
  description: "Named Data Networking Indonesia",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
