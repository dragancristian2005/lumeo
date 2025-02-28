import { Injectable, OnDestroy } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { get, getDatabase, onValue, push, ref } from 'firebase/database';
import { off } from '@angular/fire/database';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService implements OnDestroy {
  private currentUserId: string | null = null;
  private db = getDatabase();
  private chatListRef: any;
  private chatListListener: any;
  private friendsIdsSubject = new BehaviorSubject<string[]>([]);
  friendsIds$ = this.friendsIdsSubject.asObservable();
  allFriends: string[] = [];
  private selectedChatSource = new BehaviorSubject<string | null>(null);
  selectedChat$ = this.selectedChatSource.asObservable();

  constructor(private auth: Auth) {
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.currentUserId = user.uid;
        this.listenForChats();
        this.fetchAllFriends();
      }
    });
  }

  private listenForChats() {
    if (!this.currentUserId) return;

    const db = getDatabase();
    const chatsRef = ref(db, 'chats');

    onValue(chatsRef, (snapshot) => {
      const chatData = snapshot.val();
      const friendIds: string[] = [];

      if (chatData) {
        Object.keys(chatData).forEach((chatId) => {
          const participants = chatData[chatId].participants;

          if (participants && participants[this.currentUserId!]) {
            const friendId = Object.keys(participants).find(
              (id) => id !== this.currentUserId,
            );

            if (friendId && !friendIds.includes(friendId)) {
              friendIds.push(friendId);
            }
          }
        });
      }

      this.friendsIdsSubject.next(friendIds);
    });
  }

  fetchAllFriends() {
    if (!this.currentUserId) return;
    const userFollowingRef = ref(
      this.db,
      `users/${this.currentUserId}/following`,
    );
    const userFollowersRef = ref(
      this.db,
      `users/${this.currentUserId}/followers`,
    );
    onValue(userFollowingRef, (snapshot) => {
      const following = snapshot.val();
      if (following) {
        Object.keys(following).forEach((userId) => {
          if (!this.allFriends.includes(userId)) {
            this.allFriends.push(userId);
          }
        });
      }
    });
    onValue(userFollowersRef, (snapshot) => {
      const followers = snapshot.val();
      if (followers) {
        Object.keys(followers).forEach((userId) => {
          if (!this.allFriends.includes(userId)) {
            this.allFriends.push(userId);
          }
        });
      }
    });
  }

  createChat(currentUserId: string, friendId: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const chatRef = ref(this.db, 'chats');

        const newChat = {
          participants: {
            [currentUserId]: true,
            [friendId]: true,
          },
          lastMessage: '',
          lastMessageTimestamp: '',
        };

        const newChatRef = push(chatRef, newChat);
        resolve(newChatRef.key!);
      } catch (error) {
        reject(error);
      }
    });
  }

  async checkIfChatExists(
    currentUserId: string,
    friendId: string,
  ): Promise<string | null> {
    try {
      const chatsRef = ref(this.db, 'chats');
      const snapshot = await get(chatsRef);
      const chatData = snapshot.val();

      if (chatData) {
        for (const chatId of Object.keys(chatData)) {
          const participants = chatData[chatId].participants;
          if (
            participants &&
            participants[currentUserId] &&
            participants[friendId]
          ) {
            return chatId;
          }
        }
      }

      const newChatId = await this.createChat(currentUserId, friendId);
      return newChatId;
    } catch (error) {
      console.error('Error checking chat existence:', error);
      return null;
    }
  }

  async getChatId(userId1: string, userId2: string): Promise<string | null> {
    const chatsRef = ref(this.db, 'chats');
    const snapshot = await get(chatsRef);

    if (!snapshot.exists()) return null;

    const chats = snapshot.val();
    for (const chatId in chats) {
      const participants = chats[chatId].participants;
      if (participants[userId1] && participants[userId2]) {
        return chatId;
      }
    }
    return null;
  }

  fetchChatMessages(chatId: string): Observable<any[]> {
    return new Observable((observer) => {
      if (!chatId) {
        observer.next([]);
        return;
      }

      const messagesInfoRef = ref(this.db, `chats/${chatId}/messages`);

      onValue(messagesInfoRef, (snapshot) => {
        const messagesInfo = snapshot.val();
        if (messagesInfo) {
          observer.next(Object.values(messagesInfo));
        } else {
          observer.next([]);
        }
      });
    });
  }

  getAllFriendsIds() {
    return this.allFriends;
  }

  selectChat(friendId: string) {
    this.selectedChatSource.next(friendId);
  }

  ngOnDestroy() {
    if (this.chatListListener) {
      off(this.chatListRef);
    }
  }
}
