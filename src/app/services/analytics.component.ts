import { Component, OnInit } from "@angular/core";
import { QaApiService } from "./qa-api.service";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-qa-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="analytics-panel">
      <h3>📊 Analytics del Sistema</h3>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ analytics.totalQueries }}</div>
          <div class="stat-label">Total Consultas</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-value">{{ analytics.successfulQueries }}</div>
          <div class="stat-label">Éxitos</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-value">{{ analytics.averageExecutionTime | number:'1.0-0' }}ms</div>
          <div class="stat-label">Tiempo Promedio</div>
        </div>
      </div>

      <div class="popular-intents">
        <h4>Intenciones Populares</h4>
        <div *ngFor="let intent of analytics.popularIntents" class="intent-item">
          <span class="intent-name">{{ intent[0] }}</span>
          <span class="intent-count">{{ intent[1] }}</span>
        </div>
      </div>

      <div class="recent-queries">
        <h4>Consultas Recientes</h4>
        <div *ngFor="let query of analytics.recentQueries" class="query-item">
          <div class="query-text">{{ query.question }}</div>
          <div class="query-meta">
            <span class="intent-badge">{{ query.intent }}</span>
            <span class="execution-time">{{ query.executionTime | number:'1.0-0' }}ms</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class QaAnalyticsComponent implements OnInit {
  analytics: any = {};

  constructor(private enhancedQaService: QaApiService) {}

  ngOnInit() {
    this.loadAnalytics();
  }

  loadAnalytics() {
    this.analytics = this.enhancedQaService.getAnalytics();
  }
}
