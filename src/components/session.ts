import { signal, type Signal } from "@preact/signals-react";
import { OrbisDB } from "@useorbis/db-sdk";
import { DIDSession } from "did-session";
import type { GetWalletClientResult } from "@wagmi/core";
import { EthereumWebAuth, getAccountId } from "@didtools/pkh-ethereum";
import type { AccountId } from "caip";
import type { WalletClient } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { useEffect, useMemo } from "react";
import { useSignals } from "@preact/signals-react/runtime";
import { env } from "@/env";

const ENV_ID = env.NEXT_PUBLIC_ENV_ID as string;

enum Stage {
  PROGRESS,
  LOGGED_IN,
  LOGGED_OUT,
}

type Underlying =
  | { stage: Stage.LOGGED_OUT }
  | { stage: Stage.PROGRESS }
  | {
      stage: Stage.LOGGED_IN;
      session: DIDSession;
      walletClient: WalletClient;
      accountId: AccountId;
      orbis: OrbisDB;
    };

const orbis = new OrbisDB({
  ceramic: {
    gateway: "https://ceramic-orbisdb-mainnet-direct.hirenodes.io/",
  },
  nodes: [
    {
      gateway: "https://studio.useorbis.com",
      env: ENV_ID,
    },
  ],
});

export class SessionState {
  private readonly signal: Signal<Underlying>;
  public readonly orbis: OrbisDB;

  constructor() {
    this.signal = signal<Underlying>({
      stage: Stage.LOGGED_OUT,
    });
    this.orbis = orbis;
  }

  logIn(walletClient: GetWalletClientResult | undefined): void {
    if (!walletClient) {
      localStorage.removeItem("ceramic:session");
      localStorage.removeItem("orbis:session");
      return;
    }
    this.signal.value = {
      stage: Stage.PROGRESS,
    };
    getAccountId(walletClient, walletClient.account.address)
      .then(async (accountId: AccountId) => {
        const authMethod = await EthereumWebAuth.getAuthMethod(
          walletClient,
          accountId,
        );
        let session: string;
        let unSerializedSession: DIDSession;

        const storedSession = localStorage.getItem("ceramic:session");
        if (storedSession) {
          session = storedSession;
          unSerializedSession = await DIDSession.fromSession(session);
          const parentAddress = unSerializedSession.did.parent.replace(
            "did:pkh:eip155:1:",
            "",
          );
          const isOtherAddress =
            parentAddress.toLowerCase() !== accountId.address.toLowerCase();
          console.log("isOtherAddress", isOtherAddress);
          if (unSerializedSession.isExpired || isOtherAddress) {
            // @ts-expect-error - known type error
            unSerializedSession = await DIDSession.authorize(authMethod, {
              resources: [
                // "ceramic://*?model=kjzl6hvfrbw6cadyci5lvsff4jxl1idffrp2ld3i0k1znz0b3k67abkmtf7p7q3",
                "ceramic://*",
              ],
            });
            session = unSerializedSession.serialize();
            localStorage.setItem("ceramic:session", session);
          }
        } else {
          //@ts-expect-error - known type error
          unSerializedSession = await DIDSession.authorize(authMethod, {
            resources: [
              // "ceramic://*?model=kjzl6hvfrbw6cadyci5lvsff4jxl1idffrp2ld3i0k1znz0b3k67abkmtf7p7q3",
              "ceramic://*",
            ],
          });
          session = unSerializedSession.serialize();
          localStorage.setItem("ceramic:session", session);
        }

        await orbis.connectUser({ serializedSession: session });

        this.signal.value = {
          stage: Stage.LOGGED_IN,
          session: unSerializedSession,
          walletClient: walletClient,
          accountId: accountId,
          orbis: orbis,
        };
      })
      .catch((error) => {
        this.signal.value = {
          stage: Stage.LOGGED_OUT,
        };
        console.error(error);
      });
  }

  get isLoggedIn(): boolean {
    const current = this.signal.value;
    return current.stage === Stage.LOGGED_IN;
  }

  get isLoggedOut(): boolean {
    return !this.isLoggedIn;
  }

  get didSession() {
    const current = this.signal.value;
    if (current.stage === Stage.LOGGED_IN) {
      return current.session;
    }
  }

  get orbisDB() {
    const current = this.signal.value;
    if (current.stage === Stage.LOGGED_IN) {
      return current.orbis;
    }
  }

  logOut(): void {
    this.signal.value = {
      stage: Stage.LOGGED_OUT,
    };
  }
}

export function useCeramicSession() {
  useSignals();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const session = useMemo(() => new SessionState(), []);
  useEffect(() => {
    if (address && walletClient) {
      session.logIn(walletClient);
    }
    return () => {
      session.logOut();
    };
  }, [address, walletClient]);
  return session;
}
