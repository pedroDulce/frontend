import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QaChatAssistantComponent } from "./components/qa-chat-assistant/qa-chat-assistant.component";

@Component({
  selector: 'app-root',
  standalone: true,  // ← MANTENER true
  imports: [
    CommonModule,
    QaChatAssistantComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'QA Assistant';
}