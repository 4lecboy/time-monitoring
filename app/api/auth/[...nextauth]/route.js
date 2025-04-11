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
          return null;
        }
        
        try {
          // Find user by employee ID
          const users = await query(
            'SELECT * FROM users WHERE employee_id = ?',
            [credentials.employeeId]
          );
          
          if (users.length === 0) {
            return null;
          }
          
          const user = users[0];
          
          // Compare passwords - support both plain text and hashed passwords
          let isPasswordValid = false;
          
          if (user.password_hash.startsWith('$2')) {
            // This looks like a bcrypt hash
            isPasswordValid = await bcrypt.compare(
              credentials.password, 
              user.password_hash
            );
          } else {
            // Fallback to direct comparison (only for development)
            isPasswordValid = credentials.password === user.password_hash;
          }
          
          if (!isPasswordValid) {
            return null;
          }
          
          // Return the user object with required fields
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
      if (user) {
        token.id = user.id;
        token.employeeId = user.employeeId;
        token.campaign = user.campaign;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-fallback-secret-never-use-this-in-production',
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };