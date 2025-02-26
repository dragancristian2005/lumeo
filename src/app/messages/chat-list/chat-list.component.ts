import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '@angular/fire/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-list',
  imports: [NgForOf, NgIf, FormsModule],
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.scss',
})
export class ChatListComponent implements OnInit, OnDestroy {
  friendsIds: string[] = [];
  searchQuery = '';
  allFriendsIds: string[] = [];
  private currentUserId: string | null = null;
  private friendsSubscription!: Subscription;

  constructor(
    private chatService: ChatService,
    private auth: Auth,
  ) {
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.currentUserId = user.uid;
      }
    });
  }

  ngOnInit() {
    this.friendsSubscription = this.chatService.friendsIds$.subscribe(
      (friends) => {
        this.friendsIds = friends;
      },
    );
    this.allFriendsIds = this.chatService.getAllFriendsIds();
  }

  ngOnDestroy() {
    if (this.friendsSubscription) {
      this.friendsSubscription.unsubscribe();
    }
  }

  async createNewChat(participantId: string) {
    if (!this.currentUserId) return;

    try {
      await this.chatService.checkIfChatExists(
        this.currentUserId,
        participantId,
      );
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  }
}
