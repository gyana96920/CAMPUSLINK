import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CampusLink | Placement Portal",
  description: "Student, placement cell, and recruiter placement portal",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
