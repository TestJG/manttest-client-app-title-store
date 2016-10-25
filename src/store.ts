import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/of";
import "rxjs/add/observable/merge";
import "rxjs/add/operator/distinctUntilChanged";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/map";
import "rxjs/add/operator/switchMap";
import "rxjs/add/operator/startWith";
import "rxjs/add/operator/observeOn";
import "rxjs/add/operator/subscribeOn";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/timeout";
import * as deepEqual from "deep-equal";
import {
  reassign, reassignif,
  actionCreator, TypedActionDescription, EmptyActionDescription,
  reducerFromActions, Reducer, StateUpdate,
  createStore, Store, StoreMiddleware,
  withEffects, defineStore, ICreateStoreOptions, logUpdates,
  tunnelActions, extendWithActions, extendWith, Action,
} from "rxstore";
import {
MessagesStore, MessagesModel, createMessagesStore, alertEffects, MessagesActions,
} from "manttest-client-messages-store";

/* MODELS */

export interface AppTitleState {
  title: string;
  onMainButtonClick: () => void;
  mainButtonIcon: any;
  messagesStore: MessagesStore;
  snackBarMessagesStore: MessagesStore;
}

export interface SetAppBarPayload {
  title: string;
  onMainButtonClick: () => void;
  mainButtonIcon: any;
}

/* ACTIONS */

export interface AppTitleEvents {
  cleanMessages(): void;
  logOut(): void;
}

const newEvent = actionCreator<AppTitleState>("MantTest.AppTitle/");

export const AppTitleActions = {

  setAppBar: newEvent.of<SetAppBarPayload>(
    "SET_APP_BAR",
    (s, p) => reassign(s, {
      onMainButtonClick: p.onMainButtonClick,
      title: p.title,
      mainButtonIcon: p.mainButtonIcon,
    })
  ),

  toggleSettings: newEvent("TOGGLE_SETTINGS"),

  loadMessages: newEvent.of<MessagesModel[]>("LOAD_MESSAGES"),

  cleanMessages: newEvent("CLEAN_MESSAGES"),

  logOut: newEvent("LOG_OUT"),
};

/* STORE */

const AppTitleReducer = reducerFromActions(AppTitleActions);

export type AppTitleStore = Store<AppTitleState> & AppTitleEvents;

export const defaultAppTitleState = (): AppTitleState => ({
  title: "MantTest 2.0",
  onMainButtonClick: () => undefined,
  mainButtonIcon: undefined,
  messagesStore: createMessagesStore()(),
  snackBarMessagesStore: createMessagesStore()({ middlewaresAfter: [withEffects(alertEffects({ timeout: 0 }))] }),
});

export const createAppTitleStore = () => defineStore<AppTitleState, AppTitleStore>(
  AppTitleReducer,
  defaultAppTitleState,
  extendWithActions(AppTitleActions),
  tunnelActions({
    actions: {
      loadMessages: (a: Action) => MessagesActions.addMessages(a.payload),
      cleanMessages: (a: Action) => MessagesActions.cleanMessages(),
    },
    dispatchFactory: (store: AppTitleStore) => store.state$.map(s => s.messagesStore.dispatch),
  }),
  tunnelActions({
    actions: {
      loadMessages: (a: Action) => MessagesActions.addMessages(a.payload),
    },
    dispatchFactory: (store: AppTitleStore) => store.state$.map(s => s.snackBarMessagesStore.dispatch),
  }),
);
