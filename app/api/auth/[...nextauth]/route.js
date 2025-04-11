import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        employeeId: { label: "Employee ID", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.employeeId || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }
        
        try {
          console.log(`Authenticating user with employee ID: ${credentials.employeeId}`);
          
          // Find user by employee ID
          const users = await query(
            'SELECT * FROM users WHERE employee_id = ?',
            [credentials.employeeId]
          );
          
          if (users.length === 0) {
            console.log("No user found with that employee ID");
            return null;
          }
          
          const user = users[0];
          
          // Use bcrypt to verify the password
          let isPasswordValid = false;
          
          // First try to verify with bcrypt
          try {
            isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);
          } catch (e) {
            console.log("Error using bcrypt, may be plain text password:", e.message);
            // Fallback to direct comparison if bcrypt fails (only temporary)
            isPasswordValid = credentials.password === user.password_hash;
          }
          
          if (!isPasswordValid) {
            console.log("Password is invalid");
            return null;
          }
          
          console.log("Authentication successful");
          console.log("User role:", user.role);
          
          // This is what gets passed to your JWT
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            employeeId: user.employee_id,
            campaign: user.campaign,
            role: user.role,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign-in: user object is available
      if (user) {
        console.log("JWT callback - user data:", user);
        token.id = user.id;
        token.employeeId = user.employeeId;
        token.campaign = user.campaign;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback - token data:", token);
      if (token) {
        // Add custom properties to the session.user object
        session.user.id = token.id;
        session.user.employeeId = token.employeeId;
        session.user.campaign = token.campaign;
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  debug: true, // Enable debugging to see detailed logs
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };