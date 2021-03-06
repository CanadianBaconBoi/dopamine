import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material';
import { Desktop } from '../../core/io/desktop';
import { BaseSnackBarService } from '../../services/snack-bar/base-snack-bar.service';

@Component({
    selector: 'app-snack-bar',
    host: { 'style': 'display: block' },
    templateUrl: './snack-bar.component.html',
    styleUrls: ['./snack-bar.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SnackBarComponent implements OnInit {

    constructor(
        private snackBarService: BaseSnackBarService,
        private desktop: Desktop,
        @Inject(MAT_SNACK_BAR_DATA) public data: any) {
    }

    public ngOnInit(): void {
    }

    public openDataUrl() {
        this.desktop.openLink(this.data.url);
    }

    public async dismissAsync(): Promise<void> {
        this.snackBarService.dismissAsync();
    }
}
