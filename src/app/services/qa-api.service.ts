import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

export interface Aplicacion {
  id?: number;
  nombre?: string;
  descripcion?: string;
  equipoResponsable?: string;
  estado?: string;
  fechaCreacion?: Date;
  elementosPromocionables?: any[];
}

export interface RankingDTO {
  aplicacion: Aplicacion;
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

  // Verificar salud del backend
  checkHealth(): Observable<any> {
    return this.http.get('http://localhost:8080/actuator/health');
  }
}