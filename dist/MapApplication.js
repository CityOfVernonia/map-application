import { __awaiter, __decorate } from "tslib";
import Accessor from '@arcgis/core/core/Accessor';
import { subclass, property } from '@arcgis/core/core/accessorSupport/decorators';
import Collection from '@arcgis/core/core/Collection';
import Error from '@arcgis/core/core/Error';
import { watch } from '@arcgis/core/core/reactiveUtils';
import esriId from '@arcgis/core/identity/IdentityManager';
import Portal from '@arcgis/core/portal/Portal';
import Widget from '@arcgis/core/widgets/Widget';
import { tsx } from '@arcgis/core/widgets/support/widget';
import HomeViewModel from '@arcgis/core/widgets/Home/HomeViewModel';
import ZoomViewModel from '@arcgis/core/widgets/Zoom/ZoomViewModel';
import Cookies from 'js-cookie';
import md5 from 'md5';
//////////////////////////////////////
// Constants
//////////////////////////////////////
// Style classes
const CSS = {
    // application
    base: 'map-application',
    header: 'map-application--header',
    headerMenu: 'map-application--header_menu',
    headerTitle: 'map-application--header_title',
    headerControls: 'map-application--header_controls',
    headerSearch: 'map-application--header_search',
    view: 'map-application--view',
    // loader
    loader: 'map-application--loader',
    loaderTitle: 'map-application--loader_title',
    loaderInfo: 'map-application--loader_info',
    loaderHeart: 'map-application--loader_heart',
    loaderCoffee: 'map-application--loader_coffee',
    // menu
    menu: 'map-application--menu',
    menuBackground: 'map-application--menu_background',
    // sign in
    signIn: 'map-application--sign-in',
    signInContent: 'map-application--sign-in_content',
    signInTitle: 'map-application--sign-in_title',
    signInInfo: 'map-application--sign-in_info',
    // simple sign in
    simpleSignIn: 'map-application--simple-sign-in',
    simpleSignInContent: 'map-application--simple-sign-in_content',
    // user control
    userControl: 'map-application--user-control',
    userControlPopover: 'map-application--user-control_popover',
    // view control
    viewControl: 'map-application--view-control',
    viewControlPads: 'map-application--view-control_pads',
};
// Disclaimer
const DISCLAIMER_COOKIE_NAME = '_mad_accepted';
const DISCLAIMER_COOKIE_VALUE = 'accepted';
let DISCLAIMER_TITLE = 'Disclaimer';
let DISCLAIMER_TEXT = `The purpose of this application is to support City business. Any information herein is for reference only. 
The City of Vernonia makes every effort to keep this information current and accurate. However, the City is not responsible for 
errors, misuse, omissions, or misinterpretations. There are no warranties, expressed or implied, including the warranty of 
merchantability or fitness for a particular purpose, accompanying this application.`;
// Simple sign in
const SIMPLE_SIGN_IN_COOKIE_NAME = '_ss_accepted';
const SIMPLE_SIGN_IN_COOKIE_VALUE = 'signed_in';
/**
 * Set disclaimer title and text.
 * @param disclaimer
 */
export const setDisclaimer = (disclaimer) => {
    const { text, title } = disclaimer;
    DISCLAIMER_TITLE = title || DISCLAIMER_TITLE;
    DISCLAIMER_TEXT = text || DISCLAIMER_TEXT;
};
// Logo
let LOGO = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+DQo8c3ZnDQogICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iDQogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIg0KICAgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIg0KICAgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyINCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyINCiAgIHdpZHRoPSI1Mi45MTY2NjhtbSINCiAgIGhlaWdodD0iMzUuMjc3Nzc5bW0iDQogICB2aWV3Qm94PSIwIDAgNTIuOTE2NjY4IDM1LjI3Nzc3OSINCiAgIHZlcnNpb249IjEuMSINCiAgIGlkPSJzdmc4Ij4NCiAgPGRlZnMNCiAgICAgaWQ9ImRlZnMyIiAvPg0KICA8bWV0YWRhdGENCiAgICAgaWQ9Im1ldGFkYXRhNSI+DQogICAgPHJkZjpSREY+DQogICAgICA8Y2M6V29yaw0KICAgICAgICAgcmRmOmFib3V0PSIiPg0KICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3N2Zyt4bWw8L2RjOmZvcm1hdD4NCiAgICAgICAgPGRjOnR5cGUNCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz4NCiAgICAgICAgPGRjOnRpdGxlPjwvZGM6dGl0bGU+DQogICAgICA8L2NjOldvcms+DQogICAgPC9yZGY6UkRGPg0KICA8L21ldGFkYXRhPg0KICA8Zw0KICAgICBpZD0ibGF5ZXIxIg0KICAgICB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMS41NDQ4ODgsLTg1LjM3OTMxNikiDQogICAgIHN0eWxlPSJkaXNwbGF5OmlubGluZSI+DQogICAgPHBvbHlnb24NCiAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgwLjYwMjMxMTM1LDAsMCwwLjYxNTMwMjkxLC0xMi4xOTA1NjYsNzAuNTEzNTk4KSINCiAgICAgICBpZD0iSW50ZWdyaXR5Ig0KICAgICAgIHBvaW50cz0iMjUuNTkzLDgxLjQ5NCAyNS41OTMsNzQuNjY5IDM4LjU0Myw3NC42NjkgMzguNTQzLDcyLjMyOSAzNi40NDQsNzIuMzI5IDMzLjczOSw3Mi4zMjkgMjMuMjUzLDcyLjMyOSAyMy4yNTMsNzkuMTU0IDE4LjYxLDc5LjE1NCAxOC42MSw3Mi4zMjkgNS40MTksNzIuMzI5IDExLjYxMyw2Mi45MzggOC4wMDcsNjIuOTM4IDE2Ljc3MSw0OS42NTQgMTMuMDIzLDQ5LjY1NCAyMC45MzQsMzkuMDg5IDI4LjgwMSw0OS42MDEgMzAuMTcxLDQ3LjUyNiAyMC45MzQsMzUuMTg0IDguMzQ3LDUxLjk5MyAxMi40MjMsNTEuOTkzIDMuNjYsNjUuMjggNy4yNjYsNjUuMjggMS4wNzIsNzQuNjY5IDE2LjI2OSw3NC42NjkgMTYuMjY5LDgxLjQ5NCAiDQogICAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZjtmaWxsLW9wYWNpdHk6MTtzdHJva2Utd2lkdGg6My42MjE4MTtzdHJva2UtbWl0ZXJsaW1pdDo0O3N0cm9rZS1kYXNoYXJyYXk6bm9uZSIgLz4NCiAgICA8cG9seWdvbg0KICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuNjAyMzExMzUsMCwwLDAuNjE1MzAyOTEsLTEyLjE5MDU2Niw3MC41MTM1OTgpIg0KICAgICAgIGlkPSJwb2x5Z29uMzc1OSINCiAgICAgICBwb2ludHM9IjczLjczMiw4MS40OTQgNzMuNzMyLDc0LjY2OSA4OC45MjgsNzQuNjY5IDgyLjczNCw2NS4yOCA4Ni4zNCw2NS4yOCA3Ny41OCw1MS45OTMgODEuNjU2LDUxLjk5MyA2OS4wNjgsMzUuMTg0IDU5Ljk1Nyw0Ny4zNTYgNjEuMzI2LDQ5LjQzNCA2OS4wNjgsMzkuMDg5IDc2Ljk3OSw0OS42NTQgNzMuMjI5LDQ5LjY1NCA4MS45OTQsNjIuOTM4IDc4LjM4OSw2Mi45MzggODQuNTgsNzIuMzI5IDcxLjM5MSw3Mi4zMjkgNzEuMzkxLDc5LjE1NCA2Ni43NDgsNzkuMTU0IDY2Ljc0OCw3Mi4zMjkgNTYuMjYyLDcyLjMyOSA1My41NTcsNzIuMzI5IDUxLjY5NSw3Mi4zMjkgNTEuNjk1LDc0LjY2OSA2NC40MDgsNzQuNjY5IDY0LjQwOCw4MS40OTQgIg0KICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjEiIC8+DQogICAgPHBvbHlnb24NCiAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgwLjYwMjMxMTM1LDAsMCwwLjYxNTMwMjkxLC0xMi4xOTA1NjYsNzAuNTEzNTk4KSINCiAgICAgICBpZD0icHJpZGUiDQogICAgICAgcG9pbnRzPSI2Ni41NzYsNjguMjczIDU5LjA2MSw1Ni44ODQgNjMuNDM4LDU2Ljg4NCA1Mi44MDUsNDAuNzY2IDU3LjU1MSw0MC43NjYgNDUuMTE3LDI0LjE2IDMyLjY4OCw0MC43NjYgMzcuNDM2LDQwLjc2NiAyNi43OTksNTYuODg0IDMxLjE3OSw1Ni44ODQgMjMuNjYxLDY4LjI3MyA0MC44ODIsNjguMjczIDQwLjg4Miw4MC4zMjMgNDkuMzU1LDgwLjMyMyA0OS4zNTUsNjguMjczICINCiAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmO2ZpbGwtb3BhY2l0eToxIiAvPg0KICA8L2c+DQo8L3N2Zz4NCg==';
/**
 * Return base 64 logo SVG.
 * @returns
 */
export const getLogo = () => {
    return LOGO;
};
/**
 * Set base 64 logo.
 * @param logo
 */
export const setLogo = (logo) => {
    LOGO = logo;
};
// OAuth local storage credential name
const LS_CRED = 'jsapiauthcred';
// Copyright and made with
const HEART = 'M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z';
const COFFEE = 'M192 384h192c53 0 96-43 96-96h32c70.6 0 128-57.4 128-128S582.6 32 512 32H120c-13.3 0-24 10.7-24 24v232c0 53 43 96 96 96zM512 96c35.3 0 64 28.7 64 64s-28.7 64-64 64h-32V96h32zm47.7 384H48.3c-47.6 0-61-64-36-64h583.3c25 0 11.8 64-35.9 64z';
let COPYRIGHT = 'City of Vernonia';
/**
 * Set copyright text.
 * @param copyright
 */
export const setCopyright = (copyright) => {
    COPYRIGHT = copyright;
};
/**
 * Return COV copyright and made with.
 * @param css
 * @returns
 */
const INFO = (css) => {
    return (tsx("div", { class: css },
        tsx("div", null,
            "Copyright \u00A9 ",
            new Date().getFullYear(),
            " ",
            COPYRIGHT),
        tsx("div", null,
            tsx("span", null, "Made with"),
            tsx("svg", { class: CSS.loaderHeart, "aria-hidden": "true", focusable: "false", role: "img", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 512 512" },
                tsx("path", { fill: "currentColor", d: HEART })),
            tsx("span", null, "and"),
            tsx("svg", { class: CSS.loaderCoffee, "aria-hidden": "true", focusable: "false", role: "img", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 640 512" },
                tsx("path", { fill: "currentColor", d: COFFEE })),
            tsx("span", null, "in Vernonia, Oregon"))));
};
// Uniqueness
let KEY = 0;
//////////////////////////////////////
// Modules
//////////////////////////////////////
/**
 * Disclaimer modal widget (internal).
 */
let Disclaimer = class Disclaimer extends Widget {
    constructor() {
        super();
        //////////////////////////////////////
        // Lifecycle
        //////////////////////////////////////
        this.container = document.createElement('calcite-modal');
        document.body.appendChild(this.container);
    }
    //////////////////////////////////////
    // Static methods
    //////////////////////////////////////
    /**
     * Check if disclaimer had been previously accepted.
     * @returns boolean
     */
    static isAccepted() {
        const cookie = Cookies.get(DISCLAIMER_COOKIE_NAME);
        return cookie && cookie === DISCLAIMER_COOKIE_VALUE ? true : false;
    }
    //////////////////////////////////////
    // Private methods
    //////////////////////////////////////
    /**
     * Handle accept click and set cookie.
     */
    _accept() {
        const { container } = this;
        const checkbox = container.querySelector('calcite-checkbox');
        if (checkbox.checked)
            Cookies.set(DISCLAIMER_COOKIE_NAME, DISCLAIMER_COOKIE_VALUE, { expires: 30 });
        container.open = false;
        setTimeout(() => {
            this.destroy();
        }, 2000);
    }
    //////////////////////////////////////
    // Render and rendering methods
    //////////////////////////////////////
    render() {
        return (tsx("calcite-modal", { open: "", "close-button-disabled": "", "escape-disable": "", "outside-close-disabled": "", width: "s" },
            tsx("div", { slot: "header" }, DISCLAIMER_TITLE),
            tsx("div", { slot: "content", afterCreate: (div) => {
                    div.innerHTML = DISCLAIMER_TEXT;
                } }),
            tsx("calcite-label", { slot: "back", layout: "inline", alignment: "end" },
                tsx("calcite-checkbox", null),
                "Don't show me this again"),
            tsx("calcite-button", { slot: "primary", width: "full", onclick: this._accept.bind(this) }, "Accept")));
    }
};
Disclaimer = __decorate([
    subclass('Disclaimer')
], Disclaimer);
/**
 * Loader widget (internal).
 */
let Loader = class Loader extends Widget {
    constructor(properties) {
        super(properties);
        //////////////////////////////////////
        // Lifecycle
        //////////////////////////////////////
        this.container = document.createElement('div');
        //////////////////////////////////////
        // Properties
        //////////////////////////////////////
        this.title = 'Vernonia';
        document.body.appendChild(this.container);
    }
    //////////////////////////////////////
    // Public methods
    //////////////////////////////////////
    end() {
        const { container } = this;
        setTimeout(() => {
            container.style.opacity = '0';
        }, 3000);
        setTimeout(() => {
            this.destroy();
        }, 4000);
    }
    //////////////////////////////////////
    // Render and rendering methods
    //////////////////////////////////////
    render() {
        const { title } = this;
        return (tsx("div", { class: CSS.loader },
            tsx("div", { class: CSS.loaderTitle },
                tsx("div", null, title),
                tsx("calcite-progress", { type: "indeterminate" })),
            INFO(CSS.loaderInfo),
            LOGO ? tsx("img", { src: LOGO, alt: COPYRIGHT }) : null));
    }
};
Loader = __decorate([
    subclass('Loader')
], Loader);
/**
 * Map application widget.
 */
let MapApplication = class MapApplication extends Widget {
    constructor(properties) {
        super(properties);
        //////////////////////////////////////
        // Lifecycle
        //////////////////////////////////////
        this.container = document.createElement('calcite-shell');
        //////////////////////////////////////
        // Properties
        //////////////////////////////////////
        this.contentBehind = true;
        this.includeDisclaimer = true;
        this.panelPosition = 'start';
        this.title = 'Vernonia';
        //////////////////////////////////////
        // Variables
        //////////////////////////////////////
        this._actionGroups = new Collection();
        this._visiblePanelWidget = null;
        this._widgets = new Collection();
        document.body.appendChild(this.container);
        // manually set `contentBehind` on container to prevent improper rendering
        this.container.contentBehind =
            properties.contentBehind !== undefined ? properties.contentBehind : this.contentBehind;
    }
    postInitialize() {
        return __awaiter(this, void 0, void 0, function* () {
            const { container, menuWidget, nextBasemap, oAuth, panelPosition, panelWidgets, shellPanel, title, viewControlOptions, view, view: { ui }, } = this;
            let { includeDisclaimer } = this;
            const loader = new Loader({ title });
            if (oAuth && oAuth.signedIn)
                includeDisclaimer = false;
            if (includeDisclaimer && !Disclaimer.isAccepted())
                new Disclaimer();
            ui.remove('zoom');
            ui.add(new ViewControl(Object.assign(Object.assign({ view }, (viewControlOptions || {})), { fullscreenElement: container })), panelPosition === 'start' ? 'top-right' : 'top-left');
            if (nextBasemap)
                this._createBasemapToggle();
            if (!shellPanel && panelWidgets && panelWidgets.length) {
                const found = panelWidgets.find((actionWidget) => {
                    return actionWidget.open === true;
                });
                if (found && found.type !== 'calcite-modal') {
                    this._visiblePanelWidget = found.widget.id;
                }
                this._createActionsWidgets(panelWidgets);
            }
            if (menuWidget)
                this._menu = new Menu({ menuWidget, title });
            yield view.when();
            loader.end();
        });
    }
    //////////////////////////////////////
    // Public methods
    //////////////////////////////////////
    /**
     * Show (or hide) panel widget by id.
     * @param id
     */
    showWidget(id) {
        this._visiblePanelWidget = id;
    }
    //////////////////////////////////////
    // Private methods
    //////////////////////////////////////
    /**
     * Wire action events.
     * @param modal
     * @param widgetId
     * @param action
     */
    _actionAfterCreate(modal, widgetId, action) {
        action.addEventListener('click', () => {
            if (modal) {
                modal.open = true;
            }
            else {
                this._visiblePanelWidget = this._visiblePanelWidget === widgetId ? null : widgetId;
            }
        });
        this.addHandles(watch(() => this._visiblePanelWidget, (id) => {
            action.active = id === widgetId;
        }));
    }
    /**
     * Create action groups.
     * @param actionInfos
     */
    _createActionGroups(actionInfos) {
        const { _actionGroups } = this;
        let actions = [];
        actionInfos
            .filter((actionInfo) => {
            return actionInfo.bottomAction !== true;
        })
            .forEach((actionInfo, index, arr) => {
            const { action, groupEnd } = actionInfo;
            actions.push(action);
            if (groupEnd === true || index + 1 === arr.length) {
                _actionGroups.add(tsx("calcite-action-group", { key: KEY++ }, actions));
                actions = [];
            }
        });
        const bottomActions = actionInfos
            .filter((actionInfo) => {
            return actionInfo.bottomAction === true;
        })
            .map((actionInfo) => {
            return actionInfo.action;
        });
        if (bottomActions.length)
            _actionGroups.add(tsx("calcite-action-group", { key: KEY++, slot: "bottom-actions" }, bottomActions));
    }
    /**
     * Create actions and panels/modals.
     * @param panelWidgets
     */
    _createActionsWidgets(panelWidgets) {
        const { _visiblePanelWidget, _widgets } = this;
        const actionInfos = [];
        panelWidgets.forEach((panelWidget) => {
            const { icon, text, widget, type, groupEnd, bottomAction } = panelWidget;
            const modal = type === 'calcite-modal' ? document.createElement('calcite-modal') : null;
            actionInfos.push({
                action: (tsx("calcite-action", { active: widget.id === _visiblePanelWidget, icon: icon, key: KEY++, text: text, afterCreate: this._actionAfterCreate.bind(this, modal, widget.id) },
                    tsx("calcite-tooltip", { "close-on-click": "", label: text, "overlay-positioning": "fixed", slot: "tooltip" },
                        tsx("span", null, text)))),
                groupEnd,
                bottomAction,
            });
            if (modal) {
                document.body.append(modal);
                widget.container = modal;
                modal.addEventListener('calciteModalOpen', () => {
                    if (widget.onShow && typeof widget.onShow === 'function')
                        widget.onShow();
                });
                modal.addEventListener('calciteModalClose', () => {
                    if (widget.onHide && typeof widget.onHide === 'function')
                        widget.onHide();
                });
            }
            else {
                const hidden = widget.id !== _visiblePanelWidget;
                let element;
                switch (type) {
                    case 'calcite-panel':
                        element = (tsx("calcite-panel", { key: KEY++, hidden: hidden, afterCreate: this._widgetAfterCreate.bind(this, widget) }));
                        break;
                    case 'calcite-flow':
                        element = (tsx("calcite-flow", { key: KEY++, hidden: hidden, afterCreate: this._widgetAfterCreate.bind(this, widget) }));
                        break;
                    default:
                        element = tsx("div", { key: KEY++, hidden: hidden, afterCreate: this._widgetAfterCreate.bind(this, widget) });
                }
                _widgets.add(element);
            }
        });
        this._createActionGroups(actionInfos);
    }
    /**
     * Create basemap toggle.
     */
    _createBasemapToggle() {
        const { id, nextBasemap, view } = this;
        const _id = `basemap_toggle_${id}`;
        import('@arcgis/core/widgets/BasemapToggle').then((module) => {
            const toggle = new module.default({
                view,
                nextBasemap,
            });
            view.ui.add(toggle, 'bottom-right');
            const container = toggle.container;
            container.id = _id;
            const observer = new MutationObserver(() => {
                container.removeAttribute('title');
                observer.disconnect();
            });
            observer.observe(container, { attributes: true, attributeFilter: ['title'] });
            const tooltip = Object.assign(document.createElement('calcite-tooltip'), {
                referenceElement: _id,
                overlayPositioning: 'fixed',
                closeOnClick: true,
                label: 'Toggle basemap',
                innerHTML: 'Toggle basemap',
            });
            document.body.append(tooltip);
        });
    }
    /**
     * Create header user control.
     * @param container
     */
    _oAuthAfterCreate(container) {
        const { oAuth } = this;
        if (!oAuth)
            return;
        new UserControl({ oAuth, container });
    }
    /**
     * Create header search.
     * @param container
     */
    _searchAfterCreate(container) {
        const { searchViewModel, view } = this;
        if (!searchViewModel)
            return;
        if (!searchViewModel.view)
            searchViewModel.view = view;
        import('@arcgis/core/widgets/Search').then((module) => {
            new module.default({
                viewModel: searchViewModel,
                container,
            });
        });
    }
    /**
     * Set shell panel container properties.
     * @param shellPanel
     */
    _shellPanelAfterCreate(_shellPanel) {
        const { shellPanel, panelPosition } = this;
        if (!shellPanel)
            return;
        shellPanel.container = _shellPanel;
        _shellPanel.position = panelPosition;
        _shellPanel.slot = `panel-${panelPosition}`;
    }
    /**
     * Set view's container.
     * @param container
     */
    _viewAfterCreate(container) {
        this.view.container = container;
    }
    /**
     * Set initial view padding and create resize observer to update view padding for detached panels.
     * @param actionBar
     */
    _viewPadding(actionBar) {
        const { contentBehind, panelPosition, view } = this;
        if (!contentBehind)
            return;
        const setPadding = () => {
            const width = actionBar.getBoundingClientRect().width;
            view.set('padding', Object.assign(Object.assign({}, view.padding), (panelPosition === 'start' ? { left: width } : { right: width })));
        };
        setPadding();
        new ResizeObserver(() => {
            setPadding();
        }).observe(actionBar);
    }
    /**
     * Set widget `container` and wire events.
     * @param widget
     * @param container
     */
    _widgetAfterCreate(widget, container) {
        widget.container = container;
        this.addHandles(watch(() => this._visiblePanelWidget, (id, oldId) => {
            container.hidden = id !== widget.id;
            if (id === widget.id && widget.onShow && typeof widget.onShow === 'function') {
                widget.onShow();
            }
            if (oldId && oldId === widget.id && widget.onHide && typeof widget.onHide === 'function') {
                widget.onHide();
            }
        }));
    }
    //////////////////////////////////////
    // Render and rendering methods
    //////////////////////////////////////
    render() {
        const { contentBehind, header, panelPosition, shellPanel, _actionGroups, _visiblePanelWidget, _widgets } = this;
        return (tsx("calcite-shell", { class: CSS.base },
            header === undefined ? this._renderDefaultHeader() : null,
            header ? (tsx("div", { slot: "header", afterCreate: (container) => {
                    header.container = container;
                } })) : null,
            shellPanel ? (tsx("calcite-shell-panel", { afterCreate: this._shellPanelAfterCreate.bind(this) })) : null,
            _actionGroups.length ? (tsx("calcite-shell-panel", { "display-mode": contentBehind ? 'float' : 'dock', collapsed: !_visiblePanelWidget, position: panelPosition, slot: `panel-${panelPosition}` },
                tsx("calcite-action-bar", { slot: "action-bar", afterCreate: this._viewPadding.bind(this) }, _actionGroups.toArray()),
                _widgets.toArray())) : null,
            tsx("div", { class: CSS.view, afterCreate: this._viewAfterCreate.bind(this) })));
    }
    /**
     * Render default header.
     * @returns
     */
    _renderDefaultHeader() {
        const { id, searchViewModel, title, oAuth, _menu } = this;
        const menuId = `menu_${id}`;
        return (tsx("div", { class: CSS.header, slot: "header" },
            tsx("div", { class: CSS.headerTitle },
                _menu ? (tsx("div", { class: CSS.headerMenu },
                    tsx("calcite-icon", { id: menuId, icon: "hamburger", role: "button", onclick: () => {
                            _menu.open = true;
                        } }),
                    tsx("calcite-tooltip", { "close-on-click": "", label: "Menu", placement: "bottom", "reference-element": menuId, "overlay-positioning": "fixed" }, "Menu"))) : null,
                LOGO ? tsx("img", { src: LOGO, alt: COPYRIGHT }) : null,
                tsx("div", null, title)),
            tsx("div", { class: CSS.headerControls },
                searchViewModel ? (tsx("div", { class: CSS.headerSearch, afterCreate: this._searchAfterCreate.bind(this) })) : null,
                oAuth ? tsx("div", { afterCreate: this._oAuthAfterCreate.bind(this) }) : null)));
    }
};
__decorate([
    property({ type: Collection })
], MapApplication.prototype, "panelWidgets", void 0);
__decorate([
    property()
], MapApplication.prototype, "_actionGroups", void 0);
__decorate([
    property()
], MapApplication.prototype, "_visiblePanelWidget", void 0);
__decorate([
    property()
], MapApplication.prototype, "_widgets", void 0);
MapApplication = __decorate([
    subclass('MapApplication')
], MapApplication);
export default MapApplication;
/**
 * Menu widget (internal).
 */
let Menu = class Menu extends Widget {
    constructor(properties) {
        super(properties);
        //////////////////////////////////////
        // Lifecycle
        //////////////////////////////////////
        this.container = document.createElement('div');
        this.background = document.createElement('div');
        //////////////////////////////////////
        // Variables
        //////////////////////////////////////
        this.open = false;
        document.body.appendChild(this.container);
        document.body.appendChild(this.background);
        this.background.classList.add(CSS.menuBackground);
    }
    postInitialize() {
        const { background, container } = this;
        background.addEventListener('click', () => {
            this.open = false;
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.open) {
                this.open = false;
            }
        });
        watch(() => this.open, (open) => {
            open ? container.setAttribute('open', '') : container.removeAttribute('open');
            open ? background.setAttribute('open', '') : background.removeAttribute('open');
        });
    }
    //////////////////////////////////////
    // Render and rendering methods
    //////////////////////////////////////
    render() {
        const { menuWidget, title } = this;
        return (tsx("div", { class: CSS.menu },
            tsx("calcite-panel", { heading: title, width: "260" },
                tsx("calcite-action", { icon: "x", slot: "header-actions-end", onclick: () => {
                        this.open = false;
                    } },
                    tsx("calcite-tooltip", { "close-on-click": "", label: "Close", slot: "tooltip" }, "Close"))),
            tsx("div", { afterCreate: (container) => {
                    menuWidget.container = container;
                } })));
    }
};
__decorate([
    property()
], Menu.prototype, "open", void 0);
Menu = __decorate([
    subclass('Menu')
], Menu);
/**
 * Module for handling auth.
 */
export let OAuth = class OAuth extends Accessor {
    //////////////////////////////////////
    // Lifecycle
    //////////////////////////////////////
    constructor(properties) {
        super(properties);
        this.signedIn = false;
    }
    //////////////////////////////////////
    // Public methods
    //////////////////////////////////////
    /**
     * Load the view model.
     * @returns Promise<true | false> user signed in.
     */
    load() {
        const { portal, oAuthInfo } = this;
        esriId.registerOAuthInfos([oAuthInfo]);
        return new Promise((resolve, reject) => {
            if (portal.loaded) {
                // check for sign in
                esriId
                    .checkSignInStatus(portal.url)
                    .then((credential) => {
                    // complete successful sign in
                    this._completeSignIn(credential, resolve);
                })
                    .catch((checkSignInError) => {
                    if (checkSignInError.message === 'User is not signed in.') {
                        // check local storage
                        const localStorageAuth = localStorage.getItem(LS_CRED);
                        if (localStorageAuth) {
                            const cred = JSON.parse(localStorageAuth);
                            // check for stored credentials with null values
                            if (!cred.token) {
                                localStorage.removeItem(LS_CRED);
                                resolve(false);
                                return;
                            }
                            // register token
                            esriId.registerToken(cred);
                            // check for sign in
                            esriId
                                .checkSignInStatus(portal.url)
                                .then((credential) => __awaiter(this, void 0, void 0, function* () {
                                // replace portal instance
                                this.portal = new Portal();
                                yield this.portal.load();
                                // complete successful sign in
                                this._completeSignIn(credential, resolve);
                            }))
                                .catch(() => {
                                // neither signed into portal or with valid local storage
                                resolve(false);
                            });
                        }
                        else {
                            resolve(false);
                        }
                    }
                    else {
                        reject(checkSignInError);
                    }
                });
            }
            else {
                // reject if portal is not loaded
                reject(new Error('OAuthLoadError', 'Portal instance must be loaded before loading OAuth instance.'));
            }
        });
    }
    /**
     * Sign into the application.
     */
    signIn() {
        const url = this.signInUrl || `${this.portal.url}/sharing/rest`;
        const auth = esriId;
        auth
            .oAuthSignIn(url, esriId.findServerInfo(url), this.oAuthInfo, {
            oAuthPopupConfirmation: false,
            signal: new AbortController().signal,
        })
            .then(() => {
            window.location.reload();
        })
            .catch(() => {
            // do nothing...user aborted sign in
        });
    }
    /**
     * Sign out of the application.
     */
    signOut() {
        esriId.destroyCredentials();
        localStorage.removeItem(LS_CRED);
        window.location.reload();
    }
    //////////////////////////////////////
    // Private methods
    //////////////////////////////////////
    /**
     * Complete successful sign in.
     * @param credential
     * @param resolve
     */
    _completeSignIn(credential, resolve) {
        // set local storage
        localStorage.setItem(LS_CRED, JSON.stringify(credential.toJSON()));
        // set class properties
        this.credential = credential;
        this.signedIn = true;
        // resolve signed in
        resolve(true);
        // reset local storage when token is changed
        // seems legit...but unsure if it will cause any issues at this point
        credential.on('token-change', () => {
            localStorage.setItem(LS_CRED, JSON.stringify(this.credential.toJSON()));
        });
    }
};
__decorate([
    property({ aliasOf: 'user.fullName' })
], OAuth.prototype, "fullName", void 0);
__decorate([
    property({ aliasOf: 'user.thumbnailUrl' })
], OAuth.prototype, "thumbnailUrl", void 0);
__decorate([
    property({ aliasOf: 'portal.user' })
], OAuth.prototype, "user", void 0);
__decorate([
    property({ aliasOf: 'user.username' })
], OAuth.prototype, "username", void 0);
OAuth = __decorate([
    subclass('OAuth')
], OAuth);
/**
 * Sign in widget to force auth on application load.
 */
export let SignIn = class SignIn extends Widget {
    constructor(properties) {
        super(properties);
        //////////////////////////////////////
        // Lifecycle
        //////////////////////////////////////
        this.container = document.createElement('div');
        this.title = 'Vernonia';
        document.body.appendChild(this.container);
    }
    //////////////////////////////////////
    // Render and rendering methods
    //////////////////////////////////////
    render() {
        const { oAuth, title } = this;
        return (tsx("div", { class: CSS.signIn },
            tsx("div", { class: CSS.signInContent },
                tsx("div", { class: CSS.signInTitle }, title),
                tsx("calcite-button", { width: "full", onclick: oAuth.signIn.bind(oAuth) }, "Sign In"),
                INFO(CSS.signInInfo))));
    }
};
SignIn = __decorate([
    subclass('SignIn')
], SignIn);
/**
 * Simple sign in widget. NOT FOR SECURE APPLICATIONS!
 */
export let SimpleSignIn = class SimpleSignIn extends Widget {
    constructor(properties) {
        super(properties);
        //////////////////////////////////////
        // Lifecycle
        //////////////////////////////////////
        this.container = document.createElement('div');
        this.title = 'Vernonia';
        document.body.appendChild(this.container);
    }
    //////////////////////////////////////
    // Static methods
    //////////////////////////////////////
    /**
     * Check if signed in.
     * @returns boolean
     */
    static isSignedIn() {
        const cookie = Cookies.get(SIMPLE_SIGN_IN_COOKIE_NAME);
        return cookie && cookie === SIMPLE_SIGN_IN_COOKIE_VALUE ? true : false;
    }
    //////////////////////////////////////
    // Private methods
    //////////////////////////////////////
    _signIn(event) {
        const { userHash, passwordHash } = this;
        event.preventDefault();
        const form = event.target;
        const user = form.querySelector('calcite-input[type=text]');
        const password = form.querySelector('calcite-input[type=password]');
        if (!user.value) {
            user.status = 'invalid';
            user.setFocus();
            return;
        }
        else {
            user.status = 'idle';
        }
        if (!password.value) {
            password.status = 'invalid';
            password.setFocus();
            return;
        }
        else {
            password.status = 'idle';
        }
        const _userHash = md5(user.value);
        const _passwordHash = md5(password.value);
        if (userHash !== _userHash) {
            user.status = 'invalid';
            user.setFocus();
            return;
        }
        else {
            user.status = 'idle';
        }
        if (passwordHash !== _passwordHash) {
            password.status = 'invalid';
            password.setFocus();
            return;
        }
        else {
            password.status = 'idle';
        }
        Cookies.set(SIMPLE_SIGN_IN_COOKIE_NAME, SIMPLE_SIGN_IN_COOKIE_VALUE, { expires: 30 });
        this.emit('signed-in');
    }
    //////////////////////////////////////
    // Render and rendering methods
    //////////////////////////////////////
    render() {
        const { title } = this;
        return (tsx("div", { class: CSS.simpleSignIn },
            tsx("div", { class: CSS.simpleSignInContent },
                tsx("div", null, title),
                tsx("form", { afterCreate: (form) => {
                        form.addEventListener('submit', this._signIn.bind(this));
                    } },
                    tsx("calcite-label", null,
                        "User",
                        tsx("calcite-input", { type: "text" })),
                    tsx("calcite-label", null,
                        "Password",
                        tsx("calcite-input", { type: "password" })),
                    tsx("calcite-button", { type: "submit", width: "full" }, "Sign In")))));
    }
};
SimpleSignIn = __decorate([
    subclass('SimpleSignIn')
], SimpleSignIn);
/**
 * User control widget (internal).
 */
let UserControl = class UserControl extends Widget {
    //////////////////////////////////////
    // Lifecycle
    //////////////////////////////////////
    constructor(properties) {
        super(properties);
    }
    //////////////////////////////////////
    // Render and rendering methods
    //////////////////////////////////////
    render() {
        const { id, oAuth, oAuth: { signedIn, fullName, username, thumbnailUrl }, } = this;
        const _id = `user_control_${id}`;
        return signedIn ? (tsx("div", { class: CSS.userControl },
            tsx("calcite-avatar", { id: _id, "full-name": fullName, thumbnail: thumbnailUrl, role: "button" }),
            tsx("calcite-popover", { "auto-close": "", label: "Sign out", placement: "bottom", "reference-element": _id, "overlay-positioning": "fixed" },
                tsx("div", { class: CSS.userControlPopover },
                    tsx("div", null, fullName),
                    tsx("span", null, username),
                    tsx("calcite-button", { width: "full", onclick: oAuth.signOut.bind(oAuth) }, "Sign out"))))) : (tsx("div", { class: CSS.userControl },
            tsx("calcite-icon", { id: _id, icon: "sign-in", role: "button", onclick: oAuth.signIn.bind(oAuth) }),
            tsx("calcite-tooltip", { label: "Sign in", placement: "bottom", "reference-element": _id, "overlay-positioning": "fixed" }, "Sign in")));
    }
};
UserControl = __decorate([
    subclass('UserControl')
], UserControl);
/**
 * View control widget (internal).
 */
let ViewControl = class ViewControl extends Widget {
    //////////////////////////////////////
    // Lifecycle
    //////////////////////////////////////
    constructor(properties) {
        super(properties);
        this.includeFullscreen = false;
        this.includeLocate = false;
        this.includeMagnifier = false;
    }
    postInitialize() {
        const { view, view: { magnifier }, magnifierProperties, } = this;
        this.home = new HomeViewModel({ view });
        this.zoom = new ZoomViewModel({ view });
        magnifier.visible = false;
        if (magnifierProperties)
            Object.assign(magnifier, magnifierProperties);
    }
    //////////////////////////////////////
    // Private methods
    //////////////////////////////////////
    // very hacky - better solution?
    _compassRotation(action) {
        const { view } = this;
        let icon;
        if (action.shadowRoot) {
            icon = action.shadowRoot.querySelector('.icon-container');
            if (icon) {
                icon.style.transform = `rotate(${view.rotation}deg)`;
                this.watch('view.rotation', () => {
                    icon.style.transform = `rotate(${view.rotation}deg)`;
                });
            }
            else {
                setTimeout(() => {
                    this._compassRotation(action);
                }, 100);
            }
        }
        else {
            setTimeout(() => {
                this._compassRotation(action);
            }, 100);
        }
    }
    _initializeFullscreen(action) {
        const { view, fullscreenElement } = this;
        import('@arcgis/core/widgets/Fullscreen/FullscreenViewModel').then((module) => {
            const fullscreen = new module.default({
                view,
                element: fullscreenElement,
            });
            action.addEventListener('click', fullscreen.toggle.bind(fullscreen));
            action.disabled = fullscreen.state === 'disabled' || fullscreen.state === 'feature-unsupported';
            this.addHandles(watch(() => fullscreen.state, (state) => {
                action.disabled = state === 'disabled' || state === 'feature-unsupported';
                const tooltip = action.querySelector('calcite-tooltip');
                if (state === 'ready') {
                    action.icon = 'extent';
                    action.text = 'Enter fullscreen';
                    tooltip.innerText = 'Enter fullscreen';
                }
                if (state === 'active') {
                    action.icon = 'full-screen-exit';
                    action.text = 'Exit fullscreen';
                    tooltip.innerText = 'Exit fullscreen';
                }
            }));
        });
    }
    _initializeLocate(action) {
        const { view, locateProperties } = this;
        import('@arcgis/core/widgets/Locate/LocateViewModel').then((module) => {
            const locate = new module.default(Object.assign({ view }, locateProperties));
            action.addEventListener('click', locate.locate.bind(locate));
            action.disabled = locate.state === 'disabled';
            this.addHandles(watch(() => locate.state, (state) => {
                action.disabled = state === 'disabled';
                action.icon =
                    locate.state === 'ready'
                        ? 'gps-on'
                        : locate.state === 'locating'
                            ? 'gps-on-f'
                            : locate.state === 'disabled'
                                ? 'gps-off'
                                : '';
            }));
        });
    }
    _toggleMagnifier() {
        const { view, view: { magnifier }, _magnifierHandle, } = this;
        if (magnifier.visible) {
            magnifier.visible = false;
            if (_magnifierHandle)
                _magnifierHandle.remove();
        }
        else {
            magnifier.visible = true;
            this._magnifierHandle = view.on('pointer-move', (event) => {
                magnifier.position = { x: event.x, y: event.y };
            });
        }
    }
    //////////////////////////////////////
    // Render and rendering methods
    //////////////////////////////////////
    render() {
        const { view, zoom, home, includeLocate, includeFullscreen, includeMagnifier } = this;
        const magnifier = view.magnifier.visible;
        return (tsx("div", { class: CSS.viewControl },
            tsx("div", { class: CSS.viewControlPads },
                tsx("calcite-action-pad", { "expand-disabled": "" },
                    tsx("calcite-action-group", null,
                        tsx("calcite-action", { text: "Zoom in", icon: "plus", scale: "s", disabled: !zoom.canZoomIn, onclick: zoom.zoomIn.bind(zoom) },
                            tsx("calcite-tooltip", { "close-on-click": "", "overlay-positioning": "fixed", scale: "s", slot: "tooltip" }, "Zoom in")),
                        tsx("calcite-action", { text: "Zoom out", icon: "minus", scale: "s", disabled: !zoom.canZoomOut, onclick: zoom.zoomOut.bind(zoom) },
                            tsx("calcite-tooltip", { "close-on-click": "", "overlay-positioning": "fixed", scale: "s", slot: "tooltip" }, "Zoom out")))),
                tsx("calcite-action-pad", { "expand-disabled": "" },
                    tsx("calcite-action-group", null,
                        tsx("calcite-action", { text: "Default extent", icon: "home", scale: "s", onclick: home.go.bind(home) },
                            tsx("calcite-tooltip", { "close-on-click": "", "overlay-positioning": "fixed", scale: "s", slot: "tooltip" }, "Default extent")),
                        includeLocate ? (tsx("calcite-action", { text: "Zoom to location", icon: "gps-on", scale: "s", disabled: "", afterCreate: this._initializeLocate.bind(this) },
                            tsx("calcite-tooltip", { "close-on-click": "", "overlay-positioning": "fixed", scale: "s", slot: "tooltip" }, "Zoom to location"))) : null,
                        view.constraints.rotationEnabled ? (tsx("calcite-action", { text: "Reset orientation", icon: "compass-needle", scale: "s", afterCreate: this._compassRotation.bind(this), onclick: () => (view.rotation = 0) },
                            tsx("calcite-tooltip", { "close-on-click": "", "overlay-positioning": "fixed", scale: "s", slot: "tooltip" }, "Reset orientation"))) : null)),
                includeFullscreen ? (tsx("calcite-action-pad", { "expand-disabled": "" },
                    tsx("calcite-action-group", null,
                        tsx("calcite-action", { text: "Enter fullscreen", disabled: "", scale: "s", icon: "extent", afterCreate: this._initializeFullscreen.bind(this) },
                            tsx("calcite-tooltip", { "close-on-click": "", "overlay-positioning": "fixed", scale: "s", slot: "tooltip" }, "Enter fullscreen"))))) : null,
                includeMagnifier ? (tsx("calcite-action-pad", { "expand-disabled": "" },
                    tsx("calcite-action-group", null,
                        tsx("calcite-action", { text: magnifier ? 'Hide magnifier' : 'Show magnifier', scale: "s", icon: "magnifying-glass", indicator: magnifier ? true : false, onclick: this._toggleMagnifier.bind(this) },
                            tsx("calcite-tooltip", { "close-on-click": "", "overlay-positioning": "fixed", scale: "s", slot: "tooltip" }, magnifier ? 'Hide magnifier' : 'Show magnifier'))))) : null)));
    }
};
ViewControl = __decorate([
    subclass('ViewControl')
], ViewControl);
