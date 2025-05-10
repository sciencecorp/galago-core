import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

// Debug initialization
console.log("Initializing NextAuth...");

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    accessToken?: string;
    isAdmin?: boolean;
    provider?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    isAdmin?: boolean;
    provider?: string;
    dbUserId?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    
    // GitHub OAuth Provider
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    
    // Custom Credentials Provider for existing username/password auth
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) {
            return null;
          }
          
          // Create form data for token endpoint
          const formData = new FormData();
          formData.append('username', credentials.username);
          formData.append('password', credentials.password);
          
          // Call existing token endpoint
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/token`,
            formData
          );
          
          if (response.data && response.data.access_token) {
            // Get user info
            const userResponse = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/users/me`,
              {
                headers: { Authorization: `Bearer ${response.data.access_token}` }
              }
            );
            
            if (userResponse.data) {
              // Return user with the token
              return {
                id: userResponse.data.id.toString(),
                name: userResponse.data.username,
                email: userResponse.data.email,
                isAdmin: userResponse.data.is_admin,
                accessToken: response.data.access_token
              };
            }
          }
          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  
  callbacks: {
    async jwt({ token, user, account }) {
      // If user signs in with credentials, pass the access token
      if (user && account?.provider === "credentials") {
        token.accessToken = (user as any).accessToken;
        token.isAdmin = (user as any).isAdmin;
      }
      
      // For social/email auth, find or create a user in our database
      if (user && account && (account.provider === "google" || account.provider === "github")) {
        try {
          // Call our API to register/link the user
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/external-auth`,
            {
              email: user.email,
              name: user.name,
              provider: account.provider,
              provider_user_id: account.providerAccountId,
              profile_image: user.image
            }
          );
          
          if (response.data) {
            // Set token data from our database user
            token.isAdmin = response.data.is_admin;
            token.provider = account.provider;
            
            // This is important - store the user ID from our database
            token.dbUserId = response.data.id;
          }
        } catch (error) {
          console.error("Error registering with external provider:", error);
        }
      }
      
      return token;
    },
    
    async session({ session, token }) {
      // Send properties to the client
      if (token && session.user) {
        // If we have a database user ID from social login, use that
        if (token.dbUserId) {
          session.user.id = token.dbUserId.toString();
        } else {
          // For credential login, use the sub claim
          session.user.id = token.sub || '';
        }
        
        (session as any).accessToken = token.accessToken;
        (session as any).isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions); 