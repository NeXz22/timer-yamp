import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Title} from '@angular/platform-browser';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

    @ViewChild('themeCheckbox', {static: true}) themeCheckboxRef!: ElementRef<HTMLInputElement>;

    isDarkModePreference: boolean = false;

    constructor(
        private readonly titleService: Title,
    ) {
    }

    onThemeSwitchChange(): void {
        if (this.themeCheckboxRef.nativeElement.checked) {
            document.body.dataset['theme'] = 'dark';
        } else {
            document.body.dataset['theme'] = 'light';
        }
    }

    ngOnInit(): void {
        this.titleService.setTitle('YAMP');

        this.isDarkModePreference = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (this.isDarkModePreference) {
            document.body.dataset['theme'] = 'dark';
        }
    }

    ngAfterViewInit(): void {
        if (this.isDarkModePreference) {
            this.themeCheckboxRef.nativeElement.checked = true;
        }
    }
}
