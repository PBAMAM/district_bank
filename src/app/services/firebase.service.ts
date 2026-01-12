import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, User as FirebaseUser, onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, setDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { Account, Transaction, User, LoginCredentials } from '../models/account.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private auth = inject(Auth);
  private db = inject(Firestore);

  constructor() {
    this.testFirestoreConnection();
  }

  async testFirestoreConnection() {
    try {
      console.log('=== Testing Firestore Connection ===');
      console.log('Firestore instance:', this.db);
      console.log('Firestore app:', this.db.app);
      console.log('Firestore app options:', this.db.app.options);
      
      // Try to create a test document
      const testDoc = doc(this.db, 'test', 'connection-test');
      await setDoc(testDoc, {
        message: 'Firestore connection test',
        timestamp: new Date()
      });
      console.log('✅ Firestore write test successful');
      
      // Clean up test document
      await deleteDoc(testDoc);
      console.log('✅ Firestore delete test successful');
      
    } catch (error: any) {
      console.error('❌ Firestore connection test failed:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
    }
    console.log('=== End Firestore Connection Test ===');
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<FirebaseUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, credentials.email, credentials.password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }

  async register(email: string, password: string, userData: Partial<User>): Promise<FirebaseUser> {
    try {
      console.log('Attempting to register user:', email);
      console.log('Auth instance:', this.auth);
      console.log('Auth app:', this.auth?.app);
      
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      console.log('User created successfully:', userCredential.user.uid);
      
      // Test Firestore connection first
      console.log('Testing Firestore connection...');
      console.log('Firestore instance:', this.db);
      console.log('Firestore app:', this.db.app);
      
      const userDoc = doc(this.db, 'users', userCredential.user.uid);
      console.log('User document reference created:', userDoc.path);
      
      const userDocData = {
        ...userData,
        email: userCredential.user.email,
        createdAt: new Date(),
        isActive: true
      };
      console.log('User document data to write:', userDocData);
      
      await setDoc(userDoc, userDocData);
      console.log('User document created in Firestore successfully');
      
      return userCredential.user;
    } catch (error: any) {
      console.error('Registration error details:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Check if it's a Firestore error
      if (error.code && error.code.startsWith('firestore/')) {
        throw new Error(`Firestore error: ${error.message} (Code: ${error.code})`);
      }
      
      // Provide more specific error messages
      if (error.code === 'auth/configuration-not-found') {
        throw new Error('Firebase Authentication is not properly configured. Please enable Authentication in Firebase Console.');
      } else if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address.');
      } else if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please check Firestore security rules.');
      } else if (error.code === 'unavailable') {
        throw new Error('Firestore service is unavailable. Please try again later.');
      } else {
        throw new Error(`Registration failed: ${error.message} (Code: ${error.code || 'unknown'})`);
      }
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      throw error;
    }
  }

  getCurrentUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }

  // Observable for auth state changes
  onAuthStateChanged(): Observable<FirebaseUser | null> {
    return new Observable(observer => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        observer.next(user);
      });
      return () => unsubscribe();
    });
  }

  // User methods
  async getUser(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(this.db, 'users', userId));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async createUser(user: User): Promise<void> {
    try {
      await setDoc(doc(this.db, 'users', user.id), {
        ...user,
        createdAt: new Date(),
        isActive: true
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Account methods
  async getAccounts(userId: string): Promise<Account[]> {
    const accountsRef = collection(this.db, 'accounts');
    const q = query(accountsRef, where('ownerId', '==', userId), where('isActive', '==', true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Ensure balance is a number - if undefined, default to 0
      if (data['balance'] === undefined || data['balance'] === null) {
        data['balance'] = 0;
      } else {
        data['balance'] = typeof data['balance'] === 'number' ? data['balance'] : parseFloat(data['balance']) || 0;
      }
      console.log(`Account ${doc.id} balance from Firebase:`, data['balance'], 'Type:', typeof data['balance']);
      return { id: doc.id, ...data } as Account;
    });
  }

  async createAccount(account: Omit<Account, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(this.db, 'accounts'), {
      ...account,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  }

  async updateAccountBalance(accountId: string, newBalance: number): Promise<void> {
    const accountRef = doc(this.db, 'accounts', accountId);
    console.log(`Updating account ${accountId} balance to:`, newBalance);
    await updateDoc(accountRef, {
      balance: newBalance,
      updatedAt: new Date()
    });
    console.log(`Successfully updated account ${accountId} balance to:`, newBalance);
    
    // Verify the update by reading back the balance
    const accountDoc = await getDoc(accountRef);
    if (accountDoc.exists()) {
      const updatedData = accountDoc.data();
      console.log(`Verified account ${accountId} balance in Firebase:`, updatedData['balance']);
    }
  }
  
  async getAccountBalance(accountId: string): Promise<number> {
    try {
      const accountRef = doc(this.db, 'accounts', accountId);
      const accountDoc = await getDoc(accountRef);
      if (accountDoc.exists()) {
        const data = accountDoc.data();
        const balance = typeof data['balance'] === 'number' ? data['balance'] : parseFloat(data['balance']) || 0;
        console.log(`Account ${accountId} current balance from Firebase:`, balance);
        return isNaN(balance) || !isFinite(balance) ? 0 : balance;
      }
      return 0;
    } catch (error) {
      console.error(`Error getting account balance for ${accountId}:`, error);
      return 0;
    }
  }

  // Transaction methods
  async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(this.db, 'transactions'), {
      ...transaction,
      createdAt: new Date()
    });
    return docRef.id;
  }

  async getTransactions(accountId: string): Promise<Transaction[]> {
    const transactionsRef = collection(this.db, 'transactions');
    
    // Get transactions where account is the sender
    const fromQuery = query(
      transactionsRef,
      where('fromAccountId', '==', accountId)
    );
    
    // Get transactions where account is the receiver
    const toQuery = query(
      transactionsRef,
      where('toAccountId', '==', accountId)
    );
    
    // Fetch both queries
    const [fromSnapshot, toSnapshot] = await Promise.all([
      getDocs(fromQuery),
      getDocs(toQuery)
    ]);
    
    // Combine and deduplicate transactions
    const transactionMap = new Map<string, Transaction>();
    
    fromSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data['amount'] !== undefined) {
        data['amount'] = typeof data['amount'] === 'number' ? data['amount'] : parseFloat(data['amount']) || 0;
      }
      transactionMap.set(doc.id, { id: doc.id, ...data } as Transaction);
    });
    
    toSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data['amount'] !== undefined) {
        data['amount'] = typeof data['amount'] === 'number' ? data['amount'] : parseFloat(data['amount']) || 0;
      }
      transactionMap.set(doc.id, { id: doc.id, ...data } as Transaction);
    });
    
    // Convert to array and sort by creation date (newest first)
    return Array.from(transactionMap.values()).sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
      const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }

  // Admin methods
  async getAllUsers(): Promise<User[]> {
    const usersRef = collection(this.db, 'users');
    const querySnapshot = await getDocs(usersRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  }

  async getAllAccounts(): Promise<Account[]> {
    const accountsRef = collection(this.db, 'accounts');
    const querySnapshot = await getDocs(accountsRef);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Ensure balance is a number
      if (data['balance'] !== undefined) {
        data['balance'] = typeof data['balance'] === 'number' ? data['balance'] : parseFloat(data['balance']) || 0;
      }
      return { id: doc.id, ...data } as Account;
    });
  }

  async getAllTransactions(): Promise<Transaction[]> {
    const transactionsRef = collection(this.db, 'transactions');
    const q = query(transactionsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Ensure amount is a number
      if (data['amount'] !== undefined) {
        data['amount'] = typeof data['amount'] === 'number' ? data['amount'] : parseFloat(data['amount']) || 0;
      }
      return { id: doc.id, ...data } as Transaction;
    });
  }
}
