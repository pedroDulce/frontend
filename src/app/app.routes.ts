import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { MonitoringComponent } from './components/monitoring/monitoring.component';

export const routes: Routes = [
  { path: '', component: AppComponent },
  { path: 'monitoring', component: MonitoringComponent }
];