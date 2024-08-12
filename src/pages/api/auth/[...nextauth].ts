import NextAuth from "next-auth";
import { authOptions } from "@/server/auth";

authOptions.callbacks = {
  async jwt({ token, account }) {
      if(account){
          token.access_token = account.access_token;
      }
      return token;
  },
  async session({ session, token }) {
      return {
          ...session,
          token
      };
  },
}

export default NextAuth(authOptions);
