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

import { Channel } from "./channel/channel";
import { MediaChannel } from "./channel/media.channel";
import { WebappChannel } from "./channel/webapp.channel";
import { IOcastInit } from "./i-ocast-init";
import { Transport } from "./protocol/transport";
import { TransportMessage } from "./protocol/transport.message";
import { EnumError } from "./type/enum.error";
import { EnumProtocol } from "./type/enum.protocol";
import { EnumTransport } from "./type/enum.transport";
import { Logger } from "./util/logger";

const TAG: string = " [OCast] ";
const Log: Logger = Logger.getInstance();

/**
 * OCast Root Object
 */
export class OCast {
  public debug = false;
  private ws: WebSocket = null;
  private channels: Channel[] = [];
  private initParameters: IOcastInit = null;

  /**
   * OCast Root Object, create default channel 'webapp' and 'media'
   * @constructor
   */
  constructor(initParameters?: IOcastInit) {
    this.setupMediaChannel();
    this.setupWebappChannel();
    this.initParameters = initParameters || {};
    this.initParameters.webSocketProtocol = this.initParameters.webSocketProtocol || EnumProtocol.PROTOCOL;
    this.initParameters.webSocketPort = this.initParameters.webSocketPort || EnumProtocol.PORT;
  }

  /**
   * Public function to Start initialization
   * @public
   */
  public start() {
    const url = this.initParameters.webSocketProtocol + EnumProtocol.HOST + ":" +
      this.initParameters.webSocketPort + EnumProtocol.PATH;
    this.ws = new WebSocket(url);
    this.ws.onopen = this.onConnected.bind(this);
    this.ws.onmessage = this.onMessage.bind(this);
    this.ws.onerror = this.onError.bind(this);
    this.ws.onclose = this.onClose.bind(this);
  }

  /**
   * Create a Custom Channel
   * @param service
   * @returns {MediaChannel}
   * @public
   */
  public createChannel(service: string): Channel {
    // todo: Manage duplicate channel
    let channel: Channel = new Channel(service);
    channel.setSocket(this.ws);
    this.channels[service] = channel;
    return channel;
  }

  /**
   * Return a MediaChannel
   * @returns {MediaChannel}
   * @public
   */
  public getMediaChannel(): MediaChannel {
    return this.getChannel(MediaChannel.NAMESPACE) as MediaChannel;
  }

  /**
   * Return WebappChannel
   * @returns {WebappChannel}
   * @public
   */
  public getWebappChannel(): WebappChannel {
    return this.getChannel(WebappChannel.NAMESPACE) as WebappChannel;
  }

  /**
   * Return Channel
   * @param {string} service Name
   * @returns {Channel}
   * @public
   */
  public getChannel(service: string): Channel {
    return this.channels[service] as Channel;
  }
  /**
   * Initialize MediaChannel
   * @private
   */
  private setupMediaChannel() {
    let channel = new MediaChannel();
    this.channels[channel.name] = channel;
  }

  /**
   * Initialize MediaChannel
   * @private
   */
  private setupWebappChannel(): void {
    let channel: WebappChannel = new WebappChannel();
    this.channels[channel.name] = channel;
  }
  /**
   * publish message on internal Bus
   * @param {Transport} transport - transport Message
   * @private
   */
  private publish(transport: Transport) {
    if (this.channels.hasOwnProperty(transport.message.service)) {
      let channel = this.channels[transport.message.service];
      channel.onMessage(transport);
    } else {
      Log.warn("Unknown namespace <<<" + transport.message.service + ">>>");
      let message = new Transport(
        transport.dst,
        transport.src,
        EnumTransport.REPLY,
        transport.id,
        new TransportMessage(transport.message.service, {
          params: { code: EnumError.INVALID_NAMESPACE },
        }),
      );
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Handler to receive messages
   * @param event
   * @private
   */
  private onMessage(event) {
    Log.debug(TAG + "receive message : " + event.data);
    if (event.data.type === EnumTransport.REPLY && event.data.status !== "ok") {
      Log.error(TAG + "receive error message : " + event.data.status);
      return;
    }
    let message: Transport = JSON.parse(event.data);
    try {
      this.publish(message);
    } catch (e) {
      // todo: Catch a better way internal Errors (with call stack)
      console.error("Uncaught exception" + e);
    }
  }
  private onError(error) {
    Log.info(TAG + "receive error event : ", error);
  }

  private onClose(close) {
    Log.info(TAG + "websocket is closed ");
  }

  /**
   * Send Connected Event when Connection Opened
   * @param event
   */
  private onConnected(event) {
    Log.info(TAG + "websocket onConnected event");
    this.updateSocketChannel();
  }

  /**
   * Set websocket on all channels
   * @private
   */
  private updateSocketChannel(): void {
    for (let key in this.channels) {
      if (this.channels.hasOwnProperty(key)) {
        let channel: Channel = this.channels[key];
        channel.setSocket(this.ws);
      }
    }
  }
}
