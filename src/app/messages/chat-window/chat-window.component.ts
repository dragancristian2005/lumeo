import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { NgIf } from '@angular/common';
import { get, getDatabase, push, ref } from 'firebase/database';
import { FormsModule } from '@angular/forms';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-chat-window',
  imports: [NgIf, FormsModule],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.scss',
})
export class ChatWindowComponent implements OnInit {
  currentUserId: string | null = null;
  chatFriendId: string | null = null;
  selectedUsername: string | null = null;
  messageContent = '';
  chatId: string | null = null;

  constructor(
    private chatService: ChatService,
    private auth: Auth,
  ) {}

  db = getDatabase();
  ngOnInit() {
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.currentUserId = user.uid;
      }
    });

    this.chatService.selectedChat$.subscribe(async (friendId) => {
      if (!this.currentUserId || !friendId) return;

      this.chatFriendId = friendId;
      this.chatId = await this.chatService.getChatId(
        this.currentUserId,
        friendId,
      );
      this.getFriendInfo(friendId);
    });
  }

  getFriendInfo(friendId: string) {
    const usersRef = ref(this.db, 'users');

    get(usersRef).then((snapshot) => {
      const usersData = snapshot.val();
      if (usersData) {
        const username = usersData[friendId].username;
        if (username) {
          this.selectedUsername = username;
        }
      }
    });
  }

  sendNewMessage() {
    const messageRef = ref(this.db, `chats/${this.chatId}/messages`);

    const newMessage = {
      sender: this.currentUserId,
      content: this.messageContent,
      timestamp: Date.now(),
    };
    this.messageContent = '';
    push(messageRef, newMessage);
  }
}
