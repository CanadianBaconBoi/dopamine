import { Injectable } from '@angular/core';
import { Settings } from '../../core/settings';
import { Logger } from '../../core/logger';
import { ColorScheme } from '../../core/color-scheme';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Appearance } from './appearance';

@Injectable({
    providedIn: 'root',
})
export class AppearanceService implements Appearance {
    private _selectedColorScheme: ColorScheme;

    constructor(private settings: Settings, private logger: Logger, private overlayContainer: OverlayContainer) {
        this.initialize();
    }

    public colorSchemes: ColorScheme[] = [new ColorScheme('Default', '#6260e3', '#3fdcdd')];

    public get useLightBackgroundTheme(): boolean {
        return this.settings.useLightBackgroundTheme;
    }

    public set useLightBackgroundTheme(v: boolean) {
        this.settings.useLightBackgroundTheme = v;
        this.applyTheme();
    }

    public get selectedColorScheme(): ColorScheme {
        return this._selectedColorScheme;
    }

    public set selectedColorScheme(v: ColorScheme) {
        this._selectedColorScheme = v;
        this.settings.colorScheme = v.name;

        this.applyTheme();
    }

    private applyThemeClasses(element: HTMLElement, themeName: string): void {
        const classesToRemove: string[] = Array.from(element.classList).filter((item: string) => item.includes('-theme-'));

        if (classesToRemove.length) {
            element.classList.remove(...classesToRemove);
        }

        element.classList.add(themeName);
    }

    public applyTheme(): void {
        const element = document.documentElement;
        element.style.setProperty('--primary-color', this.selectedColorScheme.primaryColor);
        element.style.setProperty('--secondary-color', this.selectedColorScheme.secondaryColor);

        const themeNameWithBackground: string = `default-theme-${this.settings.useLightBackgroundTheme ? 'light' : 'dark'}`;

        // Apply theme to components in the overlay container: https://gist.github.com/tomastrajan/ee29cd8e180b14ce9bc120e2f7435db7
        this.applyThemeClasses(this.overlayContainer.getContainerElement(), themeNameWithBackground);

        // Apply theme to body
        this.applyThemeClasses(document.body, themeNameWithBackground);

        this.logger.info(`Applied theme '${themeNameWithBackground}'`, 'AppearanceService', 'applyTheme');
    }

    private initialize(): void {
        let colorSchemeFromSettings: ColorScheme = this.colorSchemes.find(x => x.name === this.settings.colorScheme);

        if (!colorSchemeFromSettings) {
            colorSchemeFromSettings = this.colorSchemes[0];
        }

        this._selectedColorScheme = colorSchemeFromSettings;
        this.applyTheme();
    }
}
