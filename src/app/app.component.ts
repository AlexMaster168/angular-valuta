import { Component, OnInit } from '@angular/core';

import { AuthService } from './auth/auth.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false,
})
export class AppComponent implements OnInit {
    constructor(public authService: AuthService) {}

    ngOnInit(): void {}
}
