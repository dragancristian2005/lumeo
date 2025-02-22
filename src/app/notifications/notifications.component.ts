import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationService } from './fetch-notifications.component';
import { Auth } from '@angular/fire/auth';
import { AsyncPipe, DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-notifications',
  imports: [NgIf, NgForOf, NgClass, AsyncPipe, DatePipe],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
})
export class NotificationsComponent implements OnInit {
  notifications$ = new Observable<any[]>();

  constructor(
    private auth: Auth,
    private notificationService: NotificationService,
  ) {}

  ngOnInit() {
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.notifications$ = this.notificationService.getNotifications(
          user.uid,
        );
      }
    });
  }
  markNotificationAsRead(notificationId: string) {
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.notificationService.markNotificationAsRead(
          user.uid,
          notificationId,
        );
      }
    });
  }
}
