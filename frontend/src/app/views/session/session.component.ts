import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {first} from 'rxjs';
import {SessionService} from './shared/session.service';

@Component({
    selector: 'yamp-session',
    templateUrl: './session.component.html',
    styleUrls: ['./session.component.scss']
})
export class SessionComponent implements OnInit {

    sessionId: string = '';
    currentUrl: string = '';

    sounds: { name: string, src: string }[] = [
        {name: 'announcement', src: 'announcement-sound-4-21464.mp3'},
        {name: 'glass-breaking', src: 'glass-breaking-93803.mp3'},
        {name: 'metal-design-explosion', src: 'metal-design-explosion-13491.mp3'},
        {name: 'surprise', src: 'surprise-sound-effect-99300.mp3'},
        {name: 'swoosh', src: 'clean-fast-swooshaiff-14784.mp3'},
        {name: 'whoosh', src: 'whoosh-6316.mp3'},
    ];
    selectedSound: { name: string, src: string } = this.sounds[0];
    selectedVolume: number = 50;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        public sessionService: SessionService,
    ) {
    }

    ngOnInit(): void {
        this.route.queryParams.pipe(first()).subscribe({
            next: params => {
                this.sessionId = params['id'];
                if (!this.sessionId) {
                    this.router.navigate(['']).then();
                }
            },
            error: () => {
                this.router.navigate(['']).then();
            },
        });

        this.currentUrl = window.location.href;

        this.sessionService.connect(this.sessionId);
    }

    playSelectedSound(): void {
        const audio = new Audio();
        audio.src = '../../../assets/sounds/' + this.selectedSound.src;
        audio.volume = this.selectedVolume / 100;
        audio.load();
        audio.play()
            .then()
            .catch(reason => {
                console.log(reason);
            })
    }
}
