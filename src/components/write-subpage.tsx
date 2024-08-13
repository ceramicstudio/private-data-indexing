"use client";

import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/components/ui/button";
import React, { useMemo, useEffect } from "react";
import { useSignal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";
import { useSession } from "next-auth/react";
import type { WriteSubpageState } from "@/components/write-subpage.state";

export function WriteSubpage(props: { stateFactory: () => WriteSubpageState }) {
  useSignals();
  const { data: sessionData } = useSession();
  const message = useSignal("");
  const delegatee = useSignal("0xcc2158d7e1B0FffD4dB6F51E35f05E00d8fE30b2");
  const state = useMemo(() => props.stateFactory(), [props.stateFactory]);

  function copyToClipboard(value: string | undefined): void {
    if (!value) return;
    navigator.clipboard
      .writeText(value)
      .then(() => {
        // Do Nothing
      })
      .catch((error) => {
        console.error(error);
      });
  }

  const submitMessage = (e: React.MouseEvent) => {
    e.preventDefault();
    state.submitMessage(message.value);
  };

  useEffect(() => {
    if (sessionData?.token.access_token) {
      void state
        .getSpotifyInfo(sessionData?.token.access_token)
        .then((response) => {
          message.value = JSON.stringify(response, null, 2);
        });
    }
  }, [sessionData?.token.access_token]);

  return (
    <section className="relative h-full w-full border-b border-border bg-gradient-to-b from-background via-background via-90% to-transparent">
      <div className="container  w-full">
        <div className="my-24 w-full">
          <div className="items-left mt-12 flex w-full flex-row justify-start">
            <div key={"main"} className="flex w-full flex-col">
              <>
                <p className="text-1xl md:text-1xl mt-4 font-semibold">
                  Spotify Data
                </p>
                <TextareaAutosize
                  className="outline-dark mt-4 min-h-24 resize-none border border-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your top tracks will automatically appear here..."
                  value={message.value}
                  onChange={(e) => {
                    message.value = e.target.value;
                  }}
                />
                <Button
                  className="mt-4 w-1/5 self-start text-xs"
                  variant="secondary"
                  onClick={submitMessage}
                >
                  Save to Private Data Store
                </Button>

                {state.streamId && (
                  <>
                    <div className="mt-4 grid w-full max-w-[23rem] grid-cols-8 gap-2">
                      <label className="sr-only">Label</label>
                      <p className="col-span-6 mt-12 mt-4 text-sm ">
                        Stream ID
                      </p>
                      <input
                        id="writeStreamId"
                        type="text"
                        className="col-span-6 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        value={state.streamId.toString()}
                        disabled
                      ></input>
                      <button
                        onClick={() => {
                          copyToClipboard(state.streamId?.toString());
                        }}
                        className="col-span-2 inline-flex w-full items-center justify-center rounded-lg bg-blue-700 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 sm:w-auto"
                      >
                        <span id="default-message">Copy</span>
                        <span
                          id="success-message"
                          className="inline-flex hidden items-center"
                        >
                          <svg
                            className="me-1.5 h-3 w-3 text-white"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 16 12"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M1 5.917 5.724 10.5 15 1.5"
                            />
                          </svg>
                          Copied!
                        </span>
                      </button>
                    </div>
                    <>
                      <p className="text-1xl md:text-1xl mt-12 mt-4 font-semibold">
                        The following account wants to access your Spotify data:
                      </p>
                      <TextareaAutosize
                        className="outline-dark mt-4 min-h-12 resize-none border border-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your desired delegated Eth address here..."
                        value={delegatee.value}
                        onChange={(e) => {
                          delegatee.value = e.target.value;
                        }}
                      />
                      <Button
                        className="mt-4 w-1/5 self-start text-xs"
                        variant="secondary"
                        onClick={() => {
                          state.createCapability(delegatee.value);
                        }}
                      >
                        Create Capability
                      </Button>
                    </>
                    {state.capability && (
                      <div className="mt-4">
                        <label className="sr-only">Label</label>
                        <p className="mt-12 mt-4 text-sm ">Capability</p>
                        <textarea
                          className="outline-dark mt-4 min-h-24 w-full resize-none border border-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={state.capability}
                          disabled={true}
                        />
                        <button
                          onClick={() => {
                            copyToClipboard(state.capability?.toString());
                          }}
                          className="w-full min-w-60 items-center justify-center rounded-lg bg-blue-700 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 sm:w-auto"
                        >
                          <span id="default-message">Copy</span>
                          <span
                            id="success-message"
                            className="inline-flex hidden items-center"
                          >
                            <svg
                              className="me-1.5 h-3 w-3 text-white"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 16 12"
                            >
                              <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M1 5.917 5.724 10.5 15 1.5"
                              />
                            </svg>
                            Copied!
                          </span>
                        </button>
                        {state.orbisUpdate == undefined ? (
                          <Button
                            className="mt-4 w-1/5 self-start text-xs"
                            variant="secondary"
                            onClick={() => {
                              void state.writeOrbis(delegatee.value);
                            }}
                          >
                            Save Capability
                          </Button>
                        ) : (
                          <Button
                            className="mt-4 w-1/5 self-start text-xs"
                            variant="outline"
                          >
                            Created!
                          </Button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-0 -z-10 h-full max-h-full w-full blur-2xl">
        <div className="absolute bottom-0 left-0 h-56 w-1/2 animate-blob rounded-full bg-violet-600 opacity-70 mix-blend-multiply blur-3xl filter"></div>
        <div className="absolute bottom-0 right-0 h-56 w-1/2 animate-blob rounded-full bg-sky-600 opacity-70 mix-blend-multiply blur-3xl filter delay-1000"></div>
      </div>
    </section>
  );
}
