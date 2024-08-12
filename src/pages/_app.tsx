'use client'

import { type AppType } from "next/app";
import React from "react";
import { WagmiConfig } from "wagmi";
import { SessionProvider } from "next-auth/react";
import { mainnet } from "wagmi/chains";
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";
import Navbar from "@/components/layout/Navbar";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Footer from "@/components/layout/Footer";
import { Mulish } from "next/font/google";
import { type Session } from "next-auth";
import Head from "next/head";
import "@/styles/globals.css";

const font = Mulish({ subsets: ["latin"] });
const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID ?? "";

const chains = [mainnet];
const wagmiConfig = defaultWagmiConfig({ chains, projectId: PROJECT_ID });

createWeb3Modal({ wagmiConfig, projectId: PROJECT_ID, chains, themeMode: "light" });

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <SessionProvider session={session}>
      <main className={font.className}>
        <Head>
          <link rel="icon" href="/ceramic-favicon.svg" />
          <meta property="og:image" content="/ceramic-favicon.svg" />
          <meta property="og:type" content="website" />
          <meta name="twitter:image" content="/ceramic-favicon.svg" />
        </Head>
        <ThemeProvider>
          <Navbar />
        <Component {...pageProps} />
        <Footer />
        </ThemeProvider>
      </main>
      </SessionProvider>
    </WagmiConfig>
  );
};

export default MyApp;
