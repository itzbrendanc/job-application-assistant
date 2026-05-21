import "./globals.css";

export const metadata = {
  title: "Job Application Assistant",
  description: "Trustworthy, compliance-first job application assistant starter"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

