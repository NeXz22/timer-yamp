import {Component} from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'frontend';

    onThemeSwitchChange($event: Event): void {
        const themeCheckbox = $event.target as HTMLInputElement;
        if (themeCheckbox.checked) {
            document.body.dataset['theme'] = 'dark';
        } else {
            document.body.dataset['theme'] = 'light';
        }
    }
}
