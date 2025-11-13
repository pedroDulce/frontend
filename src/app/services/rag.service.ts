import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatRequest, UnifiedQueryResult, RankingDTO } from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class RagService {
  private apiUrl = 'http://localhost:8080/api/qa-assistant';

  constructor(private http: HttpClient) { }

  sendQuery(question: string): Observable<UnifiedQueryResult> {
    return this.http.post<UnifiedQueryResult>(`${this.apiUrl}/chat`, { question });
  }

  getRanking(): Observable<RankingDTO[]> {
    return this.http.get<RankingDTO[]>(`${this.apiUrl}/ranking`);
  }

  indexDocument(content: string, category: string, source: string): Observable<string> {
    return this.http.post(`${this.apiUrl}/admin/index`, 
      { content, category, source }, 
      { responseType: 'text' }
    );
  }
}