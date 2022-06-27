import {Directive, Input, TemplateRef} from '@angular/core';

@Directive({
    selector: '[yampTemplate]',
})
export class YampTemplateDirective {

    @Input('yampTemplate') name!: string;

    constructor(public template: TemplateRef<any>) {
    }
}
