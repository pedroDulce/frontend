import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RankingComponent } from './components/ranking/ranking.component';
import { QaChatAssistantComponent } from './components/qa-chat-assistant/qa-chat-assistant.component';

@NgModule({
  declarations: [
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    RankingComponent, 
    QaChatAssistantComponent 
  ],
  providers: [],
  bootstrap: []
})
export class AppModule { }