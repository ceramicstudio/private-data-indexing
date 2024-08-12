import { signIn, useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import React from "react";

export function SpotifyAuth() {
  const { data: sessionData } = useSession();
  const [verified, setVerified] = React.useState(false);

  useEffect(() => {
    if (sessionData?.user.email) {
      setVerified(true);
    }
  }, [sessionData?.user.email]);
  return (
    <div className="mt-4 flex w-screen flex-row items-center justify-center gap-4 p-4">
      {!verified ? (
        <Button
          variant="outline"
          className="ml-4 mr-4 text-xs"
          onClick={() => {
            void signIn();
          }}
        >
          Authenticate Spotify
        </Button>
      ) : (
        <Button
          variant="outline"
          className="ml-4 mr-4 text-xs"
          onClick={() => {
            void signOut();
          }}
        >
          Sign Out of Spotify
        </Button>
      )}
    </div>
  );
}
