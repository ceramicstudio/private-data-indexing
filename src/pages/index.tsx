"use client";

import Head from "next/head";
import { EndpointInput } from "@/components/endpoint.input";
import { SUBPAGE, useSubpage } from "@/use-subpage";
import { TopMenu } from "@/components/top-menu";
import { DisplayWhen } from "@/components/display-when";
import { WriteSubpage } from "@/components/write-subpage";
import { ReadSubpage } from "@/components/read-subpage";
import { useCeramicSession } from "@/components/session";
import { useSignals } from "@preact/signals-react/runtime";
import { useSignal } from "@preact/signals-react";
import { WriteSubpageState } from "@/components/write-subpage.state";
import { ReadSubpageState } from "@/components/read-subpage.state";
import { SpotifyAuth } from "@/components/spotify-auth";

const ENV_DISPLAY_ENDPOINT = true;
const DEFAULT_ENDPOINT = "http://localhost:5101";

export default function Home() {
  useSignals();
  const session = useCeramicSession();
  const endpoint = useSignal(DEFAULT_ENDPOINT);
  const subpage = useSubpage();

  return (
    <div className="min-h-screen">
      <Head>
        <title>Private Data Playground</title>
        <meta name="description" content="" />
        <link rel="icon" href="/ceramic-favicon.svg" />
        <meta property="og:title" content="" />
        <meta property="og:description" content="" />
      </Head>
      <DisplayWhen isTrue={session.isLoggedIn}>
        <TopMenu set={subpage.set} />
      </DisplayWhen>
      <DisplayWhen isTrue={subpage.value === SUBPAGE.WRITE}>
        <SpotifyAuth />
      </DisplayWhen>
      <div className="border-border ">
        <main className="container mx-auto">
          <DisplayWhen isTrue={session.isLoggedIn}>
            <EndpointInput
              endpoint={endpoint.value}
              setEndpoint={(v) => {
                endpoint.value = v;
              }}
              displayEndpoint={ENV_DISPLAY_ENDPOINT}
            />
            <DisplayWhen isTrue={subpage.value === SUBPAGE.WRITE}>
              <WriteSubpage
                stateFactory={() =>
                  new WriteSubpageState(
                    session.didSession,
                    endpoint.value,
                    session.orbis,
                  )
                }
              />
            </DisplayWhen>
            <DisplayWhen isTrue={subpage.value === SUBPAGE.READ}>
              <ReadSubpage
                stateFactory={() => {
                  return new ReadSubpageState(
                    session.didSession,
                    endpoint.value,
                    session.orbis,
                  );
                }}
              />
            </DisplayWhen>
          </DisplayWhen>
          <DisplayWhen isTrue={session.isLoggedOut}>
            <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center justify-center pt-4 text-center md:mt-24">
              <h1 className=" text-4xl font-extrabold md:text-4xl md:leading-tight">
                Connect your wallet to get started
              </h1>
              <div className="absolute top-0 -z-10 h-full max-h-full w-full max-w-screen-lg blur-2xl">
                <div className="absolute left-24 top-24 h-56 w-56 animate-blob rounded-full bg-violet-600 opacity-70 mix-blend-multiply blur-3xl filter"></div>
                <div className="absolute bottom-2 right-1/4 hidden h-56 w-56 animate-blob rounded-full bg-sky-600 opacity-70 mix-blend-multiply blur-3xl filter delay-1000 md:block"></div>
                <div className="absolute bottom-1/4 left-1/3 hidden h-56 w-56 animate-blob rounded-full bg-pink-600 opacity-70 mix-blend-multiply blur-3xl filter delay-500 md:block"></div>
              </div>
            </div>
          </DisplayWhen>
        </main>
      </div>
    </div>
  );
}
