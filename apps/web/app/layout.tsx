import "./globals.css";

export const metadata = {
  title: "Hirely",
  description:
    "Hirely is an AI job application copilot with review-first autofill, user-controlled submission, and trustworthy tracking."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
