import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { Account, User } from '../models/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountCreationService {

  constructor(private firebaseService: FirebaseService) { }

  // Create a sample user with accounts for demonstration
  async createSampleUserWithAccounts() {
    try {
      // Create a sample user
      const userData: Partial<User> = {
        firstName: 'John',
        lastName: 'Doe',
        role: 'customer',
        accounts: [],
        isActive: true
      };

      // Register the user (in a real app, this would create Firebase Auth user)
      console.log('Creating sample user...');
      
      // Create sample accounts
      // Note: ownerId should be set when actually creating accounts for a real user
      const accounts: Omit<Account, 'id'>[] = [
        {
          accountNumber: '123456789',
          iban: 'DE97 6605 0101 0000 1234 56',
          accountType: 'Privatgirokonto',
          accountName: 'Private Current Account',
          balance: 1000.00,
          currency: 'EUR',
          ownerId: 'sample-user-id', // Should be replaced with actual user ID when used
          ownerName: 'John Doe',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          accountNumber: '987654321',
          iban: 'DE97 6605 0101 0000 9876 54',
          accountType: 'Savings Account',
          accountName: 'Savings Account',
          balance: 5000.00,
          currency: 'EUR',
          ownerId: 'sample-user-id', // Should be replaced with actual user ID when used
          ownerName: 'John Doe',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          accountNumber: '555666777',
          iban: 'DE97 6605 0101 0000 5556 66',
          accountType: 'Business Account',
          accountName: 'Business Account',
          balance: 2500.00,
          currency: 'EUR',
          ownerId: 'sample-user-id', // Should be replaced with actual user ID when used
          ownerName: 'John Doe',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      console.log('Sample accounts created:', accounts);
      return { user: userData, accounts };
      
    } catch (error) {
      console.error('Error creating sample user and accounts:', error);
      throw error;
    }
  }

  // Generate a random IBAN for new accounts
  generateIBAN(): string {
    const countryCode = 'DE';
    const bankCode = '66050101';
    const accountNumber = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    const checkDigits = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    
    return `${countryCode}${checkDigits} ${bankCode} ${accountNumber.slice(0, 4)} ${accountNumber.slice(4, 8)} ${accountNumber.slice(0, 2)}`;
  }

  // Generate a random account number
  generateAccountNumber(): string {
    return Math.floor(Math.random() * 1000000000).toString();
  }
}
