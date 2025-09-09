import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { Account, Transaction, User, LoginCredentials } from '../models/account.model';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app = initializeApp(environment.firebase);
  private auth = getAuth(this.app);
  private db = getFirestore(this.app);

  constructor() { }

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
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const userDoc = doc(this.db, 'users', userCredential.user.uid);
      await updateDoc(userDoc, {
        ...userData,
        createdAt: new Date(),
        isActive: true
      });
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  getCurrentUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }

  // Account methods
  async getAccounts(userId: string): Promise<Account[]> {
    const accountsRef = collection(this.db, 'accounts');
    const q = query(accountsRef, where('ownerId', '==', userId), where('isActive', '==', true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account));
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
    await updateDoc(accountRef, {
      balance: newBalance,
      updatedAt: new Date()
    });
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
    const q = query(
      transactionsRef,
      where('fromAccountId', '==', accountId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
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
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account));
  }

  async getAllTransactions(): Promise<Transaction[]> {
    const transactionsRef = collection(this.db, 'transactions');
    const q = query(transactionsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
  }
}
