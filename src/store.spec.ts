"use strict";

import "jest";
require("babel-core/register");
require("babel-polyfill");
import { Observable } from "rxjs/Observable";
import { queue } from "rxjs/scheduler/queue";
import "rxjs/add/observable/concat";
import "rxjs/add/observable/empty";
import "rxjs/add/observable/of";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/concat";
import "rxjs/add/operator/delay";
import "rxjs/add/operator/do";
import "rxjs/add/operator/first";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/last";
import "rxjs/add/operator/map";
import "rxjs/add/operator/observeOn";
import "rxjs/add/operator/subscribeOn";
import "rxjs/add/operator/switchMap";
import "rxjs/add/operator/takeLast";
import "rxjs/add/operator/timeout";
import "rxjs/add/operator/toPromise";
import * as deepEqual from "deep-equal";
import {
    reassign, Store, Action, StoreActions, logUpdates, startEffects,
    tunnelActions, ActionTunnel,
} from "rxstore";
import { testActions, expectedActions } from "rxstore-jest";
import {
    testUpdateEffects, testActionEffects, testStateEffects,
    expectAction, expectItem, testLastStateEffects,
} from "rxstore-jest";

import { defaultAppTitleState, createAppTitleStore, AppTitleState, AppTitleStore, AppTitleActions } from "./index";
import { MessagesActions } from "manttest-client-messages-store";

describe("defaultAppTitleState", () => {
    describe("Sanity checks", () => {
        it("Should be a function", () => {
            expect(typeof defaultAppTitleState).toBe("function");
        });
    });

    describe("Given no options", () => {
        it("The default state should have default values", () => {
            const state = defaultAppTitleState();
            expect(state.title).toEqual("MantTest 2.0");
            expect(typeof state.onMainButtonClick).toBe("function");
            expect(state.mainButtonIcon).toBeUndefined;
            expect(typeof state.messagesStore).toBe("object");
            expect(typeof state.snackBarMessagesStore).toBe("object");
        });
    });
});

describe("createAppTitleStore", () => {
    describe("Sanity checks", () => {
        it("should be a function", () => expect(typeof createAppTitleStore).toBe("function"));
    });

    testLastStateEffects<AppTitleState, AppTitleStore>("Given a defaultAppTitleState", createAppTitleStore())
        ("When the store receives no actions", "The state should be as expected", [],
        state => {
            expect(state.mainButtonIcon).toEqual(defaultAppTitleState().mainButtonIcon);
            expect(typeof state.messagesStore).toBe("object");
            expect(typeof state.onMainButtonClick).toBe("function");
            expect(typeof state.snackBarMessagesStore).toBe("object");
            expect(state.title).toEqual(defaultAppTitleState().title);
        });
});

const init: AppTitleState = defaultAppTitleState();
const initSetup: AppTitleState = reassign(init, {
    onMainButtonClick: console.log,
    title: "title",
    mainButtonIcon: "mainButtonIcon",
});

testActions(AppTitleActions, "AppTitleActions",
    expectedActions<AppTitleState>("MantTest.AppTitle/",
        actions => {
            actions.typed("setAppBar", "SET_APP_BAR")
                .withSample(
                    init, {
                        onMainButtonClick: console.log,
                        title: "title",
                        mainButtonIcon: "mainButtonIcon",
                    }, initSetup);

            actions.empty("toggleSettings", "TOGGLE_SETTINGS");

            actions.typed("loadMessages", "LOAD_MESSAGES");

            actions.empty("cleanMessages", "CLEAN_MESSAGES");

            actions.empty("logOut", "LOG_OUT");
}));
