import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../../services/firebase.service';
import { KycDocument } from '../../../models/account.model';

@Component({
    selector: 'app-admin-kyc',
    templateUrl: './admin-kyc.component.html',
    styleUrls: ['./admin-kyc.component.scss']
})
export class AdminKycComponent implements OnInit {
    kycDocuments: KycDocument[] = [];
    loading = true;

    constructor(private firebaseService: FirebaseService) { }

    ngOnInit(): void {
        this.loadKycDocuments();
    }

    async loadKycDocuments() {
        this.loading = true;
        try {
            this.kycDocuments = await this.firebaseService.getAllKycDocuments();
        } catch (error) {
            console.error('Error loading KYC documents:', error);
        } finally {
            this.loading = false;
        }
    }

    async updateStatus(kycId: string, status: 'approved' | 'rejected') {
        const adminUser = this.firebaseService.getCurrentUser();
        if (!adminUser) return;

        let reason = '';
        if (status === 'rejected') {
            reason = prompt('Enter rejection reason:') || 'No reason provided';
        }

        try {
            await this.firebaseService.updateKycStatus(kycId, status, adminUser.uid, reason);
            await this.loadKycDocuments();
        } catch (error) {
            console.error('Error updating KYC status:', error);
        }
    }
}
