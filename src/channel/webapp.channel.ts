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

import {Logger} from "../util/logger";
import {Channel} from "./channel";

const TAG: string = " [WebappChannel] ";
const Log: Logger = Logger.getInstance();

/**
 * WebApp Channel
 */
export class WebappChannel extends Channel {
    /**
     * Default NameSpace
     * @type {string}
     */
    public static NAMESPACE: string = "org.ocast.webapp";

    /**
     * List of Events
     * @type {{CONNECTION_STATUS: string}}
     */
    protected static EVENTS: any = {
        CONNECTION_STATUS: "connectedStatus",
    };

    /**
     * Constructor
     */
    constructor() {
        super(WebappChannel.NAMESPACE);
    }

    /**
     * Update socket used by the channel
     * @param {WebSocket} ws - Websocket instance
     * @public
     */
    public setSocket(ws: WebSocket) {
        super.setSocket(ws);
        this.sendConnected();
    }
    /**
     * send Connected Event
     * @private
     */
    private sendConnected() {
        Log.debug(TAG + "send connected event");
        this.sendEvent({name: WebappChannel.EVENTS.CONNECTION_STATUS, params: {status: "connected"}});
    }

}
