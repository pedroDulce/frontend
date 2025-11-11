import { Component } from '@angular/core';
import { QaChatAssistantComponent } from "./components/qa-chat-assistant/qa-chat-assistant.component";
import { RankingComponent } from "./components/ranking/ranking.component";


@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="header-content">
          <h1>🏆 Catálogo QA Assistant</h1>
          <p>Sistema inteligente de gestión de calidad de aplicaciones</p>
        </div>
        <div class="status-indicator">
          <span class="status-dot"></span>
          <span>Sistema activo</span>
        </div>
      </header>
      
      <main class="app-main">
        <div class="content-area">
          <app-ranking></app-ranking>
        </div>
      </main>
      
      <app-qa-chat-assistant></app-qa-chat-assistant>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    }
    
    .app-header {
      background: white;
      padding: 1.5rem 2rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border-bottom: 3px solid #3b82f6;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .header-content h1 {
      margin: 0;
      color: #1e293b;
      font-size: 1.8rem;
      font-weight: 700;
    }
    
    .header-content p {
      margin: 0.25rem 0 0 0;
      color: #64748b;
      font-size: 0.95rem;
    }
    
    .status-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #059669;
      font-size: 0.875rem;
      font-weight: 500;
    }
    
    .status-dot {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    
    .app-main {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `],
  imports: [QaChatAssistantComponent, RankingComponent]
})
export class AppComponent {
  title: any;
}
