import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { get, getDatabase, ref } from 'firebase/database';
import { Friend } from '../../types/friend.types';
import { RelativeTimePipe } from '../../profile/relative-time.pipe';

@Component({
  selector: 'app-chat-list',
  imports: [NgForOf, NgIf, FormsModule, RelativeTimePipe],
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.scss',
})
export class ChatListComponent implements OnInit, OnDestroy {
  friendsIds: string[] = [];
  friendsInfo: Friend[] = [];
  searchQuery = '';
  allFriendsIds: string[] = [];
  allFriendsInfo: Friend[] = [];
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

  db = getDatabase();

  ngOnInit() {
    this.friendsSubscription = this.chatService.friendsIds$.subscribe(
      (friends) => {
        this.friendsIds = friends;
      },
    );
    this.allFriendsIds = this.chatService.getAllFriendsIds();
    this.getAllFriendsInfo();
    this.getFriendsInfo();
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

  getAllFriendsInfo() {
    const allUsersIds = ref(this.db, 'users');
    get(allUsersIds).then((snapshot) => {
      const usersIds = Object.keys(snapshot.val());
      usersIds.forEach((id) => {
        if (this.allFriendsIds.includes(id)) {
          const newFriendInfo: Friend = {
            id: id,
            username: snapshot.child(id).child('username').val(),
            friendProfilePic:
              snapshot.child(id).child('profilePic').val() || '',
          };
          this.allFriendsInfo.push(newFriendInfo);
        }
      });
    });
  }

  openChat(friendId: string) {
    this.chatService.selectChat(friendId);
  }

  getFriendsInfo() {
    const allUsersRef = ref(this.db, 'users');

    get(allUsersRef).then((snapshot) => {
      const users = snapshot.val();
      this.friendsInfo = this.friendsIds.map((id) => ({
        id,
        username: users[id]?.username || 'Unknown',
        friendProfilePic: users[id]?.profilePic || '',
        lastMessage: '',
        lastMessageTimestamp: 0,
      }));

      this.friendsInfo.forEach((friend) => {
        this.getLastMessage(friend.id).then((lastMessageData) => {
          friend.lastMessage = lastMessageData.message;
          friend.lastMessageTimestamp = lastMessageData.timestamp;
        });
      });
    });
  }

  async getLastMessage(
    friendId: string,
  ): Promise<{ message: string; timestamp: number }> {
    const chatId = await this.chatService.getChatId(
      this.currentUserId!,
      friendId,
    );
    if (!chatId) return { message: '', timestamp: 0 };

    const chatRef = ref(this.db, `chats/${chatId}`);
    const snapshot = await get(chatRef);

    if (snapshot.exists()) {
      const chatData = snapshot.val();
      return {
        message: chatData.lastMessage || '',
        timestamp: chatData.lastMessageTimestamp || 0,
      };
    }
    return { message: '', timestamp: 0 };
  }
}
