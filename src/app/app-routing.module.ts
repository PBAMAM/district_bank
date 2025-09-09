import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AccountOverviewComponent } from './components/account-overview/account-overview.component';
import { TransferComponent } from './components/transfer/transfer.component';
import { FinancialPlannerComponent } from './components/financial-planner/financial-planner.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: AccountOverviewComponent },
      { path: 'transfer', component: TransferComponent },
      { path: 'planner', component: FinancialPlannerComponent },
      { path: 'admin', component: AdminPanelComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
