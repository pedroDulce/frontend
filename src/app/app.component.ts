import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
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
  `
})
export class AppComponent {
  title: any;
}