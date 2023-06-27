/// <reference types="@esri/calcite-components" />
import esri = __esri;
/**
 * Internal typings.
 */
interface _types {
    /**
     * Info to create action groups.
     */
    actionInfo: {
        action: tsx.JSX.Element;
        groupEnd?: boolean;
        bottomAction?: boolean;
    };
    /**
     * Shell panel and view control (opposite) position.
     */
    panelPosition: 'start' | 'end';
}
/**
 * Properties to initialize a widget in the shell panel with an action in the action bar.
 * Must return a `calcite-panel`, `calcite-flow`, `calcite-modal`, or `div` VNode; widget `container` property must not be set; and corresponding VNode `type` must be provided.
 */
interface PanelWidget extends Object {
    /**
     * Groups all actions into bottom actions slot.
     * `groupEnd` has no effect on bottom slotted actions.
     */
    bottomAction?: boolean;
    /**
     * Groups all actions above up to another ActionWidgets `groupEnd` into a group.
     */
    groupEnd?: boolean;
    /**
     * Action icon.
     */
    icon: string;
    /**
     * Widget is `open` on load.
     * Only opens first widget with `open` property.
     */
    open?: boolean;
    /**
     * Action text.
     */
    text: string;
    /**
     * Type of element to create for widget.
     */
    type: 'calcite-flow' | 'calcite-modal' | 'calcite-panel' | 'div';
    /**
     * The widget instance.
     */
    widget: Widget & {
        /**
         * Function called when widget container panel is closed.
         */
        onHide?: () => void | undefined;
        /**
         * Function called when widget container panel is opened.
         */
        onShow?: () => void | undefined;
    };
}
/**
 * Map application properties.
 */
export interface MapApplicationProperties extends esri.WidgetProperties {
    /**
     * Floating panels.
     * @default true
     */
    contentBehind?: boolean;
    /**
     * Provide custom header widget or `false` to disable default header.
     */
    header?: Widget | false;
    /**
     * Include disclaimer.
     * @default true
     */
    includeDisclaimer?: boolean;
    /**
     * Menu widget.
     */
    menuWidget?: Widget;
    /**
     * Basemap toggle added to UI when provided.
     */
    nextBasemap?: esri.Basemap;
    /**
     * Oauth instance.
     */
    oAuth?: OAuth;
    /**
     * Position of the action bar and places view control opposite.
     * @default 'start'
     */
    panelPosition?: _types['panelPosition'];
    /**
     * Widgets to add to action bar.
     */
    panelWidgets?: PanelWidget[] | Collection<PanelWidget>;
    /**
     * Search configuration for heading search.
     */
    searchViewModel?: esri.SearchViewModel;
    /**
     * Shell panel widget. Supersedes `panelWidgets`.
     * Must return a `calcite-shell-panel` VNode, and widget `container` must not be set.
     */
    shellPanel?: esri.Widget;
    /**
     * Title of application.
     * @default 'Vernonia'
     */
    title?: string;
    /**
     * Map view.
     */
    view: esri.MapView;
    /**
     * Options for configuring the view control.
     */
    viewControlOptions?: {
        /**
         * Include locate button.
         * @default false
         */
        includeLocate?: boolean;
        /**
         * Include fullscreen toggle button.
         * @default false
         */
        includeFullscreen?: boolean;
        includeMagnifier?: boolean;
        magnifierProperties?: esri.MagnifierProperties;
    };
}
import Accessor from '@arcgis/core/core/Accessor';
import Collection from '@arcgis/core/core/Collection';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
/**
 * Set disclaimer title and text.
 * @param disclaimer
 */
export declare const setDisclaimer: (disclaimer: {
    text?: string;
    title?: string;
}) => void;
/**
 * Return base 64 logo SVG.
 * @returns
 */
export declare const getLogo: () => string | null;
/**
 * Set base 64 logo.
 * @param logo
 */
export declare const setLogo: (logo: string | null) => void;
/**
 * Set copyright text.
 * @param copyright
 */
export declare const setCopyright: (copyright: string) => void;
/**
 * Map application widget.
 */
export default class MapApplication extends Widget {
    container: HTMLCalciteShellElement;
    constructor(properties: MapApplicationProperties);
    postInitialize(): Promise<void>;
    contentBehind: boolean;
    header?: Widget | false;
    includeDisclaimer: boolean;
    menuWidget?: Widget;
    nextBasemap?: esri.Basemap;
    oAuth?: OAuth;
    panelPosition: _types['panelPosition'];
    panelWidgets?: esri.Collection<PanelWidget>;
    shellPanel?: esri.Widget;
    searchViewModel?: esri.SearchViewModel;
    title: string;
    view: esri.MapView;
    viewControlOptions: MapApplicationProperties['viewControlOptions'];
    private _actionGroups;
    private _menu;
    private _visiblePanelWidget;
    private _widgets;
    /**
     * Show (or hide) panel widget by id.
     * @param id
     */
    showWidget(id: string | null): void;
    /**
     * Wire action events.
     * @param modal
     * @param widgetId
     * @param action
     */
    private _actionAfterCreate;
    /**
     * Create action groups.
     * @param actionInfos
     */
    private _createActionGroups;
    /**
     * Create actions and panels/modals.
     * @param panelWidgets
     */
    private _createActionsWidgets;
    /**
     * Create basemap toggle.
     */
    private _createBasemapToggle;
    /**
     * Create header user control.
     * @param container
     */
    private _oAuthAfterCreate;
    /**
     * Create header search.
     * @param container
     */
    private _searchAfterCreate;
    /**
     * Set shell panel container properties.
     * @param shellPanel
     */
    private _shellPanelAfterCreate;
    /**
     * Set view's container.
     * @param container
     */
    private _viewAfterCreate;
    /**
     * Set initial view padding and create resize observer to update view padding for detached panels.
     * @param actionBar
     */
    private _viewPadding;
    /**
     * Set widget `container` and wire events.
     * @param widget
     * @param container
     */
    private _widgetAfterCreate;
    render(): tsx.JSX.Element;
    /**
     * Render default header.
     * @returns
     */
    private _renderDefaultHeader;
}
/**
 * Module for handling auth.
 */
export declare class OAuth extends Accessor {
    constructor(properties: {
        /**
         * OAuthInfo instance to perform authentication against.
         */
        oAuthInfo: esri.OAuthInfo;
        /**
         * Portal instance to sign into.
         */
        portal: esri.Portal;
        /**
         * Alternate sign in url.
         * Overrides default `${portal.url}/sharing/rest`.
         */
        signInUrl?: string;
    });
    oAuthInfo: esri.OAuthInfo;
    portal: esri.Portal;
    signInUrl: string;
    credential: esri.Credential;
    fullName: string;
    thumbnailUrl: string;
    user: esri.PortalUser;
    username: string;
    signedIn: boolean;
    /**
     * Load the view model.
     * @returns Promise<true | false> user signed in.
     */
    load(): Promise<boolean>;
    /**
     * Sign into the application.
     */
    signIn(): void;
    /**
     * Sign out of the application.
     */
    signOut(): void;
    /**
     * Complete successful sign in.
     * @param credential
     * @param resolve
     */
    private _completeSignIn;
}
/**
 * Sign in widget to force auth on application load.
 */
export declare class SignIn extends Widget {
    container: HTMLDivElement;
    constructor(properties: esri.WidgetProperties & {
        /**
         * OAuth instance.
         */
        oAuth: OAuth;
        /**
         * Application title.
         * @default 'Vernonia'
         */
        title?: string;
    });
    oAuth: OAuth;
    title: string;
    render(): tsx.JSX.Element;
}
export {};
