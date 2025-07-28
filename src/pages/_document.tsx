import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="de" suppressHydrationWarning>
      <Head>
        <meta name="description" content="Polizei-Technisches Logistik-System" />
      </Head>
      <body suppressHydrationWarning>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 