import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from '../../services/firebase.service';
import { User, KycDocument } from '../../models/account.model';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-client-kyc',
  templateUrl: './client-kyc.component.html',
  styleUrls: ['./client-kyc.component.scss'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ClientKycComponent implements OnInit {
  kycForm: FormGroup;
  currentUser: User | null = null;
  existingKyc: KycDocument | null = null;

  loading = true;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  frontFile: File | null = null;
  backFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService
  ) {
    this.kycForm = this.fb.group({
      documentType: ['', Validators.required],
      documentNumber: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUserAndKyc();
  }

  async loadUserAndKyc() {
    this.loading = true;
    try {
      const firebaseUser = this.firebaseService.getCurrentUser();
      if (!firebaseUser) return;

      this.currentUser = await this.firebaseService.getUser(firebaseUser.uid);
      if (this.currentUser) {
        this.existingKyc = await this.firebaseService.getUserKyc(this.currentUser.id);
      }
    } catch (error) {
      console.error('Error loading KYC info:', error);
    } finally {
      this.loading = false;
    }
  }

  onFileSelect(event: any, type: 'front' | 'back') {
    const file = event.target.files[0];
    if (file) {
      if (type === 'front') this.frontFile = file;
      else this.backFile = file;
    }
  }

  async onSubmit() {
    if (this.kycForm.invalid || !this.currentUser) return;

    // In a real app we'd upload frontFile and backFile to Firebase Storage here and get URLs.
    // We'll mock it for now.
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const kycData = {
        userId: this.currentUser.id,
        userName: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
        documentType: this.kycForm.value.documentType,
        documentNumber: this.kycForm.value.documentNumber,
        documentFrontUrl: this.frontFile ? 'mock-front-url' : undefined,
        documentBackUrl: this.backFile ? 'mock-back-url' : undefined,
      };

      await this.firebaseService.submitKyc(kycData);
      this.successMessage = 'Your KYC documents have been submitted successfully!';

      // Reload KYC status
      await this.loadUserAndKyc();
      this.kycForm.reset();
      this.frontFile = null;
      this.backFile = null;

    } catch (error: any) {
      this.errorMessage = 'Failed to submit documents: ' + error.message;
      console.error(error);
    } finally {
      this.isSubmitting = false;
    }
  }
}
