import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/components/ui/button";
import { useSignal, useComputed } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";
import { useMemo } from "react";
import type { ReadSubpageState } from "@/components/read-subpage.state";
import { StreamID } from "@/components/services/stream-id";

export function ReadSubpage(props: { stateFactory: () => ReadSubpageState }) {
  useSignals();
  const state = useMemo(() => props.stateFactory(), [props]);
  // FIXME Temporary value
  // const streamIdString = useSignal("kjzl6kcym7w8y6o6zdbf7lefb82xtyib7ynzh4v859dwi550twcqy8uxl0ts9rm");
  const streamIdString = useSignal("");
  const streamId = useComputed(() => {
    try {
      return StreamID.fromString(streamIdString.value);
    } catch {
      return undefined;
    }
  });
  // FIXME Temporary value
  // const capability = useSignal("OqJlcm9vdHOB2CpYJQABcRIgyZiI46RfbwqfjZJ2dwrOXIyUr8SIpiGKJY3jIvbXNe1ndmVyc2lvbgHZBAFxEiB4EBYrdOwSXNdxcWhNNwWZFEYG-O4Z0HO2yI0e0b1e16NhaKFhdGdlaXA0MzYxYXCpY2F1ZHg5ZGlkOmtleTp6RG5hZWl6dGZCajJuZU5qQzJ6U0NIcW1RdEFQVnMxOGNyTnpQNFd6SnRDVVBXNFA1Y2V4cHgYMjAyNC0wNy0xNVQwNzo1OTozNC4xMDZaY2lhdHgYMjAyNC0wNy0wOFQwNzo1OTozNC4xMDZaY2lzc3g9ZGlkOnBraDplaXAxNTU6MTM3OjB4NDM5ZTY2ZGI1Yjg1YjA2NWI5NjJkYjBiM2IyMWU2MDc2NzRjMWQwYmVub25jZWpZV05jRzgzSlo3ZmRvbWFpbmlsb2NhbGhvc3RndmVyc2lvbmExaXJlc291cmNlc4F4UWNlcmFtaWM6Ly8qP21vZGVsPWtqemw2aHZmcmJ3NmNhZHljaTVsdnNmZjRqeGwxaWRmZnJwMmxkM2kwazF6bnowYjNrNjdhYmttdGY3cDdxM2lzdGF0ZW1lbnR4PEdpdmUgdGhpcyBhcHBsaWNhdGlvbiBhY2Nlc3MgdG8gc29tZSBvZiB5b3VyIGRhdGEgb24gQ2VyYW1pY2FzomFzeIQweGY5YjY4ZDRmM2EwZDA3ZGExOWM2ZGZjNDMwOWE0N2JhNTZkOTBkZWNkMjUyNmRhNzhiZmVhYzgzNjkxMWQzMDE1YWYyMGExZjAxMGFlZmJhMDZkNjU3YWQ3ZjJjOWRhMGNhYWYyZTZiODRmODExNTQ3OTU3ZGZkYmIwZjFmZmQzMWNhdGZlaXAxOTGbCAFxEiDJmIjjpF9vCp-NknZ3Cs5cjJSvxIimIYoljeMi9tc17aNhaKFhdGdjYWlwMTIyYXCpY2F1ZGlkZWxlZ2F0ZWVjZXhweB1XZWQsIDA3IEF1ZyAyMDI0IDE0OjIwOjIzIEdNVGNpYXR4GDIwMjQtMDctMDhUMDc6NTk6MzQuMTA2WmNpc3N4OWRpZDprZXk6ekRuYWVpenRmQmoybmVOakMyelNDSHFtUXRBUFZzMThjck56UDRXekp0Q1VQVzRQNWVub25jZWpZV05jRzgzSlo3ZmRvbWFpbmlsb2NhbGhvc3RndmVyc2lvbmExaXJlc291cmNlc4N4UWNlcmFtaWM6Ly8qP21vZGVsPWtqemw2aHZmcmJ3NmNhZHljaTVsdnNmZjRqeGwxaWRmZnJwMmxkM2kwazF6bnowYjNrNjdhYmttdGY3cDdxM3hAcHJldjpiYWZ5cmVpZHljYWxjdzVobWNqb25vNGxybmJndG9ibXpjcmRhbjZob2RoaWhobndpcnVwbmRwazYyNHkBGGJpc2N1aXQ6THk4Z2JtOGdjbTl2ZENCclpYa2dhV1FnYzJWMENuVnpaWElvSW1SbGJHVm5ZWFJsWlNJcE93cHlhV2RvZENnaVpHVnNaV2RoZEdWbElpd2dJbU5sY21GdGFXTTZMeThxUDIxdlpHVnNQV3RxZW13MmFIWm1jbUozTm1OaFpIbGphVFZzZG5ObVpqUnFlR3d4YVdSbVpuSndNbXhrTTJrd2F6RjZibm93WWpOck5qZGhZbXR0ZEdZM2NEZHhNeUlwT3dwamFHVmpheUJwWmlCMGFXMWxLQ1IwYVcxbEtTd2dKSFJwYldVZ1BDQWlNakF5TkMwd09DMHdOMVF4TkRveU1Eb3lNeTR5TlRKYUlqc0tpc3RhdGVtZW50eDxHaXZlIHRoaXMgYXBwbGljYXRpb24gYWNjZXNzIHRvIHNvbWUgb2YgeW91ciBkYXRhIG9uIENlcmFtaWNhc6NhbaNjYWxnZUVTMjU2Y2NhcHhCaXBmczovL2JhZnlyZWlkeWNhbGN3NWhtY2pvbm80bHJuYmd0b2JtemNyZGFuNmhvZGhpaGhud2lydXBuZHBrNjI0Y2tpZHhrZGlkOmtleTp6RG5hZWl6dGZCajJuZU5qQzJ6U0NIcW1RdEFQVnMxOGNyTnpQNFd6SnRDVVBXNFA1I3pEbmFlaXp0ZkJqMm5lTmpDMnpTQ0hxbVF0QVBWczE4Y3JOelA0V3pKdENVUFc0UDVhc3hWbmM0TUNkbHNXTUpJcl9id0h0Q29GUUh3NFFvWVB3TlFrRDI5ajZWRGxRVk9jczFBRjd4cFdYTU45ZFpQNFVNMW1nZEJhMlc1eUROT3N2UngtVzNWQkFhdGNqd3M");
  const capability = useSignal("");
  const streams = useComputed(() => state.streams);
  console.log(streams);
  const isButtonEnabled = useComputed(() => {
    return Boolean(streamId.value) && Boolean(capability.value);
  });
  const message = useComputed(() => state.message);

  const loadStream = () => {
    const streamIdValue = streamId.value;
    const capabilityValue = capability.value;
    if (!streamIdValue) return;
    if (!capabilityValue) return;
    state.loadStream(streamIdValue, capabilityValue);
  };

  return (
    <section className="relative h-full w-full border-b border-border bg-gradient-to-b from-background via-background via-90% to-transparent">
      <div className="container  w-full">
        <div className="my-24 w-full">
          <div className="items-left mt-12 flex w-full flex-row justify-start">
            <div key={"main"} className="flex w-full flex-col">
              <>
                {/* <p className="text-1xl md:text-1xl mt-4 font-semibold">
                  Stream ID
                </p>
                <TextareaAutosize
                  className="outline-dark mt-4 min-h-24 resize-none border border-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your Stream ID here..."
                  value={streamIdString.value}
                  onChange={(e) => {
                    streamIdString.value = e.target.value;
                  }}
                />
                <p className="text-1xl md:text-1xl mt-4 font-semibold">
                  Capability
                </p>
                <TextareaAutosize
                  className="outline-dark mt-4 min-h-24 resize-none border border-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Paste your capability here..."
                  value={capability.value}
                  onChange={(e) => {
                    capability.value = e.target.value;
                  }}
                /> */}
                {
                  streams.value &&
                  streams.value.length > 0 && (
                    <div className="flex flex-col">
                      <p className="text-1xl md:text-1xl mt-4 font-semibold">
                        Authorized Streams
                      </p>
                      <div className="mt-4 flex flex-col space-y-4">
                        {
                          streams.value.map((stream) => (
                            <div key={stream.stream} className="flex flex-row items-center justify-between">
                              <p className="text-base">{stream.stream}</p>
                              <Button
                                className="text-xs"
                                variant="secondary"
                                onClick={() => {
                                  streamIdString.value = stream.stream;
                                  capability.value = stream.capability;
                                  loadStream();
                                }}
                              >
                                Load
                              </Button>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  )
                }
                {message.value ? (
                  <>
                    <p className="text-1xl md:text-1xl mt-4 font-semibold">
                      Message
                    </p>
                    <TextareaAutosize
                      disabled={Boolean(message.value)}
                      className="outline-dark mt-4 min-h-24 resize-none border border-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={message.value}
                    />
                  </>
                ) : (
                  <Button
                    className="mt-4 w-1/5 self-start text-xs"
                    variant="secondary"
                    disabled={!isButtonEnabled.value}
                    onClick={loadStream}
                  >
                    Load
                  </Button>
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
