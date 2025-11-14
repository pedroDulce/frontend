import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface SuccessfulQuery {
  id?: number;
  question: string;
  generatedSQL?: string;
  intent: string;
  resultCount?: number;
  executionTime?: number;
  timestamp: Date;
  usageCount: number;
  success?: boolean; // Nota: El backend no tiene un campo 'success'. ¿Debemos eliminarlo?
}

@Component({
  selector: 'app-monitoring',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.css']
})
export class MonitoringComponent implements OnInit {

  private apiCacheMonitorUrl = 'http://localhost:8080/api/cache';
  private apiLearningMonitorUrl = 'http://localhost:8080/api/learning';
  // Cache-related properties
  cacheStats: any = {};
  frequencyStats: any = {};
  cacheContents: any = {};
  clearCacheMessage: string = '';
  clearCacheError: string = '';
  
  // Learning-related properties
  learningStats: any = {};
  popularQueries: SuccessfulQuery[] = [];
  recentQueries: SuccessfulQuery[] = [];
  queriesByIntent: SuccessfulQuery[] = [];
  allQueries: SuccessfulQuery[] = [];
  
  // Configuration
  popularQueriesLimit: number = 10;
  recentQueriesLimit: number = 10;
  intentQueriesLimit: number = 10;
  selectedIntent: string = 'SQL';
  
  // UI state
  loading: boolean = false;
  activeTab: string = 'cache';
  

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadAllData();
  }

  // Método para obtener keys de objetos (solución para el error Object.keys)
  getObjectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  // Método para contar elementos en frequencyStats
  getFrequencyStatsCount(): number {
    return this.frequencyStats ? Object.keys(this.frequencyStats).length : 0;
  }


  loadAllData() {
    if (this.activeTab === 'cache') {
      this.loadCacheData();
    } else {
      this.loadLearningData();
    }
  }

  // Cache methods
  loadCacheData() {
    this.loadCacheStats();
    this.loadFrequencyStats();
    this.loadCacheContents();
  }

  loadCacheStats() {
    this.loading = true;    
    this.http.get(`${this.apiCacheMonitorUrl}/stats`).subscribe({
      next: (stats: any) => {
        console.log('stats: ', stats)
        this.cacheStats = stats;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading cache stats:', error);
        this.loading = false;
      }
    });
  }

  loadFrequencyStats() {
    this.http.get(`${this.apiCacheMonitorUrl}/frequency/7`).subscribe({
      next: (stats: any) => {
        this.frequencyStats = stats;
      },
      error: (error) => {
        console.error('Error loading frequency stats:', error);
      }
    });
  }

  loadCacheContents() {
    this.http.get(`${this.apiCacheMonitorUrl}/contents`).subscribe({
      next: (contents: any) => {
        this.cacheContents = contents;
      },
      error: (error) => {
        console.error('Error loading cache contents:', error);
      }
    });
  }

  clearCache() {
    this.loading = true;
    this.clearCacheMessage = '';
    this.clearCacheError = '';
    
    this.http.post(`${this.apiCacheMonitorUrl}/clear`, {}).subscribe({
      next: (response: any) => {
        this.clearCacheMessage = `${response.message} (${response.timestamp})`;
        this.loading = false;
        // Recargar los datos después de limpiar la cache
        setTimeout(() => {
          this.loadAllData();
        }, 1000);
      },
      error: (error) => {
        console.error('Error clearing cache:', error);
        this.clearCacheError = 'Error al limpiar la cache';
        this.loading = false;
      }
    });
  }

  refreshStats() {
    this.loadAllData();
  }

    // Learning methods
  loadLearningData() {
    this.loadLearningStats();
    this.loadPopularQueries();
    this.loadRecentQueries();
    this.loadQueriesByIntent();
  }

  loadLearningStats() {
    this.loading = true;    
    this.http.get(`${this.apiLearningMonitorUrl}/stats`).subscribe({
      next: (stats: any) => {
        this.learningStats = stats;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading learning stats:', error);
        this.loading = false;
      }
    });
  }

  loadPopularQueries() {    
    this.http.get(`${this.apiLearningMonitorUrl}/queries/popular?limit=${this.popularQueriesLimit}`).subscribe({
      next: (queries: any) => {
        this.popularQueries = queries;
      },
      error: (error) => {
        console.error('Error loading popular queries:', error);
      }
    });
  }

  loadRecentQueries() {    
    this.http.get(`${this.apiLearningMonitorUrl}/queries/recent?limit=${this.recentQueriesLimit}`).subscribe({
      next: (queries: any) => {
        this.recentQueries = queries;
      },
      error: (error) => {
        console.error('Error loading recent queries:', error);
      }
    });
  }

  loadQueriesByIntent() {    
    this.http.get(`${this.apiLearningMonitorUrl}/queries/intent/${this.selectedIntent}?limit=${this.intentQueriesLimit}`).subscribe({
      next: (queries: any) => {
        this.queriesByIntent = queries;
      },
      error: (error) => {
        console.error('Error loading queries by intent:', error);
      }
    });
  }

  loadAllQueries() {    
    this.http.get(`${this.apiLearningMonitorUrl}/queries/all`).subscribe({
      next: (queries: any) => {
        this.allQueries = queries;
      },
      error: (error) => {
        console.error('Error loading all queries:', error);
      }
    });
  }


}