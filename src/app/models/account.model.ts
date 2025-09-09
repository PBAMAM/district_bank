export interface Account {
  id: string;
  accountNumber: string;
  iban: string;
  accountType: string;
  accountName: string;
  balance: number;
  currency: string;
  ownerName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  currency: string;
  description: string;
  type: 'transfer' | 'deposit' | 'withdrawal';
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  processedAt?: Date;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin';
  accounts: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
