import {Injectable, OnDestroy} from '@angular/core';
import {Notification} from './notification.model';
import {NotificationSeverity} from './notification-severity.model';
import {Subscription, timer} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class NotificationService implements OnDestroy {

    notifications: Notification[] = [];
    private timerSubscriptions: Subscription[] = [];

    constructor() {
    }

    remove(notificationToRemove: Notification): void {
        this.notifications = this.notifications.filter(notification => notification !== notificationToRemove);
    }

    addSuccessNotification(message: string): void {
        const notification: Notification = {
            id: Date.now(),
            text: message,
            life: 4000,
            severity: NotificationSeverity.SUCCESS
        };
        this.add(notification);
    }

    addWarnNotification(message: string): void {
        const notification: Notification = {
            id: Date.now(),
            text: message,
            life: 8000,
            severity: NotificationSeverity.WARN
        };
        this.add(notification);
    }

    addErrorNotification(message: string): void {
        const notification: Notification = {
            id: Date.now(),
            text: message,
            life: -1,
            severity: NotificationSeverity.ERROR
        };
        this.add(notification);
    }

    private add(notificationToAdd: Notification): void {
        this.notifications.push(notificationToAdd);
        if (notificationToAdd.life !== -1) {
            this.startNotificationLife(notificationToAdd);
        }
    }

    private startNotificationLife(newNotification: Notification): void {
        const timerSubscription = timer(newNotification.life).subscribe(() => {
            this.notifications = this.notifications.filter((notification) => notification !== newNotification);
            this.timerSubscriptions = this.timerSubscriptions.filter((timer) => timer !== timerSubscription);
        });
        this.timerSubscriptions.push(timerSubscription);
        newNotification.started = Date.now();
    }

    ngOnDestroy() {
        this.timerSubscriptions.forEach((subscription) => subscription.unsubscribe());
    }
}
