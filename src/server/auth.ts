import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import { env } from "../env";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
    token: {
      access_token: string;
      jti: string;
      exp: number;
      iat: number;
      sub: string;
    }
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  providers: [
    SpotifyProvider({
        authorization:
            'https://accounts.spotify.com/authorize?scope=user-read-email,user-top-read,playlist-read-private,playlist-modify-private,playlist-modify-public',
        clientId: process.env.SPOTIFY_CLIENT_ID ?? '',
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? '',
    }),
],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};