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
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        DragDropModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
