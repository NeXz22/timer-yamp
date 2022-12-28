import {Component} from '@angular/core';
import {Notification} from '../shared/notification.model';
import {NotificationService} from '../shared/notification.service';

@Component({
    selector: 'yamp-notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.scss']
})
export class NotificationComponent {

    constructor(
        public notificationService: NotificationService,
    ) {
    }

    onRemoveNotificationClicked(notification: Notification): void {
        this.notificationService.remove(notification);
    }
}
