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

import {ImageMedia} from "../media/image.media";
import {Media} from "../media/media";
import {VideoMedia} from "../media/video.media";
import {Metadata} from "../protocol/metadata";
import {PlaybackStatus} from "../protocol/playback.status";
import {Transport} from "../protocol/transport";
import {EnumError} from "../type/enum.error";
import {EnumMedia} from "../type/enum.media";
import {EnumMediaStatus} from "../type/enum.media.status";
import {EnumTrack} from "../type/enum.track";
import {EnumTransferMode} from "../type/enum.transfermode";
import {EnumTransport} from "../type/enum.transport";
import {FunctionHelper} from "../util/function.helper";
import {Logger} from "../util/logger";
import {Channel} from "./channel";
import {IMediaNotifier} from "./media.notifier";

const TAG: string = " [MediaChannel] ";
const Log: Logger = Logger.getInstance();

/**
 * MediaChannel Class dedicated to OCast Protocol
 */
export class MediaChannel extends Channel {
    public static NAMESPACE: string = "org.ocast.media";

    protected static EVENTS: any = {
        METADATA_CHANGED: "metadataChanged",
        PLAYBACK_STATUS: "playbackStatus",
    };
    private static PREFIX: string = "do";
    private media: Media = null;
    private notifier: IMediaNotifier;
    private medias: Media[] = [];

    /**
     * Base class for OCast Protocol (MediaChannel).
     * @constructor
     */
    constructor() {
        super(MediaChannel.NAMESPACE);
    }

    public setNotifier(notifier: IMediaNotifier): void {
        this.notifier = notifier;
    }

    public addVideoMediaManager(types: EnumMedia[], mediaElement: any) {
        let media = new VideoMedia(mediaElement, this);
        for (const key in types) {
            if (types.hasOwnProperty(key)) { //TO FIX : always true
                this.medias[types[key]] = media;
            }
        }
    }

    public addImageMediaManager(types: EnumMedia[], mediaElement: any) {
        let media = new ImageMedia(mediaElement, this);
        for (const key in types) {
            if (types.hasOwnProperty(key)) { //TO FIX : always true
                this.medias[types[key]] = media;
            }
        }
    }

    /**
     * Implements specific parsing for this channel
     * @param {Transport} transport - Message to send
     */
    public onMessage(transport: Transport) {
        const method = MediaChannel.PREFIX + FunctionHelper.capitalizeFirstLetter(transport.message.data.name);
        const params = transport.message.data.params != null ? transport.message.data.params : {};
        const methodParams = [];

        // Method to call specific implementation
        if (typeof this[method] === "function") {
            const requiredParams = FunctionHelper.getParamNames(this[method]);
            let validate = true;
            // Add Options in params ...
            params.options = transport.message.data.options;
            params.id = transport.id;
            params.src = transport.src;

            for (const key in requiredParams) {
                if (!params.hasOwnProperty(requiredParams[key])) {
                    Log.error(TAG + "Mandatory parameter is not found <<" + requiredParams[key] + ">>");
                    validate = false;
                } else {
                    methodParams.push(params[requiredParams[key]]);
                }
            }

            if (validate) {
                try {
                    Log.debug(TAG + "call   " + method + "(" + JSON.stringify(methodParams) + ")");
                    const returnCode = this[method].apply(this, methodParams);
                    if (typeof(returnCode) !== "undefined") {
                        this.sendReply(transport.id, transport.src, {
                            name: transport.message.data.name,
                            params: {code: returnCode},
                        });
                    }
                } catch (e) {
                    Log.error(TAG + "Error while executing " + method + " with error ", e);
                    if (transport.type === EnumTransport.COMMAND) {
                        this.sendReply(transport.id, transport.src, {
                            name: transport.message.data.name,
                            params: {code: EnumError.UNKNOWN_ERROR},
                        });
                    }
                }
            } else {
                Log.error(TAG + "Error while executing " + method + " paramters missing)");
                if (transport.type === EnumTransport.COMMAND) {
                    this.sendReply(transport.id, transport.src, {
                        name: transport.message.data.name,
                        params: {code: EnumError.PARAMS_MISSING},
                    });
                }
            }
        } else {
            Log.error(TAG + "Function '" + method + "' not found");
            if (transport.type === EnumTransport.COMMAND) {
                this.sendReply(transport.id, transport.src, {
                    name: transport.message.data.name,
                    params: {code: EnumError.NO_IMPLEMENTATION},
                });
            }
        }
    }

    /**
     * Override this method to implement prepare command
     * @param {url} url - Url of the source
     * @param {string} title - Title of the media
     * @param {string}subtitle - subtitle of the media
     * @param {string} logo - Optionnal Logo
     * @param {EnumMedia} mediaType - Media Type
     * @param {EnumTransferMode} transferMode - Type of Stream
     * @param {boolean} autoplay - Boolean to play stream automaticly
     * @param {number} frequency - Status update Frequency
     * 
     * @param options - Options
     * @returns {EnumError}
     */
    public doPrepare(url: string, title: string, subtitle: string, logo: string, mediaType: EnumMedia,
                     transferMode: EnumTransferMode, autoplay: boolean, frequency: number, options: any): EnumError {
        Log.debug(TAG + "onPrepare Receives (" + url + "," + title + "," + subtitle + "," + logo + "," + mediaType +
            "," + transferMode + "," + autoplay + "," + frequency + "," + options);
        if (!this.medias.hasOwnProperty(mediaType)) {
            return EnumError.NO_IMPLEMENTATION;
        }
        this.media = this.medias[mediaType];
        this.media.setUpdateFrequency(frequency);
        this.media.setMetadata(title, subtitle, logo, mediaType, transferMode);
        this.media.load(url, autoplay);
        return this.callNotifier("onPrepare", arguments);
    }

    /**
     * track
     * @param subtitleTrack
     * @param audioTrack
     * @returns {EnumError} - Error code
     */
    public doTrack(type: EnumTrack, trackId: string, enabled: boolean, options): EnumError {
        Log.debug(TAG + "onTrack");
        if (!this.media) {
            return EnumError.NO_PLAYER_INITIALIZED;
        }
        let returnCode: EnumError = this.media.setTrack(type, trackId, enabled);
        return (returnCode !== EnumError.OK) ? returnCode : this.callNotifier("onTrack", arguments);
    }

    /**
     * resume
     * @param options
     * @returns {EnumError} - Error code
     */
    public doResume(options: any): EnumError {
        Log.debug(TAG + "onResume");
        if (!this.media) {
            return EnumError.NO_PLAYER_INITIALIZED;
        }

        let status = (this.media != null) ? this.media.getStatus() : null;
        if ((status !== EnumMediaStatus.PAUSED)) {
            return EnumError.PLAYER_INVALID_STATE;
        }
        this.media.resume();
        return this.callNotifier("onResume", arguments);
    }

    /**
     * pause
     * @param options
     * @returns {EnumError} - Error code
     */
    public doPause(options: any): EnumError {
        Log.debug(TAG + "onPause");
        if (!this.media) {
            return EnumError.NO_PLAYER_INITIALIZED;
        }
        let returnCode: EnumError = this.media.pause();
        return (returnCode !== EnumError.OK) ? returnCode : this.callNotifier("onPause", arguments);
    }

    /**
     * stop
     * @param options
     * @returns {EnumError} - Error code
     */
    public doStop(options: any): EnumError {
        Log.debug("onStop");
        if (!this.media) {
            return EnumError.NO_PLAYER_INITIALIZED;
        }

        let returnCode: EnumError = this.media.stop();
        return (returnCode !== EnumError.OK) ? returnCode : this.callNotifier("onStop", arguments);
    }

    /**
     * close
     * @param options
     * @returns {EnumError} - Error code
     */
    public doClose(options: any): EnumError {
        Log.debug(TAG + "onClose");
        if (!this.media) {
            return EnumError.NO_PLAYER_INITIALIZED;
        }

        let returnCode: EnumError = this.media.abort();
        return (returnCode !== EnumError.OK) ? returnCode : this.callNotifier("onClose", arguments);
    }

    /**
     * on Seek
     * @param {number} position
     * @param options
     * @returns {EnumError} - Error code
     */

    public doSeek(position: number, options: any): EnumError {

        Log.debug(TAG + "onSeek");
        if (!this.media) {
            return EnumError.NO_PLAYER_INITIALIZED;
        }

        let returnCode: EnumError = this.media.seek(position);
        return (returnCode !== EnumError.OK) ? returnCode : this.callNotifier("onSeek", arguments);
    }

    /**
     * Implements  volume command
     * @param {level} volume
     * @param options
     * @returns {EnumError} - Error code
     */
    public doVolume(volume: number, options: any): EnumError {
        Log.debug(TAG + "onVolume");
        if (!this.media) {
            return EnumError.NO_PLAYER_INITIALIZED;
        }

        let returnCode: EnumError = this.media.setVolume(volume);
        return (returnCode !== EnumError.OK) ? returnCode : this.callNotifier("onVolume", arguments);
    }

    /**
     * Send a mute command
     * @param {boolean} mute
     * @param options
     * @returns {EnumError} - Error code
     */
    public doMute(mute: boolean, options: any): EnumError {
        Log.debug(TAG + "onMute");
        if (!this.media) {
            return EnumError.NO_PLAYER_INITIALIZED;
        }
        let returnCode: EnumError = this.media.setMute(mute);
        return (returnCode !== EnumError.OK) ? returnCode : this.callNotifier("onMute", arguments);
    }

    /**
     * getPlaybackStatus
     * @param {number} id
     * @param {string} src
     * @param options
     * @returns {EnumError} - Error code
     */
    public doGetPlaybackStatus(id: number, src: string, options: any) {
        Log.debug(TAG + "onGetPlaybackStatus" + id + "," + src);
        if (!this.media) {
            return EnumError.NO_PLAYER_INITIALIZED;
        }
        let status: any = this.media.getPlaybackStatus();
        status.code = EnumError.OK;
        this.sendReply(id, src, {name: MediaChannel.EVENTS.PLAYBACK_STATUS, params: status, options});
    }

    /**
     * Reply to getMetadata Command
     * @param {number} id
     * @param {string} src
     * @param  options
     * @returns {EnumError} - Error code
     */
    public doGetMetadata(id: number, src: string, options: any) {
        Log.debug(TAG + "onGetMetadata " + id + "," + src);
        if (!this.media) {
            return EnumError.NO_PLAYER_INITIALIZED;
        }
        let status: any = this.media.getMedatadata();
        status.code = EnumError.OK;
        this.sendReply(id, src, {name: MediaChannel.EVENTS.METADATA_CHANGED, params: status, options});
    }

    /**
     * Send a new playback status on MediaChannel
     */
    public sendPlaybackStatus() {
        this.sendEvent({
            name: MediaChannel.EVENTS.PLAYBACK_STATUS,
            options: null,
            params: this.media.getPlaybackStatus(),
        });
    }

    /**
     * Send a new metadachanged Event on MediaChannel
     */
    public sendMetadataChanged() {
        // To be called ....
        this.sendEvent({
            name: MediaChannel.EVENTS.METADATA_CHANGED,
            options: null,
            params: this.media.getMedatadata(),
        });
    }

    public onUpdateStatus(status: PlaybackStatus) {
        this.sendPlaybackStatus();
        this.callNotifier("onUpdateStatus", arguments);
    }

    public onUpdateMetadata(metadata: Metadata) {
        this.sendMetadataChanged();
        this.callNotifier("onUpdateMetadata", arguments);
    }

    private callNotifier(method: string, args): EnumError {
        if (this.notifier !== undefined) {
            try {
                return this.notifier[method].apply(this, args);
            } catch (e) {
                Log.error(TAG + "Implementation error on Notifier Method " + method + " : ", e);
                Log.error(TAG + "Implementation error on Notifier Method " + method + " : ", e);
                return EnumError.IMPLEMENTATION_ERROR;
            }
        }
        return EnumError.OK;
    }
}
