import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SessionComponent} from './views/session/session.component';
import {HomeComponent} from './views/home/home.component';
import {NotFoundComponent} from './views/not-found/not-found.component';

const routes: Routes = [
    {path: 's', component: SessionComponent},
    {path: '', component: HomeComponent},
    {path: '**', component: NotFoundComponent},
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
