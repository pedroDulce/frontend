import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { QaChatAssistantComponent } from './components/qa-chat-assistant/qa-chat-assistant.component';
import { RankingComponent } from './components/ranking/ranking.component';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    QaChatAssistantComponent,
    RankingComponent
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi())
  ]
})
export class AppModule { }