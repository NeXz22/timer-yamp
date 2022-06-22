import {Component} from '@angular/core';
import {Router} from '@angular/router';

@Component({
    selector: 'yamp-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {

    sessionName: string = '';

    constructor(
        private router: Router,
    ) {
    }

    onSubmit(): void {
        const sessionName = this.sessionName.trim().toLowerCase() + Date.now();

        this.router.navigate(['/s'], {queryParams: {id: sessionName}})
            .then()
            .catch(reason => console.error(`Navigation towards \'/session/\' failed. Reason: ${reason}`));
    }
}
