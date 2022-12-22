import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HomeComponent} from './views/home/home.component';
import {NotFoundComponent} from './views/not-found/not-found.component';
import {SessionComponent} from './views/session/session.component';
import {FormsModule} from '@angular/forms';
import {ParticipantListComponent} from './views/session/participant-list/participant-list.component';
import {DragDropListComponent} from './views/session/drag-drop-list/drag-drop-list.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {GoalListComponent} from './views/session/goal-list/goal-list.component';
import {YampTemplateDirective} from './views/session/shared/yamp-template.directive';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {CountdownComponent} from './views/session/countdown/countdown.component';
import {CountdownPipe} from './views/session/shared/countdown.pipe';
import {TimeInputComponent} from './views/session/time-input/time-input.component';
import {MillisecondsToMinutesPipe} from './views/session/shared/milliseconds-to-minutes.pipe';
import {MillisecondsToSecondsPipe} from './views/session/shared/milliseconds-to-seconds.pipe';
import {ConnectionLostDialogComponent} from './views/session/connection-lost-dialog/connection-lost-dialog.component';
import {DialogModule} from '@angular/cdk/dialog';
import { TimerStartStopButtonPipe } from './views/session/shared/timer-start-stop-button.pipe';
import { RoleListComponent } from './views/session/role-list/role-list.component';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        NotFoundComponent,
        SessionComponent,
        ParticipantListComponent,
        DragDropListComponent,
        GoalListComponent,
        YampTemplateDirective,
        CountdownComponent,
        CountdownPipe,
        TimeInputComponent,
        MillisecondsToMinutesPipe,
        MillisecondsToSecondsPipe,
        ConnectionLostDialogComponent,
        TimerStartStopButtonPipe,
        RoleListComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        DragDropModule,
        ClipboardModule,
        DialogModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
