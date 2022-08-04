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
        moveItemInArray(this.items, event.previousIndex, event.currentIndex);
        this.dropEventEmitter.emit();
    }
}
