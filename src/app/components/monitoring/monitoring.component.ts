import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-monitoring',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.css']
})
export class MonitoringComponent implements OnInit {
  cacheStats: any = {};
  frequencyStats: any = {};
  private apiUrl = 'http://localhost:8080/api/qa-assistant';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.http.get(`${this.apiUrl}/api/cache/stats`).subscribe(stats => {
      this.cacheStats = stats;
    });
    
    this.http.get(`${this.apiUrl}/api/cache/frequent-queries/7`).subscribe(stats => {
      this.frequencyStats = stats;
    });
  }

  refreshStats() {
    this.loadStats();
  }
}