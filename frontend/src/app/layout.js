import "./globals.css";
import ConditionalWrapper from "./components/ConditionalWrapper";

export const metadata = {
  title: "WasteWise",
  description: "Smart waste management for a greener future",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </head>
      <body>
        <ConditionalWrapper>
          {children}
        </ConditionalWrapper>
      </body>
    </html>
  );
}
