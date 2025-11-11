import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';

// Interfaces para las fuentes de información
export interface SourceDTO {
  type: string;
  description: string;
  title?: string;
  url?: string;
  content?: string;
}

export interface ChatRequest {
  question: string;
}

export interface ChatResponse {
  answer: string;
  suggestions?: string[];
  sources?: SourceDTO[];
}


export interface RankingDTO {
  nombre?: string;        // ← debe coincidir con el JSON
  descripcion?: string;
  equipoResponsable?: string; 
  estado?: string;
  fechaCreacion?: Date; 
  cobertura: number;   
}

@Injectable({
  providedIn: 'root'
})
export class QaApiService {
  private baseUrl = 'http://localhost:8080/api/qa-assistant';

  constructor(private http: HttpClient) {}

  // Endpoint de chat
  sendMessage(question: string): Observable<ChatResponse> {
    const request: ChatRequest = { question };
    return this.http.post<ChatResponse>(`${this.baseUrl}/chat`, request);
  }

  // Endpoint de ranking
  getRanking(): Observable<RankingDTO[]> {
    return this.http.get<RankingDTO[]>(`${this.baseUrl}/ranking`);
  }

  // En tu servicio del frontend (qa-chat-assistant.service.ts)
  getRankingData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/ranking`).pipe(
      tap((response: any) => {
        console.log('📊 Respuesta del ranking:', response);
        // Verifica que los datos tengan la estructura correcta
      }),
      catchError(error => {
        console.error('❌ Error fetching ranking:', error);
        return of(null);
      })
    );
  }

  // Verificar salud del backend
  checkHealth(): Observable<any> {
    return this.http.get('http://localhost:8080/actuator/health');
  }
}