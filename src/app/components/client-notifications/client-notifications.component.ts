import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FirebaseService } from '../../services/firebase.service';
import { Transaction, User } from '../../models/account.model';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
    selector: 'app-client-notifications',
    templateUrl: './client-notifications.component.html',
    styleUrls: ['./client-notifications.component.scss'],
    animations: [
        trigger('fadeInUp', [transition(':enter', [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            animate('500ms cubic-bezier(0.4,0,0.2,1)', style({ opacity: 1, transform: 'translateY(0)' }))
        ])]),
        trigger('fadeIn', [transition(':enter', [
            style({ opacity: 0 }), animate('300ms ease-in', style({ opacity: 1 }))
        ])]),
        trigger('slideRight', [transition(':enter', [
            style({ opacity: 0, transform: 'translateX(-14px)' }),
            animate('400ms cubic-bezier(0.4,0,0.2,1)', style({ opacity: 1, transform: 'translateX(0)' }))
        ])])
    ]
})
export class ClientNotificationsComponent implements OnInit {
    currentUser: User | null = null;
    transactions: Transaction[] = [];
    isLoading = true;

    get pendingTransactions() { return this.transactions.filter(t => t.status === 'pending'); }
    get completedTransactions() { return this.transactions.filter(t => t.status === 'completed'); }
    get rejectedTransactions() { return this.transactions.filter(t => t.status === 'rejected' || t.status === 'failed'); }

    get unreadCount() { return this.pendingTransactions.length; }

    constructor(
        private authService: AuthService,
        private firebaseService: FirebaseService
    ) { }

    ngOnInit() {
        this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
            if (user) this.loadTransactions();
        });
    }

    async loadTransactions() {
        try {
            if (this.currentUser) {
                const accounts = await this.firebaseService.getAccounts(this.currentUser.id);
                const allTx: Transaction[] = [];
                for (const acc of accounts) {
                    const txs = await this.firebaseService.getTransactions(acc.id);
                    allTx.push(...txs);
                }
                // Sort newest first
                this.transactions = allTx.sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
            }
        } catch (e) {
            console.error('Error loading transactions:', e);
        } finally {
            this.isLoading = false;
        }
    }

    getIcon(tx: Transaction): string {
        if (tx.status === 'pending') return '⏳';
        if (tx.status === 'completed') return '✅';
        if (tx.status === 'rejected' || tx.status === 'failed') return '❌';
        return 'ℹ️';
    }

    getColor(tx: Transaction): string {
        if (tx.status === 'pending') return 'orange';
        if (tx.status === 'completed') return 'green';
        return 'red';
    }

    formatCurrency(amount: number, currency = 'EUR'): string {
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(Math.abs(amount));
    }
}
