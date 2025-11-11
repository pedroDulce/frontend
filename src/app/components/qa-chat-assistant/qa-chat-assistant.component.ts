import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QaApiService, ChatResponse, SourceDTO } from '../../services/qa-api.service';

// Interface corregida
interface QAMessage {
  text: string;
  type: 'user' | 'assistant';  // ← Tipo literal, no string genérico
  timestamp: Date;
  suggestions?: string[];
  sources?: SourceDTO[];
}

@Component({
  selector: 'app-qa-chat-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './qa-chat-assistant.component.html',
  styleUrls: ['./qa-chat-assistant.component.css']
})
export class QaChatAssistantComponent implements OnInit {
  isCollapsed = false;
  messages: QAMessage[] = [];
  loading = false;
  userInput = '';
  backendStatus: 'checking' | 'connected' | 'error' = 'checking';

  constructor(private qaApi: QaApiService) {}

  ngOnInit() {
    this.checkBackendConnection();
  }

  toggleChat() {
    this.isCollapsed = !this.isCollapsed;
  }

  useSuggestion(suggestion: string) {
    this.userInput = suggestion;
  }

  clearChat() {
    this.messages = [];
    this.addWelcomeMessage();
  }

  // Función corregida para enviar mensajes
  sendMessage() {
    if (!this.userInput.trim() || this.loading) return;

    // Crear mensaje de usuario con tipo correcto
    const userMessage: QAMessage = {
      text: this.userInput,
      type: 'user',  // ← Tipo literal 'user'
      timestamp: new Date()
    };

    this.messages.push(userMessage);
    const currentInput = this.userInput;
    this.userInput = '';
    this.loading = true;

    this.qaApi.sendMessage(currentInput).subscribe({
      next: (response: ChatResponse) => {
        // Crear mensaje del asistente con tipo correcto
        const assistantMessage: QAMessage = {
          text: response.answer,
          type: 'assistant',  // ← Tipo literal 'assistant'
          timestamp: new Date(),
          suggestions: response.suggestions,
          sources: response.sources
        };

        this.messages.push(assistantMessage);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error:', error);
        const errorMessage: QAMessage = {
          text: '❌ Error conectando con el servidor',
          type: 'assistant',  // ← Tipo literal
          timestamp: new Date()
        };
        this.messages.push(errorMessage);
        this.loading = false;
      }
    });
  }

  private checkBackendConnection() {
    this.backendStatus = 'checking';
    this.qaApi.getRanking().subscribe({
      next: () => {
        this.backendStatus = 'connected';
        this.addWelcomeMessage();
      },
      error: () => {
        this.backendStatus = 'error';
        this.addWelcomeMessage();
      }
    });
  }

  private addWelcomeMessage() {
    if (this.messages.length === 0) {
      const welcomeMessage: QAMessage = {
        text: '¡Hola! Soy tu asistente de QA. ¿En qué puedo ayudarte?',
        type: 'assistant',
        timestamp: new Date(),
        suggestions: [
          '¿Qué entidades principales tiene el sistema?',
          '¿Cómo se calcula el ranking de cobertura?',
          'Explícame el modelo de datos'
        ]
      };
      this.messages.push(welcomeMessage);
    }
  }

  trackByFn(index: number, item: QAMessage): number {
    return index;
  }
}