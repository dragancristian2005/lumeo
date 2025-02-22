import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Notification,
  NotificationService,
} from './fetch-notifications.component';
import { Auth } from '@angular/fire/auth';
import { NgForOf, NgIf } from '@angular/common';
import { RelativeTimePipe } from '../profile/relative-time.pipe';

@Component({
  selector: 'app-notifications',
  imports: [NgIf, NgForOf, RelativeTimePipe],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
})
export class NotificationsComponent implements OnInit {
  notifications$ = new Observable<any[]>();
  allNotifications: Notification[] = [];
  activeTab = 'all';

  tabs = [
    { key: 'all', label: 'All' },
    { key: 'follow', label: 'Follows' },
    { key: 'like', label: 'Likes' },
    { key: 'comment', label: 'Comments' },
  ];

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
        this.notifications$.subscribe((notifications) => {
          this.allNotifications = notifications;
        });
      }
    });
  }

  get filteredNotifications() {
    return this.activeTab === 'all'
      ? this.allNotifications
      : this.allNotifications.filter(
          (notif: Notification) => notif.type === this.activeTab,
        );
  }

  setTab(tabKey: string) {
    this.activeTab = tabKey;
  }
}
