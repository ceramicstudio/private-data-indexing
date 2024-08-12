import { StreamID } from "@/components/services/stream-id";
import { type DIDSession } from "did-session";
import {
  createEvent,
  getEvent,
  writeToRecon,
} from "@/components/services/stream";
import { type DID } from "dids";
import { eventToCAR } from "@/components/services/encoding";
import { base64urlnopad, utf8 } from "@scure/base";
import type { Cacao } from "@didtools/cacao";
import { CARFactory } from "cartonne";
import { type Signal, signal } from "@preact/signals-core";
import { createJwsCacao } from "@/components/create-jws-cacao";
import { type OrbisDB } from "@useorbis/db-sdk";
import { env } from "@/env";

const TABLE_ID = env.NEXT_PUBLIC_TABLE_ID as string;
const CONTEXT_ID = env.NEXT_PUBLIC_CONTEXT_ID as string;

type Underlying = {
  message: string | undefined;
  streamID: StreamID | undefined;
  capability: string | undefined;
  orbisUpdate: Record<string, unknown> | undefined;
};

export class WriteSubpageState {
  private readonly session: DIDSession | undefined;
  private readonly endpoint: string;
  private readonly signal: Signal<Underlying>;
  private readonly carFactory: CARFactory;
  private readonly orbis: OrbisDB;

  constructor(
    session: DIDSession | undefined,
    endpoint: string,
    orbis: OrbisDB,
  ) {
    this.session = session;
    this.endpoint = endpoint;
    this.orbis = orbis;
    this.carFactory = new CARFactory();
    this.signal = signal<Underlying>({
      message: undefined,
      streamID: undefined,
      capability: undefined,
      orbisUpdate: undefined,
    });
  }

  get streamId(): StreamID | undefined {
    return this.signal.value.streamID;
  }

  get capability(): string | undefined {
    return this.signal.value.capability;
  }

  get orbisUpdate(): Record<string, unknown> | undefined {  
    return this.signal.value.orbisUpdate;
  }

  submitMessage(message: string): void {
    if (!this.session) return;
    if (!message) return;
    const session = this.session;
    const MODEL_STREAM_ID = new StreamID(
      "MID",
      "bagcqcera26p4nkhr7r6a3l5sbzpwyfpwj5xdwf5mzdyizxaufsaydbutiznq", // corresponding CID of parent model: https://ceramic-orbisdb-mainnet-direct.hirenodes.io/api/v0/streams/kjzl6hvfrbw6cadyci5lvsff4jxl1idffrp2ld3i0k1znz0b3k67abkmtf7p7q3
    );
    createEvent(session.did as unknown as DID, { message }, MODEL_STREAM_ID)
      .then(async (event) => {
        const car = eventToCAR(event.codec, event.signedEvent);
        console.log(this.session);
        await writeToRecon(car, this.endpoint);

        const readCapabilityCAR = this.carFactory.build();
        readCapabilityCAR.put(session.cacao, { isRoot: true });
        const readCapability = base64urlnopad.encode(readCapabilityCAR.bytes);

        const gotEvent = await getEvent(
          car.roots[0]!.toString(),
          this.endpoint,
          readCapability,
        );
        const streamID = new StreamID("MID", gotEvent?.id as string).baseID;
        this.signal.value = {
          message: message,
          streamID: streamID,
          capability: undefined,
          orbisUpdate: undefined,
        };
      })
      .catch((error) => {
        console.error(error);
      });
  }

  createCapability(delegateeRaw: string): void {
    if (!delegateeRaw) return;
    const delegatee = delegateeRaw.startsWith("0x")
      ? `did:pkh:eip155:1:${delegateeRaw}`
      : delegateeRaw;
    const session = this.session;
    if (!session) return;
    const current = this.signal.value;
    const streamID = current.streamID;
    if (!streamID) return;
    const eventId = streamID.cid.toString();
    import("@biscuit-auth/biscuit-wasm")
      .then(async (module) => {
        const biscuit = module.biscuit;
        const fact = module.fact;
        const check = module.check;

        const builder = biscuit`
          user(${delegatee});
        `;
        const innerCacao = session.cacao;
        const innerResources = innerCacao.p.resources ?? [];
        const car = this.carFactory.build();
        const innerCacaoCID = car.put(innerCacao);
        // for (const resource of innerResources) {
        //   builder.addFact(fact`right(${delegatee}, ${resource})`);
        // }
        builder.addFact(fact`right(${delegatee}, ${eventId})`);
        const second = 1000;
        const minute = 60 * second;
        const hour = 60 * minute;
        const day = 24 * hour;
        const month = 30 * day;
        const exp = new Date(Date.now() + month); // 1 month
        builder.addCheck(check`check if time($time), $time < ${exp}`);
        const biscuitString = builder.toString();
        console.log("bs", biscuitString);
        const biscuitB64U = base64urlnopad.encode(utf8.decode(biscuitString));

        const attenuatedCacaoP: Cacao["p"] = {
          ...innerCacao.p,
          aud: delegatee,
          iss: session.did.id,
          resources: [
            ...innerResources,
            `prev:${innerCacaoCID.toString()}`,
            `biscuit:${biscuitB64U}`,
          ],
          exp: exp.toISOString(),
        };

        const signedCacao = await createJwsCacao(session.did, attenuatedCacaoP);
        car.put(signedCacao, { isRoot: true });
        // TODO Multiformats U?
        const capability = base64urlnopad.encode(car.bytes);

        this.signal.value = {
          ...current,
          capability: capability,
        };
      })
      .catch((error) => {
        console.error(error);
      });
  }
  async getSpotifyInfo(token: string): Promise<Record<string, unknown>> {
    const request = await fetch(
      "https://api.spotify.com/v1/me/top/tracks?offset=1&limit=1",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const response = (await request.json()) as Record<string, unknown>;
    return response;
  }
  async writeOrbis(
    delegateeRaw: string,
  ): Promise<Record<string, unknown> | undefined> {
    try {
      const current = this.signal.value;
      const streamID = current.streamID;
      if (!streamID) return;
      const capability = current.capability;
      if (!capability) return;
      // construct the orbisDB query
      await this.orbis.getConnectedUser();
      const updatequery = await this.orbis
        .insert(TABLE_ID)
        .value({
          topic: "Top Tracks",
          stream: streamID.toString(),
          capability,
          delegatee: delegateeRaw.startsWith("0x")
            ? `did:pkh:eip155:1:${delegateeRaw.toLowerCase()}`
            : delegateeRaw.toLowerCase(),
        })
        .context(CONTEXT_ID)
        .run();
        this.signal.value = {
          ...current,
          orbisUpdate: updatequery,
        };
    } catch (error) {
      console.log(error);
    }
  }
}
