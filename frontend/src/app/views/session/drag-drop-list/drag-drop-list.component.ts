import {Component, Input} from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {T} from '@angular/cdk/keycodes';

@Component({
    selector: 'yamp-drag-drop-list',
    templateUrl: './drag-drop-list.component.html',
    styleUrls: ['./drag-drop-list.component.scss']
})
export class DragDropListComponent {

    @Input() items: string[] = [];

    onDrop(event: CdkDragDrop<typeof T, any>): void {
        moveItemInArray(this.items, event.previousIndex, event.currentIndex);
    }
}
