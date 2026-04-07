import "./globals.css";

export const metadata = {
  title: "DentaFind — Find Your Perfect Dentist",
  description: "Browse verified dentists near you, read genuine reviews, chat before you book, and schedule appointments in seconds. Your dental health companion.",
  keywords: "dentist, dental, booking, appointment, teeth, dental care, India, Delhi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0a12" />
      </head>
      <body>{children}</body>
    </html>
  );
}
