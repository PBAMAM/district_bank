import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AccountOverviewComponent } from './components/account-overview/account-overview.component';
import { TransferComponent } from './components/transfer/transfer.component';
import { FinancialPlannerComponent } from './components/financial-planner/financial-planner.component';
import { ClientLoginComponent } from './components/client-login/client-login.component';
import { ClientDashboardComponent } from './components/client-dashboard/client-dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: '/client', pathMatch: 'full' },
  
  // Admin routes - using lazy loading
  { 
    path: 'admin', 
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  
  // Client routes
  { path: 'client', component: ClientLoginComponent },
  { path: 'client/dashboard', component: ClientDashboardComponent },
  { path: 'client/transfer', component: TransferComponent },
  { path: 'client/accounts', component: AccountOverviewComponent },
  { path: 'client/transactions', component: FinancialPlannerComponent },
  
  // Legacy routes (for backward compatibility)
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: AccountOverviewComponent },
      { path: 'transfer', component: TransferComponent },
      { path: 'planner', component: FinancialPlannerComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }