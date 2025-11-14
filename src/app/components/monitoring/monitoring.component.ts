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
  cacheStats: any = {
      size: 150,
      oldestEntryAge: 3600
    };;
  frequencyStats: any = {
      "¿Qué es Angular?": 45,
      "¿Cómo usar RxJS?": 32,
      "¿Qué es TypeScript?": 28
    };
  private apiUrl = 'http://localhost:8080/api/cache';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    console.log(('iniciando monitorización...'));
    this.loadStats();
  }

  loadStats() {
    this.http.get(`${this.apiUrl}/stats`).subscribe(stats => {
      this.cacheStats = stats;
    });
    
    this.http.get(`${this.apiUrl}/frequent-queries/7`).subscribe(stats => {
      this.frequencyStats = stats;
    });
  }

  refreshStats() {
    this.loadStats();
  }

}