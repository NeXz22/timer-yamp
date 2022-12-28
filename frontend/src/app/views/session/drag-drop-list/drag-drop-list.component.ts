import {AfterContentInit, Component, ContentChild, EventEmitter, Input, Output, TemplateRef} from '@angular/core';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {YampTemplateDirective} from '../shared/yamp-template.directive';
import {BehaviorSubject} from 'rxjs';

@Component({
    selector: 'yamp-drag-drop-list',
    templateUrl: './drag-drop-list.component.html',
    styleUrls: ['./drag-drop-list.component.scss']
})
export class DragDropListComponent implements AfterContentInit {

    @ContentChild(YampTemplateDirective) templateDirective!: YampTemplateDirective;

    @Input() items$!: BehaviorSubject<any[]>;

    @Output() dropEventEmitter = new EventEmitter<{ previousIndex: number, newIndex: number }>();

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
        if (event.previousIndex !== event.currentIndex) {
            this.dropEventEmitter.emit({previousIndex: event.previousIndex, newIndex: event.currentIndex});
        }
    }
}
