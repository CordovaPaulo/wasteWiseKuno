import "./landing.module.css";

export const metadata = {
  title: "WasteWise - Smart Waste Management",
  description: "Optimize waste collection, report violations, and locate recycling centers."
};

export const dynamic = "force-static";

export default function LandingLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
        <style id="landing-style" suppressHydrationWarning>
{`body > nav,
body > footer:not(.landingFooter) { display:none !important; }
body {
  margin:0;
  padding:0;
  background:#F3FFF7;
  font-family:system-ui, Arial, sans-serif;
  -webkit-font-smoothing:antialiased;
}`}
        </style>
      </head>
      <body>{children}</body>
    </html>
  );
}