import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  currentDateStr: string = '';
  botOpen: boolean = false;
  botInput: string = '';
  botMessages: Array<{ sender: 'bot' | 'user'; text: string }> = [
    { sender: 'bot', text: 'Namaste! I am AICTE Sahayak, your automated regulatory assistant. How can I assist you with APAAR ID verification or approved intake audit?' }
  ];

  ngOnInit() {
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
  }

  updateTime() {
    const now = new Date();
    this.currentDateStr = now.toLocaleString('en-IN', {
      weekday: 'long',
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    });
  }

  toggleBot() {
    this.botOpen = !this.botOpen;
  }

  sendBotMessage(query?: string) {
    const text = query || this.botInput;
    if (!text.trim()) return;

    this.botMessages.push({ sender: 'user', text });
    if (!query) this.botInput = '';

    setTimeout(() => {
      let reply = 'Under SIH PS 26263, APAAR Verify synchronizes student records with the National Academic Depository (NAD) and DigiLocker.';
      const l = text.toLowerCase();
      if (l.includes('apaar')) {
        reply = 'APAAR ID is a 12-digit lifelong academic identifier under NEP 2020 linking DigiLocker, ABC credits, and AICTE approval databases.';
      } else if (l.includes('duplicate')) {
        reply = 'The AICTE National Registry checks for duplicate APAAR IDs across all institutions in real-time and issues immediate regulatory flags.';
      } else if (l.includes('intake')) {
        reply = 'Colleges cannot admit students beyond their Sanctioned Approved Intake unless under the 5% Supernumerary (TFW) or 15% NRI/FN quota.';
      }
      this.botMessages.push({ sender: 'bot', text: reply });
    }, 500);
  }
}
