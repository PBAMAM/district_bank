import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { NgChartsModule } from 'ng2-charts';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AccountOverviewComponent } from './components/account-overview/account-overview.component';
import { TransferComponent } from './components/transfer/transfer.component';
import { FinancialPlannerComponent } from './components/financial-planner/financial-planner.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ClientLoginComponent } from './components/client-login/client-login.component';
import { ClientDashboardComponent } from './components/client-dashboard/client-dashboard.component';
import { ClientLayoutComponent } from './components/client-layout/client-layout.component';
// import { TestAdminComponent } from './components/test-admin/test-admin.component';
import { AdminModule } from './admin/admin.module';
import { FirebaseTestService } from './services/firebase-test.service';
import { FirebaseDebugService } from './services/firebase-debug.service';

import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    AccountOverviewComponent,
    TransferComponent,
    FinancialPlannerComponent,
    NavbarComponent,
    SidebarComponent,
    ClientLoginComponent,
    ClientDashboardComponent,
    ClientLayoutComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgChartsModule,
    AdminModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ],
  providers: [FirebaseTestService],
  bootstrap: [AppComponent]
})
export class AppModule { }
