import { Injectable } from '@angular/core';
import { getDatabase, ref, onValue } from 'firebase/database';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

export interface Notification {
  type: string;
  senderUsername: string;
  read: boolean;
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private db = getDatabase();
  private notificationsRef;

  constructor(private auth: Auth) {
    this.notificationsRef = ref(this.db, 'users');
  }

  getNotifications(userId: string): Observable<Notification[]> {
    return new Observable((observer) => {
      const userNotificationsRef = ref(
        this.db,
        `users/${userId}/notifications`,
      );

      onValue(userNotificationsRef, (snapshot) => {
        const notifications = snapshot.val();
        if (notifications) {
          const notificationsArray: Notification[] = Object.entries(
            notifications,
          ).map(([key, notif]: [string, any]) => ({
            ...notif,
            id: key,
          }));
          observer.next(notificationsArray);
        } else {
          observer.next([]);
        }
      });
    });
  }
}
