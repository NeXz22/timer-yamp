import {Component, ElementRef, ViewChild} from '@angular/core';
import {SessionService} from '../shared/session.service';

@Component({
  selector: 'yamp-role-list',
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.scss']
})
export class RoleListComponent {

    @ViewChild('newRoleInput', {static: true}) newRoleInputRef!: ElementRef<HTMLInputElement>;

    constructor(
        public sessionService: SessionService,
    ) {
    }

    onNewRoleSubmit(): void {
        const newRole = this.newRoleInputRef.nativeElement.value.trim();
        if (newRole) {
            this.newRoleInputRef.nativeElement.value = '';
            this.sessionService.newRoleSubmitted(newRole);
        }
    }

    onDeleteRoleClicked(roleToDelete: string): void {
        this.sessionService.roleDeleted(roleToDelete);
    }

    onRoleDrop(indices: { previousIndex: number; newIndex: number }) {
        this.sessionService.rolesSortingChanged(indices);
    }
}
