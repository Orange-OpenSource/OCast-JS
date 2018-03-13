/*
 * Copyright 2017 Orange
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 * limitations under the License.
 */

export class Logger {

    public static DEBUG: number = 0;
    public static INFO: number = 1;
    public static WARN: number = 2;
    public static ERROR: number = 3;
    public static NONE: number = 99;

    public static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
            Logger.instance.setDebugLevel(Logger.INFO);
        }
        return Logger.instance;
    }

    private static instance: Logger;

    public debug = null;
    public info = null;
    public warn = null;
    public error = null;

    constructor() {
        this.setDebugLevel(Logger.INFO);
    }

    public setDebugLevel(level: number) {
        /* tslint:disable:no-console */
        this.debug = (() => {
            let timestamp = () => {/*empty*/};
            timestamp.toString = () => {
                return (new Date()).toISOString() + " - [DEBUG]";
            };
            return console.log.bind(console, "%s", timestamp);
        } )();
        this.info = (() => {
            let timestamp = () => {/*empty*/};
            timestamp.toString = () => {
                return (new Date()).toISOString() + " - [INFO]";
            };
            return console.log.bind(console, "%s", timestamp);
        } )();
        this.warn = (() => {
            let timestamp = () => {/*empty*/};
            timestamp.toString = () => {
                return (new Date()).toISOString() + " - [WARNING]";
            };
            return console.log.bind(console, "%s", timestamp);
        } )();
        this.error = (() => {
            let timestamp = () => {/*empty*/};
            timestamp.toString = () => {
                return (new Date()).toISOString() + " - [ERROR]";
            };
            return console.log.bind(console, "%s", timestamp);
        } )();
        if (level > Logger.DEBUG) {
            this.debug = () => { return false; };
        }
        if (level > Logger.INFO) {
            this.info = () => { return false; };
        }
        if (level > Logger.WARN) {
            this.warn = () => { return false; };
        }
        if (level > Logger.ERROR) {
            this.error = () => { return false; };
        }
    }
}
