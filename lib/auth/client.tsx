'use client';

import { createContext, useContext } from 'react';

export type User = {
  id: number;
  email: string;
  name: string | null;
  businessName: string | null;
  whatsappNumber: string | null;
  googlePlaceId: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: string | null;
  role: 'owner' | 'member' | null;
};

type UserContextType = {
  user: User | null;
};

const UserContext = createContext<UserContextType | null>(null);

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export function ClientUserProvider({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User | null;
}) {
  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
} 