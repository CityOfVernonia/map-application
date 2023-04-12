//////////////////////////////////////
// Interfaces and module imports
//////////////////////////////////////
import esri = __esri;

/**
 * Internal typings.
 */
interface _types {
  /**
   * Info to create action groups.
   */
  actionInfo: { action: tsx.JSX.Element; groupEnd?: boolean; bottomAction?: boolean };
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

/**
 * Set disclaimer title and text.
 * @param disclaimer
 */
export const setDisclaimer = (disclaimer: { text?: string; title?: string }): void => {
  const { text, title } = disclaimer;
  DISCLAIMER_TITLE = title || DISCLAIMER_TITLE;
  DISCLAIMER_TEXT = text || DISCLAIMER_TEXT;
};

// Logo
let LOGO: string | null =
  'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+DQo8c3ZnDQogICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iDQogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIg0KICAgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIg0KICAgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyINCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyINCiAgIHdpZHRoPSI1Mi45MTY2NjhtbSINCiAgIGhlaWdodD0iMzUuMjc3Nzc5bW0iDQogICB2aWV3Qm94PSIwIDAgNTIuOTE2NjY4IDM1LjI3Nzc3OSINCiAgIHZlcnNpb249IjEuMSINCiAgIGlkPSJzdmc4Ij4NCiAgPGRlZnMNCiAgICAgaWQ9ImRlZnMyIiAvPg0KICA8bWV0YWRhdGENCiAgICAgaWQ9Im1ldGFkYXRhNSI+DQogICAgPHJkZjpSREY+DQogICAgICA8Y2M6V29yaw0KICAgICAgICAgcmRmOmFib3V0PSIiPg0KICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3N2Zyt4bWw8L2RjOmZvcm1hdD4NCiAgICAgICAgPGRjOnR5cGUNCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz4NCiAgICAgICAgPGRjOnRpdGxlPjwvZGM6dGl0bGU+DQogICAgICA8L2NjOldvcms+DQogICAgPC9yZGY6UkRGPg0KICA8L21ldGFkYXRhPg0KICA8Zw0KICAgICBpZD0ibGF5ZXIxIg0KICAgICB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMS41NDQ4ODgsLTg1LjM3OTMxNikiDQogICAgIHN0eWxlPSJkaXNwbGF5OmlubGluZSI+DQogICAgPHBvbHlnb24NCiAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgwLjYwMjMxMTM1LDAsMCwwLjYxNTMwMjkxLC0xMi4xOTA1NjYsNzAuNTEzNTk4KSINCiAgICAgICBpZD0iSW50ZWdyaXR5Ig0KICAgICAgIHBvaW50cz0iMjUuNTkzLDgxLjQ5NCAyNS41OTMsNzQuNjY5IDM4LjU0Myw3NC42NjkgMzguNTQzLDcyLjMyOSAzNi40NDQsNzIuMzI5IDMzLjczOSw3Mi4zMjkgMjMuMjUzLDcyLjMyOSAyMy4yNTMsNzkuMTU0IDE4LjYxLDc5LjE1NCAxOC42MSw3Mi4zMjkgNS40MTksNzIuMzI5IDExLjYxMyw2Mi45MzggOC4wMDcsNjIuOTM4IDE2Ljc3MSw0OS42NTQgMTMuMDIzLDQ5LjY1NCAyMC45MzQsMzkuMDg5IDI4LjgwMSw0OS42MDEgMzAuMTcxLDQ3LjUyNiAyMC45MzQsMzUuMTg0IDguMzQ3LDUxLjk5MyAxMi40MjMsNTEuOTkzIDMuNjYsNjUuMjggNy4yNjYsNjUuMjggMS4wNzIsNzQuNjY5IDE2LjI2OSw3NC42NjkgMTYuMjY5LDgxLjQ5NCAiDQogICAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZjtmaWxsLW9wYWNpdHk6MTtzdHJva2Utd2lkdGg6My42MjE4MTtzdHJva2UtbWl0ZXJsaW1pdDo0O3N0cm9rZS1kYXNoYXJyYXk6bm9uZSIgLz4NCiAgICA8cG9seWdvbg0KICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KDAuNjAyMzExMzUsMCwwLDAuNjE1MzAyOTEsLTEyLjE5MDU2Niw3MC41MTM1OTgpIg0KICAgICAgIGlkPSJwb2x5Z29uMzc1OSINCiAgICAgICBwb2ludHM9IjczLjczMiw4MS40OTQgNzMuNzMyLDc0LjY2OSA4OC45MjgsNzQuNjY5IDgyLjczNCw2NS4yOCA4Ni4zNCw2NS4yOCA3Ny41OCw1MS45OTMgODEuNjU2LDUxLjk5MyA2OS4wNjgsMzUuMTg0IDU5Ljk1Nyw0Ny4zNTYgNjEuMzI2LDQ5LjQzNCA2OS4wNjgsMzkuMDg5IDc2Ljk3OSw0OS42NTQgNzMuMjI5LDQ5LjY1NCA4MS45OTQsNjIuOTM4IDc4LjM4OSw2Mi45MzggODQuNTgsNzIuMzI5IDcxLjM5MSw3Mi4zMjkgNzEuMzkxLDc5LjE1NCA2Ni43NDgsNzkuMTU0IDY2Ljc0OCw3Mi4zMjkgNTYuMjYyLDcyLjMyOSA1My41NTcsNzIuMzI5IDUxLjY5NSw3Mi4zMjkgNTEuNjk1LDc0LjY2OSA2NC40MDgsNzQuNjY5IDY0LjQwOCw4MS40OTQgIg0KICAgICAgIHN0eWxlPSJmaWxsOiNmZmZmZmY7ZmlsbC1vcGFjaXR5OjEiIC8+DQogICAgPHBvbHlnb24NCiAgICAgICB0cmFuc2Zvcm09Im1hdHJpeCgwLjYwMjMxMTM1LDAsMCwwLjYxNTMwMjkxLC0xMi4xOTA1NjYsNzAuNTEzNTk4KSINCiAgICAgICBpZD0icHJpZGUiDQogICAgICAgcG9pbnRzPSI2Ni41NzYsNjguMjczIDU5LjA2MSw1Ni44ODQgNjMuNDM4LDU2Ljg4NCA1Mi44MDUsNDAuNzY2IDU3LjU1MSw0MC43NjYgNDUuMTE3LDI0LjE2IDMyLjY4OCw0MC43NjYgMzcuNDM2LDQwLjc2NiAyNi43OTksNTYuODg0IDMxLjE3OSw1Ni44ODQgMjMuNjYxLDY4LjI3MyA0MC44ODIsNjguMjczIDQwLjg4Miw4MC4zMjMgNDkuMzU1LDgwLjMyMyA0OS4zNTUsNjguMjczICINCiAgICAgICBzdHlsZT0iZmlsbDojZmZmZmZmO2ZpbGwtb3BhY2l0eToxIiAvPg0KICA8L2c+DQo8L3N2Zz4NCg==';

/**
 * Return base 64 logo SVG.
 * @returns
 */
export const getLogo = (): string | null => {
  return LOGO;
};

/**
 * Set base 64 logo.
 * @param logo
 */
export const setLogo = (logo: string | null): void => {
  LOGO = logo;
};

// OAuth local storage credential name
const LS_CRED = 'jsapiauthcred';

// Copyright and made with
const HEART =
  'M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z';

const COFFEE =
  'M192 384h192c53 0 96-43 96-96h32c70.6 0 128-57.4 128-128S582.6 32 512 32H120c-13.3 0-24 10.7-24 24v232c0 53 43 96 96 96zM512 96c35.3 0 64 28.7 64 64s-28.7 64-64 64h-32V96h32zm47.7 384H48.3c-47.6 0-61-64-36-64h583.3c25 0 11.8 64-35.9 64z';

let COPYRIGHT = 'City of Vernonia';

/**
 * Set copyright text.
 * @param copyright
 */
export const setCopyright = (copyright: string): void => {
  COPYRIGHT = copyright;
};

/**
 * Return COV copyright and made with.
 * @param css
 * @returns
 */
const INFO = (css: string): tsx.JSX.Element => {
  return (
    <div class={css}>
      <div>
        Copyright &copy; {new Date().getFullYear()} {COPYRIGHT}
      </div>
      <div>
        <span>Made with</span>
        <svg
          class={CSS.loaderHeart}
          aria-hidden="true"
          focusable="false"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <path fill="currentColor" d={HEART}></path>
        </svg>
        <span>and</span>
        <svg
          class={CSS.loaderCoffee}
          aria-hidden="true"
          focusable="false"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 640 512"
        >
          <path fill="currentColor" d={COFFEE}></path>
        </svg>
        <span>in Vernonia, Oregon</span>
      </div>
    </div>
  );
};

// Uniqueness
let KEY = 0;

//////////////////////////////////////
// Modules
//////////////////////////////////////
/**
 * Disclaimer modal widget (internal).
 */
@subclass('Disclaimer')
class Disclaimer extends Widget {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
  container = document.createElement('calcite-modal');

  constructor() {
    super();
    document.body.appendChild(this.container);
  }

  //////////////////////////////////////
  // Static methods
  //////////////////////////////////////
  /**
   * Check if disclaimer had been previously accepted.
   * @returns boolean
   */
  static isAccepted(): boolean {
    const cookie = Cookies.get(DISCLAIMER_COOKIE_NAME);
    return cookie && cookie === DISCLAIMER_COOKIE_VALUE ? true : false;
  }

  //////////////////////////////////////
  // Private methods
  //////////////////////////////////////
  /**
   * Handle accept click and set cookie.
   */
  private _accept(): void {
    const { container } = this;
    const checkbox = container.querySelector('calcite-checkbox') as HTMLCalciteCheckboxElement;
    if (checkbox.checked) Cookies.set(DISCLAIMER_COOKIE_NAME, DISCLAIMER_COOKIE_VALUE, { expires: 30 });
    container.open = false;
    setTimeout(() => {
      this.destroy();
    }, 2000);
  }

  //////////////////////////////////////
  // Render and rendering methods
  //////////////////////////////////////
  render(): tsx.JSX.Element {
    return (
      <calcite-modal open="" close-button-disabled="" escape-disable="" outside-close-disabled="" width="s">
        <div slot="header">{DISCLAIMER_TITLE}</div>
        <div
          slot="content"
          afterCreate={(div: HTMLDivElement): void => {
            div.innerHTML = DISCLAIMER_TEXT;
          }}
        ></div>
        <calcite-label slot="back" layout="inline" alignment="end">
          <calcite-checkbox></calcite-checkbox>
          Don't show me this again
        </calcite-label>
        <calcite-button slot="primary" width="full" onclick={this._accept.bind(this)}>
          Accept
        </calcite-button>
      </calcite-modal>
    );
  }
}

/**
 * Loader widget (internal).
 */
@subclass('Loader')
class Loader extends Widget {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
  container = document.createElement('div');

  constructor(
    properties: esri.WidgetProperties & {
      title?: string;
    },
  ) {
    super(properties);
    document.body.appendChild(this.container);
  }

  //////////////////////////////////////
  // Properties
  //////////////////////////////////////
  title = 'Vernonia';

  //////////////////////////////////////
  // Public methods
  //////////////////////////////////////
  end(): void {
    const { container } = this;
    setTimeout((): void => {
      container.style.opacity = '0';
    }, 3000);
    setTimeout((): void => {
      this.destroy();
    }, 4000);
  }

  //////////////////////////////////////
  // Render and rendering methods
  //////////////////////////////////////
  render(): tsx.JSX.Element {
    const { title } = this;
    return (
      <div class={CSS.loader}>
        <div class={CSS.loaderTitle}>
          <div>{title}</div>
          <calcite-progress type="indeterminate"></calcite-progress>
        </div>
        {INFO(CSS.loaderInfo)}
        {LOGO ? <img src={LOGO} alt={COPYRIGHT} /> : null}
      </div>
    );
  }
}

/**
 * Map application widget.
 */
@subclass('MapApplication')
export default class MapApplication extends Widget {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
  container = document.createElement('calcite-shell');

  constructor(properties: MapApplicationProperties) {
    super(properties);
    document.body.appendChild(this.container);
    // manually set `contentBehind` on container to prevent improper rendering
    this.container.contentBehind =
      properties.contentBehind !== undefined ? properties.contentBehind : this.contentBehind;
  }

  async postInitialize(): Promise<void> {
    const {
      container,
      menuWidget,
      nextBasemap,
      oAuth,
      panelPosition,
      panelWidgets,
      shellPanel,
      title,
      viewControlOptions,
      view,
      view: { ui },
    } = this;

    let { includeDisclaimer } = this;

    const loader = new Loader({ title });

    if (oAuth && oAuth.signedIn) includeDisclaimer = false;

    if (includeDisclaimer && !Disclaimer.isAccepted()) new Disclaimer();

    ui.remove('zoom');

    ui.add(
      new ViewControl({
        view,
        ...(viewControlOptions || {}),
        fullscreenElement: container,
      }),
      panelPosition === 'start' ? 'top-right' : 'top-left',
    );

    if (nextBasemap) this._createBasemapToggle();

    if (!shellPanel && panelWidgets && panelWidgets.length) {
      const found = panelWidgets.find((actionWidget: PanelWidget): boolean => {
        return actionWidget.open === true;
      });

      if (found && found.type !== 'calcite-modal') {
        this._visiblePanelWidget = found.widget.id;
      }

      this._createActionsWidgets(panelWidgets);
    }

    if (menuWidget) this._menu = new Menu({ menuWidget, title });

    await view.when();

    loader.end();
  }

  //////////////////////////////////////
  // Properties
  //////////////////////////////////////
  contentBehind = true;

  header!: Widget | false;

  includeDisclaimer = true;

  menuWidget?: Widget;

  nextBasemap!: esri.Basemap;

  oAuth!: OAuth;

  panelPosition: _types['panelPosition'] = 'start';

  @property({ type: Collection })
  panelWidgets!: esri.Collection<PanelWidget>;

  shellPanel!: esri.Widget;

  searchViewModel!: esri.SearchViewModel;

  title = 'Vernonia';

  view!: esri.MapView;

  viewControlOptions!: MapApplicationProperties['viewControlOptions'];

  //////////////////////////////////////
  // Variables
  //////////////////////////////////////
  @property()
  private _actionGroups: Collection<tsx.JSX.Element> = new Collection();

  private _menu!: Menu;

  @property()
  private _visiblePanelWidget: string | null = null;

  @property()
  private _widgets: Collection<tsx.JSX.Element> = new Collection();

  //////////////////////////////////////
  // Public methods
  //////////////////////////////////////
  /**
   * Show (or hide) panel widget by id.
   * @param id
   */
  showWidget(id: string | null): void {
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
  private _actionAfterCreate(
    modal: HTMLCalciteModalElement | null,
    widgetId: string,
    action: HTMLCalciteActionElement,
  ): void {
    action.addEventListener('click', (): void => {
      if (modal) {
        modal.open = true;
      } else {
        this._visiblePanelWidget = this._visiblePanelWidget === widgetId ? null : widgetId;
      }
    });

    this.addHandles(
      watch(
        (): string | null => this._visiblePanelWidget,
        (id?: string | null): void => {
          action.active = id === widgetId;
        },
      ),
    );
  }

  /**
   * Create action groups.
   * @param actionInfos
   */
  private _createActionGroups(actionInfos: _types['actionInfo'][]): void {
    const { _actionGroups } = this;

    let actions: tsx.JSX.Element[] = [];

    actionInfos
      .filter((actionInfo: _types['actionInfo']): boolean => {
        return actionInfo.bottomAction !== true;
      })
      .forEach((actionInfo: _types['actionInfo'], index: number, arr: _types['actionInfo'][]): void => {
        const { action, groupEnd } = actionInfo;

        actions.push(action);

        if (groupEnd === true || index + 1 === arr.length) {
          _actionGroups.add(<calcite-action-group key={KEY++}>{actions}</calcite-action-group>);
          actions = [];
        }
      });

    const bottomActions = actionInfos
      .filter((actionInfo: _types['actionInfo']): boolean => {
        return actionInfo.bottomAction === true;
      })
      .map((actionInfo: _types['actionInfo']): tsx.JSX.Element => {
        return actionInfo.action;
      });

    if (bottomActions.length)
      _actionGroups.add(
        <calcite-action-group key={KEY++} slot="bottom-actions">
          {bottomActions}
        </calcite-action-group>,
      );
  }

  /**
   * Create actions and panels/modals.
   * @param panelWidgets
   */
  private _createActionsWidgets(panelWidgets: Collection<PanelWidget>): void {
    const { _visiblePanelWidget, _widgets } = this;

    const actionInfos: _types['actionInfo'][] = [];

    panelWidgets.forEach((panelWidget: PanelWidget): void => {
      const { icon, text, widget, type, groupEnd, bottomAction } = panelWidget;

      const modal =
        type === 'calcite-modal' ? (document.createElement('calcite-modal') as HTMLCalciteModalElement) : null;

      actionInfos.push({
        action: (
          <calcite-action
            active={widget.id === _visiblePanelWidget}
            icon={icon}
            key={KEY++}
            text={text}
            afterCreate={this._actionAfterCreate.bind(this, modal, widget.id)}
          >
            <calcite-tooltip close-on-click="" label={text} overlay-positioning="fixed" slot="tooltip">
              <span>{text}</span>
            </calcite-tooltip>
          </calcite-action>
        ),
        groupEnd,
        bottomAction,
      });

      if (modal) {
        document.body.append(modal);

        widget.container = modal;

        modal.addEventListener('calciteModalOpen', (): void => {
          if (widget.onShow && typeof widget.onShow === 'function') widget.onShow();
        });

        modal.addEventListener('calciteModalClose', (): void => {
          if (widget.onHide && typeof widget.onHide === 'function') widget.onHide();
        });
      } else {
        const hidden = widget.id !== _visiblePanelWidget;

        let element: tsx.JSX.Element;

        switch (type) {
          case 'calcite-panel':
            element = (
              <calcite-panel
                key={KEY++}
                hidden={hidden}
                afterCreate={this._widgetAfterCreate.bind(this, widget)}
              ></calcite-panel>
            );
            break;
          case 'calcite-flow':
            element = (
              <calcite-flow
                key={KEY++}
                hidden={hidden}
                afterCreate={this._widgetAfterCreate.bind(this, widget)}
              ></calcite-flow>
            );
            break;
          default:
            element = <div key={KEY++} hidden={hidden} afterCreate={this._widgetAfterCreate.bind(this, widget)}></div>;
        }

        _widgets.add(element);
      }
    });

    this._createActionGroups(actionInfos);
  }

  /**
   * Create basemap toggle.
   */
  private _createBasemapToggle(): void {
    const { id, nextBasemap, view } = this;

    const _id = `basemap_toggle_${id}`;

    import('@arcgis/core/widgets/BasemapToggle').then((module: any) => {
      const toggle = new (module.default as esri.BasemapToggleConstructor)({
        view,
        nextBasemap,
      });
      view.ui.add(toggle, 'bottom-right');

      const container = toggle.container as HTMLDivElement;

      container.id = _id;

      const observer = new MutationObserver((): void => {
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
  private _oAuthAfterCreate(container: HTMLDivElement): void {
    const { oAuth } = this;

    if (!oAuth) return;

    new UserControl({ oAuth, container });
  }

  /**
   * Create header search.
   * @param container
   */
  private _searchAfterCreate(container: HTMLDivElement): void {
    const { searchViewModel, view } = this;

    if (!searchViewModel) return;

    if (!searchViewModel.view) searchViewModel.view = view;

    import('@arcgis/core/widgets/Search').then((module: any) => {
      new (module.default as any)({
        viewModel: searchViewModel,
        container,
      });
    });
  }

  /**
   * Set shell panel container properties.
   * @param shellPanel
   */
  private _shellPanelAfterCreate(shellPanel: HTMLCalciteShellPanelElement): void {
    const { panelPosition } = this;
    shellPanel.position = panelPosition;
    shellPanel.slot = `panel-${panelPosition}`;
  }

  /**
   * Set view's container.
   * @param container
   */
  private _viewAfterCreate(container: HTMLDivElement): void {
    this.view.container = container;
  }

  /**
   * Set initial view padding and create resize observer to update view padding for detached panels.
   * @param actionBar
   */
  private _viewPadding(actionBar: HTMLCalciteActionBarElement): void {
    const { contentBehind, panelPosition, view } = this;

    if (!contentBehind) return;

    const setPadding = (): void => {
      const width = actionBar.getBoundingClientRect().width;

      view.set('padding', {
        ...view.padding,
        ...(panelPosition === 'start' ? { left: width } : { right: width }),
      });
    };

    setPadding();

    new ResizeObserver((): void => {
      setPadding();
    }).observe(actionBar);
  }

  /**
   * Set widget `container` and wire events.
   * @param widget
   * @param container
   */
  private _widgetAfterCreate(
    widget: PanelWidget['widget'],
    container: HTMLCalciteFlowElement | HTMLCalcitePanelElement | HTMLDivElement,
  ): void {
    widget.container = container;

    this.addHandles(
      watch(
        (): string | null => this._visiblePanelWidget,
        (id: any, oldId: any): void => {
          container.hidden = id !== widget.id;

          if (id === widget.id && widget.onShow && typeof widget.onShow === 'function') {
            widget.onShow();
          }

          if (oldId && oldId === widget.id && widget.onHide && typeof widget.onHide === 'function') {
            widget.onHide();
          }
        },
      ),
    );
  }

  //////////////////////////////////////
  // Render and rendering methods
  //////////////////////////////////////
  render(): tsx.JSX.Element {
    const { contentBehind, header, panelPosition, shellPanel, _actionGroups, _visiblePanelWidget, _widgets } = this;
    return (
      <calcite-shell class={CSS.base}>
        {header === undefined ? this._renderDefaultHeader() : null}
        {header ? (
          <div
            slot="header"
            afterCreate={(container: HTMLDivElement): void => {
              (header as Widget).container = container;
            }}
          ></div>
        ) : null}
        {shellPanel ? (
          <calcite-shell-panel afterCreate={this._shellPanelAfterCreate.bind(this)}></calcite-shell-panel>
        ) : null}
        {_actionGroups.length ? (
          <calcite-shell-panel
            detached={contentBehind}
            collapsed={!_visiblePanelWidget}
            position={panelPosition}
            slot={`panel-${panelPosition}`}
          >
            <calcite-action-bar slot="action-bar" afterCreate={this._viewPadding.bind(this)}>
              {_actionGroups.toArray()}
            </calcite-action-bar>
            {_widgets.toArray()}
          </calcite-shell-panel>
        ) : null}
        <div class={CSS.view} afterCreate={this._viewAfterCreate.bind(this)}></div>
      </calcite-shell>
    );
  }

  /**
   * Render default header.
   * @returns
   */
  private _renderDefaultHeader(): tsx.JSX.Element {
    const { id, searchViewModel, title, oAuth, _menu } = this;
    const menuId = `menu_${id}`;
    return (
      <div class={CSS.header} slot="header">
        <div class={CSS.headerTitle}>
          {_menu ? (
            <div class={CSS.headerMenu}>
              <calcite-icon
                id={menuId}
                icon="hamburger"
                role="button"
                onclick={(): void => {
                  _menu.open = true;
                }}
              ></calcite-icon>
              <calcite-tooltip
                close-on-click=""
                label="Menu"
                placement="bottom"
                reference-element={menuId}
                overlay-positioning="fixed"
              >
                Menu
              </calcite-tooltip>
            </div>
          ) : null}
          {LOGO ? <img src={LOGO} alt={COPYRIGHT} /> : null}
          <div>{title}</div>
        </div>
        <div class={CSS.headerControls}>
          {searchViewModel ? (
            <div class={CSS.headerSearch} afterCreate={this._searchAfterCreate.bind(this)}></div>
          ) : null}
          {oAuth ? <div afterCreate={this._oAuthAfterCreate.bind(this)}></div> : null}
        </div>
      </div>
    );
  }
}

/**
 * Menu widget (internal).
 */
@subclass('Menu')
class Menu extends Widget {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
  container = document.createElement('div');

  background = document.createElement('div');

  constructor(
    properties: esri.WidgetProperties & {
      menuWidget: Widget;
      title: string;
    },
  ) {
    super(properties);
    document.body.appendChild(this.container);
    document.body.appendChild(this.background);
    this.background.classList.add(CSS.menuBackground);
  }

  postInitialize(): void {
    const { background, container } = this;
    background.addEventListener('click', (): void => {
      this.open = false;
    });
    document.addEventListener('keydown', (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && this.open) {
        this.open = false;
      }
    });
    watch(
      (): boolean => this.open,
      (open?: boolean): void => {
        open ? container.setAttribute('open', '') : container.removeAttribute('open');
        open ? background.setAttribute('open', '') : background.removeAttribute('open');
      },
    );
  }

  //////////////////////////////////////
  // Properties
  //////////////////////////////////////
  menuWidget!: Widget;

  title!: string;

  //////////////////////////////////////
  // Variables
  //////////////////////////////////////
  @property()
  open = false;

  //////////////////////////////////////
  // Render and rendering methods
  //////////////////////////////////////
  render(): tsx.JSX.Element {
    const { menuWidget, title } = this;
    return (
      <div class={CSS.menu}>
        <calcite-panel heading={title} width="260">
          <calcite-action
            icon="x"
            slot="header-actions-end"
            onclick={(): void => {
              this.open = false;
            }}
          >
            <calcite-tooltip close-on-click="" label="Close" slot="tooltip">
              Close
            </calcite-tooltip>
          </calcite-action>
        </calcite-panel>
        <div
          afterCreate={(container: HTMLDivElement): void => {
            menuWidget.container = container;
          }}
        ></div>
      </div>
    );
  }
}

/**
 * Module for handling auth.
 */
@subclass('OAuth')
export class OAuth extends Accessor {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
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
  }) {
    super(properties);
  }

  //////////////////////////////////////
  // Properties
  //////////////////////////////////////
  oAuthInfo!: esri.OAuthInfo;

  portal!: esri.Portal;

  signInUrl!: string;

  //////////////////////////////////////
  // Variables
  //////////////////////////////////////
  credential!: esri.Credential;

  @property({ aliasOf: 'user.fullName' })
  fullName!: string;

  @property({ aliasOf: 'user.thumbnailUrl' })
  thumbnailUrl!: string;

  @property({ aliasOf: 'portal.user' })
  user!: esri.PortalUser;

  @property({ aliasOf: 'user.username' })
  username!: string;

  signedIn = false;

  //////////////////////////////////////
  // Public methods
  //////////////////////////////////////
  /**
   * Load the view model.
   * @returns Promise<true | false> user signed in.
   */
  load(): Promise<boolean> {
    const { portal, oAuthInfo } = this;
    esriId.registerOAuthInfos([oAuthInfo]);
    return new Promise((resolve, reject) => {
      if (portal.loaded) {
        // check for sign in
        esriId
          .checkSignInStatus(portal.url)
          .then((credential: esri.Credential) => {
            // complete successful sign in
            this._completeSignIn(credential, resolve as (value?: boolean | PromiseLike<boolean>) => void);
          })
          .catch((checkSignInError: esri.Error): void => {
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
                  .then(async (credential: esri.Credential) => {
                    // replace portal instance
                    this.portal = new Portal();
                    await this.portal.load();
                    // complete successful sign in
                    this._completeSignIn(credential, resolve as (value?: boolean | PromiseLike<boolean>) => void);
                  })
                  .catch(() => {
                    // neither signed into portal or with valid local storage
                    resolve(false);
                  });
              } else {
                resolve(false);
              }
            } else {
              reject(checkSignInError);
            }
          });
      } else {
        // reject if portal is not loaded
        reject(new Error('OAuthLoadError', 'Portal instance must be loaded before loading OAuth instance.'));
      }
    });
  }

  /**
   * Sign into the application.
   */
  signIn(): void {
    const url = this.signInUrl || `${this.portal.url}/sharing/rest`;
    const auth = esriId as esri.IdentityManager & {
      oAuthSignIn: (
        url: string,
        serverInfo: esri.ServerInfo,
        oAuthInfo: esri.OAuthInfo,
        options: { oAuthPopupConfirmation?: boolean; signal: AbortSignal },
      ) => Promise<any>;
    };
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
  signOut(): void {
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
  private _completeSignIn(
    credential: esri.Credential,
    resolve: (value?: boolean | PromiseLike<boolean>) => void,
  ): void {
    // set local storage
    localStorage.setItem(LS_CRED, JSON.stringify((credential as esri.Credential & { toJSON: () => any }).toJSON()));
    // set class properties
    this.credential = credential;
    this.signedIn = true;
    // resolve signed in
    resolve(true);
    // reset local storage when token is changed
    // seems legit...but unsure if it will cause any issues at this point
    credential.on('token-change', (): void => {
      localStorage.setItem(
        LS_CRED,
        JSON.stringify((this.credential as esri.Credential & { toJSON: () => any }).toJSON()),
      );
    });
  }
}

/**
 * Sign in widget to force auth on application load.
 */
@subclass('SignIn')
export class SignIn extends Widget {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
  container = document.createElement('div');

  constructor(
    properties: esri.WidgetProperties & {
      /**
       * OAuth instance.
       */
      oAuth: OAuth;
      /**
       * Application title.
       * @default 'Vernonia'
       */
      title?: string;
    },
  ) {
    super(properties);
    document.body.appendChild(this.container);
  }

  //////////////////////////////////////
  // Properties
  //////////////////////////////////////
  oAuth!: OAuth;

  title = 'Vernonia';

  //////////////////////////////////////
  // Render and rendering methods
  //////////////////////////////////////
  render(): tsx.JSX.Element {
    const { oAuth, title } = this;
    return (
      <div class={CSS.signIn}>
        <div class={CSS.signInContent}>
          <div class={CSS.signInTitle}>{title}</div>
          <calcite-button width="full" onclick={oAuth.signIn.bind(oAuth)}>
            Sign In
          </calcite-button>
          {INFO(CSS.signInInfo)}
        </div>
      </div>
    );
  }
}

/**
 * User control widget (internal).
 */
@subclass('UserControl')
class UserControl extends Widget {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
  constructor(
    properties: esri.WidgetProperties & {
      oAuth: OAuth;
    },
  ) {
    super(properties);
  }

  //////////////////////////////////////
  // Properties
  //////////////////////////////////////
  oAuth!: OAuth;

  //////////////////////////////////////
  // Render and rendering methods
  //////////////////////////////////////
  render(): tsx.JSX.Element {
    const {
      id,
      oAuth,
      oAuth: { signedIn, fullName, username, thumbnailUrl },
    } = this;
    const _id = `user_control_${id}`;
    return signedIn ? (
      <div class={CSS.userControl}>
        <calcite-avatar id={_id} full-name={fullName} thumbnail={thumbnailUrl} role="button"></calcite-avatar>
        <calcite-popover
          auto-close=""
          label="Sign out"
          placement="bottom"
          reference-element={_id}
          overlay-positioning="fixed"
        >
          <div class={CSS.userControlPopover}>
            <div>{fullName}</div>
            <span>{username}</span>
            <calcite-button width="full" onclick={oAuth.signOut.bind(oAuth)}>
              Sign out
            </calcite-button>
          </div>
        </calcite-popover>
      </div>
    ) : (
      <div class={CSS.userControl}>
        <calcite-icon id={_id} icon="sign-in" role="button" onclick={oAuth.signIn.bind(oAuth)}></calcite-icon>
        <calcite-tooltip label="Sign in" placement="bottom" reference-element={_id} overlay-positioning="fixed">
          Sign in
        </calcite-tooltip>
      </div>
    );
  }
}

/**
 * View control widget (internal).
 */
@subclass('ViewControl')
class ViewControl extends Widget {
  //////////////////////////////////////
  // Lifecycle
  //////////////////////////////////////
  constructor(
    properties: esri.WidgetProperties &
      MapApplicationProperties['viewControlOptions'] & {
        fullscreenElement?: HTMLElement;
        view: esri.MapView;
      },
  ) {
    super(properties);
  }

  postInitialize(): void {
    const {
      view,
      view: { magnifier },
      magnifierProperties,
    } = this;
    this.home = new HomeViewModel({ view });
    this.zoom = new ZoomViewModel({ view });
    magnifier.visible = false;
    if (magnifierProperties) Object.assign(magnifier, magnifierProperties);
  }

  //////////////////////////////////////
  // Properties
  //////////////////////////////////////
  fullscreenElement!: HTMLElement;

  includeFullscreen = false;

  includeLocate = false;

  includeMagnifier = false;

  magnifierProperties!: esri.MagnifierProperties;

  view!: esri.MapView;

  //////////////////////////////////////
  // Variables
  //////////////////////////////////////
  home!: esri.HomeViewModel;

  zoom!: esri.ZoomViewModel;

  //////////////////////////////////////
  // Private methods
  //////////////////////////////////////
  // very hacky - better solution?
  private _compassRotation(action: HTMLCalciteActionElement) {
    const { view } = this;
    let icon: HTMLDivElement;
    if (action.shadowRoot) {
      icon = action.shadowRoot.querySelector('.icon-container') as HTMLDivElement;
      if (icon) {
        this.watch('view.rotation', (): void => {
          icon.style.transform = `rotate(${view.rotation}deg)`;
        });
      } else {
        setTimeout(() => {
          this._compassRotation(action);
        }, 100);
      }
    } else {
      setTimeout(() => {
        this._compassRotation(action);
      }, 100);
    }
  }

  private _initializeFullscreen(action: HTMLCalciteActionElement): void {
    const { view, fullscreenElement } = this;

    import('@arcgis/core/widgets/Fullscreen/FullscreenViewModel').then((module: any) => {
      const fullscreen = new (module.default as esri.FullscreenViewModelConstructor)({
        view,
        element: fullscreenElement,
      });

      action.addEventListener('click', fullscreen.toggle.bind(fullscreen));
      action.disabled = fullscreen.state === 'disabled' || fullscreen.state === 'feature-unsupported';

      this.addHandles(
        watch(
          (): esri.FullscreenViewModel['state'] => fullscreen.state,
          (state?: esri.FullscreenViewModel['state']): void => {
            action.disabled = state === 'disabled' || state === 'feature-unsupported';

            const tooltip = action.querySelector('calcite-tooltip') as HTMLCalciteTooltipElement;

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
          },
        ),
      );
    });
  }

  private _initializeLocate(action: HTMLCalciteActionElement): void {
    const { view } = this;

    import('@arcgis/core/widgets/Locate/LocateViewModel').then((module: any) => {
      const locate = new (module.default as esri.LocateViewModelConstructor)({
        view,
      });

      action.addEventListener('click', locate.locate.bind(locate));
      action.disabled = locate.state === 'disabled';

      this.addHandles(
        watch(
          (): esri.LocateViewModel['state'] => locate.state,
          (state?: esri.LocateViewModel['state']): void => {
            action.disabled = state === 'disabled';

            action.icon =
              locate.state === 'ready'
                ? 'gps-on'
                : locate.state === 'locating'
                ? 'gps-on-f'
                : locate.state === 'disabled'
                ? 'gps-off'
                : '';
          },
        ),
      );
    });
  }

  private _magnifierHandle!: IHandle;

  private _toggleMagnifier(): void {
    const {
      view,
      view: { magnifier },
      _magnifierHandle,
    } = this;
    if (magnifier.visible) {
      magnifier.visible = false;
      if (_magnifierHandle) _magnifierHandle.remove();
    } else {
      magnifier.visible = true;
      this._magnifierHandle = view.on('pointer-move', (event: esri.ViewPointerMoveEvent): void => {
        magnifier.position = { x: event.x, y: event.y };
      });
    }
  }

  //////////////////////////////////////
  // Render and rendering methods
  //////////////////////////////////////
  render(): tsx.JSX.Element {
    const { view, zoom, home, includeLocate, includeFullscreen, includeMagnifier } = this;

    const magnifier = view.magnifier.visible;

    return (
      <div class={CSS.viewControl}>
        <div class={CSS.viewControlPads}>
          <calcite-action-pad expand-disabled="">
            <calcite-action-group>
              <calcite-action
                text="Zoom in"
                icon="plus"
                scale="s"
                disabled={!zoom.canZoomIn}
                onclick={zoom.zoomIn.bind(zoom)}
              >
                <calcite-tooltip close-on-click="" overlay-positioning="fixed" scale="s" slot="tooltip">
                  Zoom in
                </calcite-tooltip>
              </calcite-action>
              <calcite-action
                text="Zoom out"
                icon="minus"
                scale="s"
                disabled={!zoom.canZoomOut}
                onclick={zoom.zoomOut.bind(zoom)}
              >
                <calcite-tooltip close-on-click="" overlay-positioning="fixed" scale="s" slot="tooltip">
                  Zoom out
                </calcite-tooltip>
              </calcite-action>
            </calcite-action-group>
          </calcite-action-pad>
          <calcite-action-pad expand-disabled="">
            <calcite-action-group>
              <calcite-action text="Default extent" icon="home" scale="s" onclick={home.go.bind(home)}>
                <calcite-tooltip close-on-click="" overlay-positioning="fixed" scale="s" slot="tooltip">
                  Default extent
                </calcite-tooltip>
              </calcite-action>
              {includeLocate ? (
                <calcite-action
                  text="Zoom to location"
                  icon="gps-on"
                  scale="s"
                  disabled=""
                  afterCreate={this._initializeLocate.bind(this)}
                >
                  <calcite-tooltip close-on-click="" overlay-positioning="fixed" scale="s" slot="tooltip">
                    Zoom to location
                  </calcite-tooltip>
                </calcite-action>
              ) : null}
              {view.constraints.rotationEnabled ? (
                <calcite-action
                  text="Reset orientation"
                  icon="compass-needle"
                  scale="s"
                  afterCreate={this._compassRotation.bind(this)}
                  onclick={() => ((view as esri.MapView).rotation = 0)}
                >
                  <calcite-tooltip close-on-click="" overlay-positioning="fixed" scale="s" slot="tooltip">
                    Reset orientation
                  </calcite-tooltip>
                </calcite-action>
              ) : null}
            </calcite-action-group>
          </calcite-action-pad>
          {includeFullscreen ? (
            <calcite-action-pad expand-disabled="">
              <calcite-action-group>
                <calcite-action
                  text="Enter fullscreen"
                  disabled=""
                  scale="s"
                  icon="extent"
                  afterCreate={this._initializeFullscreen.bind(this)}
                >
                  <calcite-tooltip close-on-click="" overlay-positioning="fixed" scale="s" slot="tooltip">
                    Enter fullscreen
                  </calcite-tooltip>
                </calcite-action>
              </calcite-action-group>
            </calcite-action-pad>
          ) : null}
          {includeMagnifier ? (
            <calcite-action-pad expand-disabled="">
              <calcite-action-group>
                <calcite-action
                  text={magnifier ? 'Hide magnifier' : 'Show magnifier'}
                  scale="s"
                  icon="magnifying-glass"
                  indicator={magnifier ? true : false}
                  onclick={this._toggleMagnifier.bind(this)}
                >
                  <calcite-tooltip close-on-click="" overlay-positioning="fixed" scale="s" slot="tooltip">
                    {magnifier ? 'Hide magnifier' : 'Show magnifier'}
                  </calcite-tooltip>
                </calcite-action>
              </calcite-action-group>
            </calcite-action-pad>
          ) : null}
        </div>
      </div>
    );
  }
}
