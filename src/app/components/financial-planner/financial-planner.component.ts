import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-financial-planner',
  templateUrl: './financial-planner.component.html',
  styleUrls: ['./financial-planner.component.scss']
})
export class FinancialPlannerComponent implements OnInit {
  // Chart data for income/expenditure
  incomeExpenditureData = {
    labels: ['July', 'August', 'September'],
    datasets: [
      {
        label: 'Income',
        data: [4500, 4800, 4793],
        backgroundColor: '#28a745',
        borderColor: '#28a745',
        borderWidth: 1
      },
      {
        label: 'Expenditure',
        data: [3200, 3500, 3813],
        backgroundColor: '#dc3545',
        borderColor: '#dc3545',
        borderWidth: 1
      }
    ]
  };

  // Chart options
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#ffffff'
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#ffffff'
        },
        grid: {
          color: '#444'
        }
      },
      y: {
        ticks: {
          color: '#ffffff'
        },
        grid: {
          color: '#444'
        }
      }
    }
  };

  // Forecast data
  forecastData = {
    labels: ['Today', 'Oct 2024', 'Nov 2024', 'Dec 2024', 'Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025', 'Jun 2025', 'Jul 2025', 'Aug 2025', 'Sep 2025'],
    datasets: [{
      label: 'Account Balance',
      data: [1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2500, 2520, 2525, 2526, 2527],
      borderColor: '#28a745',
      backgroundColor: 'rgba(40, 167, 69, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  // Fixed costs data
  fixedCostsData = {
    labels: ['September', 'October', 'Expected Monthly Avg'],
    datasets: [{
      label: 'Fixed Costs',
      data: [1401, 1346, 1368],
      backgroundColor: '#6c757d',
      borderColor: '#6c757d',
      borderWidth: 1
    }]
  };

  // Budget data
  budgetData = {
    labels: ['Posted', 'Remaining'],
    datasets: [{
      data: [488, 1312],
      backgroundColor: ['#28a745', '#6c757d'],
      borderWidth: 0
    }]
  };

  budgetOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    }
  };

  // Keywords
  keywords = ['#Haus', '#Altersvorsorge', '#Auto'];

  constructor() { }

  ngOnInit() {
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }
}
