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

import {OCast} from "../ocast";
import {Transport} from "../protocol/transport";
import {TransportMessage} from "../protocol/transport.message";
import {EnumError} from "../type/enum.error";
import {EnumProtocol} from "../type/enum.protocol";
import {EnumTransport} from "../type/enum.transport";
import {Logger} from "../util/logger";

const TAG: string = " [Channel] ";
const UUID: string = "browser";
const WILDCARD: string = "*";

const Log: Logger = Logger.getInstance();

/**
 * Base Channel Class used to Communicate with the Controller
 */
export class Channel {
    protected static sequenceMessage: number = 1;

    private ws: WebSocket = null;

    /**
     * Represents a Channel.
     * @constructor
     * @param {string} name - The service name of the channel, used to route the message.
     */
    constructor(public name: string) {
    }

    public setSocket(websocket: WebSocket) {
        this.ws = websocket;
    }

    /**
     * Method used to notify a new message for this Channel
     * @param {Transport} transport - message received
     */
    public onMessage(transport: Transport) {
        Log.warn(TAG + "onMessage need to be implemented for namespace " + this.name);
        this.sendReply(transport.id, transport.src, {params: {code: EnumError.NO_IMPLEMENTATION}});
    }

    /**
     * send Reply Command
     * @param {number} id - Request identifier
     * @param {string} dst - Destination identifier
     * @param {any} data - Data of the reply
     */
    protected sendReply(id: number, dst: string, data: any) {
        const message = new Transport(UUID, dst, EnumTransport.REPLY, id, new TransportMessage(this.name, data));
        message.setStatus(EnumProtocol.OK_STATUS as string);
        Log.debug(TAG + "sendReply : " + JSON.stringify(message));
        this.sendMessage(message);
    }

    /**
     * sendEvent
     * @param {any} data - Data of the event
     */
    protected sendEvent(data: any) {
        const message = new Transport(UUID, WILDCARD, EnumTransport.EVENT, Channel.sequenceMessage++,
            new TransportMessage(this.name, data));
        Log.debug(TAG + "sendEvent : " + JSON.stringify(message));
        this.sendMessage(message);
    }

    /**
     * send command event
     * @param {string} dst - Destination identifier
     * @param {any} data - Data of the command
     */
    protected sendCommand(dst: string, data: any) {
        const message = new Transport(UUID, dst, EnumTransport.COMMAND, Channel.sequenceMessage++,
            new TransportMessage(this.name, data));
        Log.debug(TAG + "sendCommand : " + JSON.stringify(message));
        this.sendMessage(message);
    }

    /**
     * Send Transport : Basic Command
     * @param {Transport} message - Message to send
     * @private
     */
    private sendMessage(message: Transport) {
        this.ws.send(JSON.stringify(message));
    }
}
