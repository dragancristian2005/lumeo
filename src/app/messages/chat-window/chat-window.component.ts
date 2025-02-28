import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { get, getDatabase, push, ref, set } from 'firebase/database';
import { FormsModule } from '@angular/forms';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chat-window',
  imports: [NgIf, FormsModule, NgForOf, AsyncPipe],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.scss',
})
export class ChatWindowComponent implements OnInit {
  currentUserId: string | null = null;
  chatFriendId: string | null = null;
  selectedUsername: string | null = null;
  messageContent = '';
  chatId: string | null = null;
  messagesInfo$: Observable<any[]> | null = null;

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

      if (this.chatId) {
        this.messagesInfo$ = this.chatService.fetchChatMessages(this.chatId);
      }
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
    if (!this.messageContent || !this.currentUserId || !this.chatId) return;

    const messageRef = ref(this.db, `chats/${this.chatId}/messages`);
    const usernameRef = ref(this.db, `users/${this.currentUserId}/username`);
    const chatRef = ref(this.db, `chats/${this.chatId}`);
    const timestamp = Date.now(); // Get the current timestamp

    get(usernameRef).then((snapshot) => {
      const username = snapshot.exists() ? snapshot.val() : 'Unknown';

      const newMessage = {
        sender: this.currentUserId,
        senderUsername: username,
        content: this.messageContent,
        timestamp,
      };

      this.messageContent = '';

      push(messageRef, newMessage)
        .then(() => get(chatRef))
        .then((chatSnapshot) => {
          if (chatSnapshot.exists()) {
            const chatData = chatSnapshot.val();
            chatData.lastMessage = newMessage.content;
            chatData.lastMessageTimestamp = timestamp;
            return set(chatRef, chatData);
          }
          return;
        })
        .catch((error) => {
          console.error('Error sending message:', error);
        });
    });
  }
}
