import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QaApiService } from '../../services/qa-api.service';
import { UnifiedQueryResult, ChatMessage, QuestionRequest } from '../../models/chat.model';
import { MonitoringComponent } from '../monitoring/monitoring.component';
import { RankingComponent } from "../ranking/ranking.component";

@Component({
  selector: 'app-qa-chat-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, MonitoringComponent, RankingComponent],
  templateUrl: './qa-chat-assistant.component.html',
  styleUrls: ['./qa-chat-assistant.component.css']
})
export class QaChatAssistantComponent implements OnInit {
[x: string]: any;
  messages: ChatMessage[] = [];
  loading = false;
  userInput = '';
  isCollapsed = false;
  serverAvailable = true;  
  showMonitoringView: boolean = false;

  constructor(private qaService: QaApiService) {}
  
  showMonitoring() {
    this.showMonitoringView = true;
  }

  showHome() {
    this.showMonitoringView = false;
  }

  ngOnInit() {
    this.checkServerConnection();
    this.addWelcomeMessage();
  }

  toggleChat() {
    this.isCollapsed = !this.isCollapsed;
  }

  trackByFn(index: number, item: ChatMessage): string {
    return `${item.timestamp.getTime()}-${index}`;
  }

  private addWelcomeMessage() {
    const welcomeMessage: ChatMessage = {
      text: '¡Hola! Soy tu asistente de QA. ¿En qué puedo ayudarte?',
      type: 'assistant',
      timestamp: new Date(),
      isError: false,
      suggestions: [
        'Listar todas las actividades',
        'Mostrar actividades completadas',
        'Consultar progreso por aplicación',
        'Explicar el proceso de testing'
      ],
      response: {
        originalQuestion: '',
        intent: 'WELCOME',
        answer: '¡Hola! Soy tu asistente de QA. ¿En qué puedo ayudarte?',
        success: true
      }
    };
    this.messages = [welcomeMessage];
  }

  checkServerConnection() {
    this.qaService.checkServerStatus().subscribe({
      next: () => {
        this.serverAvailable = true;
      },
      error: () => {
        this.serverAvailable = false;
        this.addSystemMessage('El servidor no está disponible. Verifica que el backend esté ejecutándose.');
      }
    });
  }

  sendMessage() {
    if (this.loading || !this.userInput.trim() || !this.serverAvailable) {
      return;
    }

    this.loading = true;

    const userMessage: ChatMessage = {
      text: this.userInput,
      type: 'user',
      timestamp: new Date()
    };

    this.messages = [...this.messages, userMessage];
    const currentInput = this.userInput;
    this.userInput = '';

    this.qaService.askQuestion(currentInput).subscribe({
      next: (response: UnifiedQueryResult) => {
        const assistantMessage: ChatMessage = {
          text: response.answer,
          type: 'assistant',
          timestamp: new Date(),
          suggestions: response.suggestions || [],
          isError: !response.success,
          response: response // Los sources vienen dentro de response
        };

        this.messages = [...this.messages, assistantMessage];
        this.loading = false;
      },
      error: (error: any) => {
        const errorMessage: ChatMessage = {
          text: error.userMessage || 'Error de conexión con el servidor.',
          type: 'assistant',
          timestamp: new Date(),
          suggestions: ['Reintentar', 'Verificar conexión'],
          isError: true          
        };

        this.messages = [...this.messages, errorMessage];
        this.loading = false;
      }
    });
  }

  useSuggestion(suggestion: string) {
    if (this.loading) return;

    if (suggestion === 'Reintentar' && this.messages.length > 0) {
      const lastUserMessage = this.messages
        .filter(msg => msg.type === 'user')
        .pop();
      
      if (lastUserMessage) {
        this.userInput = lastUserMessage.text;
        setTimeout(() => this.sendMessage(), 100);
      }
      return;
    }

    if (suggestion === 'Verificar conexión') {
      this.checkServerConnection();
      return;
    }

    this.userInput = suggestion;
    setTimeout(() => this.sendMessage(), 100);
  }

  private addSystemMessage(text: string) {
    const systemMessage: ChatMessage = {
      text: text,
      type: 'system',
      timestamp: new Date()
    };
    this.messages = [...this.messages, systemMessage];
  }

  clearChat() {
    this.messages = [];
    this.userInput = '';
    this.loading = false;
    setTimeout(() => this.addWelcomeMessage(), 100);
  }

  getTableColumns(results: any[]): string[] {
    if (!results || results.length === 0) return [];
    return Object.keys(results[0]);
  }

  formatTableCell(value: any): string {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'object') return JSON.stringify(value);
    return value.toString();
  }
}