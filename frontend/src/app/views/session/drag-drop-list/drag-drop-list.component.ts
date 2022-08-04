import {AfterContentInit, Component, ContentChild, EventEmitter, Input, Output, TemplateRef} from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {YampTemplateDirective} from '../shared/yamp-template.directive';

@Component({
    selector: 'yamp-drag-drop-list',
    templateUrl: './drag-drop-list.component.html',
    styleUrls: ['./drag-drop-list.component.scss']
})
export class DragDropListComponent implements AfterContentInit {

    @ContentChild(YampTemplateDirective) templateDirective!: YampTemplateDirective;

    @Input() items: string[] = [];

    @Output() dropEventEmitter = new EventEmitter<undefined>();

    itemTemplate: TemplateRef<any> | null = null;

    ngAfterContentInit(): void {
        if (this.templateDirective) {
            if (this.templateDirective.name === 'item') {
                this.itemTemplate = this.templateDirective.template;
            } else {
                console.warn(`Template-name "${this.templateDirective.name}" is not supported by this component.`);
            }
        }
    }

    onDrop(event: CdkDragDrop<string[]>): void {
        const originalArray = [...this.items];

        moveItemInArray(this.items, event.previousIndex, event.currentIndex);

        if (!this.isEqual(originalArray, this.items)) {
            this.dropEventEmitter.emit();
        }
    }

    isEqual(array1: string[], array2: string[]): boolean {
        if (array1.length !== array2.length) {
            return false;
        }
        for (let i = 0; i < array1.length; i += 1) {
            if (array1[i] !== array2[i]) {
                return false;
            }
        }
        return true;
    }
}
