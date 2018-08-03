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
import {Logger} from "../util/logger";
import {Channel} from "./channel";
import {EnumMediaMessage} from "./enum.media.messages";
import {IMediaNotifier} from "./media.notifier";

const TAG: string = " [MediaChannel] ";
const Log: Logger = Logger.getInstance();

// Manage annotations to call methods by transport message
// Store all methods/message type
const methodsByMessage: { [key: string]: IMethodWithParams } = {};

/**
 * MediaChannel Class dedicated to OCast Protocol
 */
export class MediaChannel extends Channel {
    public static NAMESPACE: string = "org.ocast.media";

    protected static EVENTS: any = {
        METADATA_CHANGED: "metadataChanged",
        PLAYBACK_STATUS: "playbackStatus",
    };
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
            if (types.hasOwnProperty(key)) {
                this.medias[types[key]] = media;
            }
        }
    }

    public addImageMediaManager(types: EnumMedia[], mediaElement: any) {
        let media = new ImageMedia(mediaElement, this);
        for (const key in types) {
            if (types.hasOwnProperty(key)) {
                this.medias[types[key]] = media;
            }
        }
    }

    /**
     * Implements specific parsing for this channel
     * @param {Transport} transport - Message to send
     */
    public onMessage(transport: Transport): void {
        // Check if message is supported
        if (!methodsByMessage[transport.message.data.name]) {
            Log.error(TAG + "Message type '" + transport.message.data.name + "' unknown");
            if (transport.type === EnumTransport.COMMAND) {
                this.sendReply(transport.id, transport.src, {
                    name: transport.message.data.name,
                    params: { code: EnumError.NO_IMPLEMENTATION },
                });
            }
            return;
        }

        // Explode message to call method
        const methodDescriptor: IMethodWithParams = methodsByMessage[transport.message.data.name];
        const paramsToCallMethod: any[] = [];
        const paramsMessage: {} = transport.message.data.params || {};
        let validate: boolean = true;
        methodDescriptor.params.forEach((paramType: IParamWithNameAndType) => {
            switch (paramType.name) {
                case "id":
                    paramsToCallMethod.push(transport.id);
                    break;
                case "src":
                    paramsToCallMethod.push(transport.src);
                    break;
                case "options":
                    paramsToCallMethod.push(transport.message.data.options);
                    break;
                default:
                    if (!paramsMessage.hasOwnProperty(paramType.name)) {
                        Log.error(TAG + "Mandatory parameter is not found <<" + paramType.name + ">>");
                        validate = false;
                    } else {
                        paramsToCallMethod.push(paramsMessage[paramType.name]);
                    }
            }
        });

        // Check if all params are ok
        if (!validate) {
            Log.error(TAG + "Error while executing " + methodDescriptor.methodName + " paramters missing)");
            if (transport.type === EnumTransport.COMMAND) {
                this.sendReply(transport.id, transport.src, {
                    name: transport.message.data.name,
                    params: { code: EnumError.PARAMS_MISSING },
                });
            }
            return;
        }

        // All params are ok, call method
        try {
            const returnCode: string | void = methodDescriptor.method.apply(this, paramsToCallMethod);
            if (typeof (returnCode) !== "undefined") {
                this.sendReply(transport.id, transport.src, {
                    name: transport.message.data.name,
                    params: { code: returnCode },
                });
            }
        } catch (e) {
            Log.error(TAG + "Error while executing " + methodDescriptor.methodName + " with error ", e);
            if (transport.type === EnumTransport.COMMAND) {
                this.sendReply(transport.id, transport.src, {
                    name: transport.message.data.name,
                    params: { code: EnumError.UNKNOWN_ERROR },
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
     * @param options - Options
     * @returns {EnumError}
     */
    @MethodToCallByMessage({
        message: EnumMediaMessage.PREPARE,
        params: [
            { name: "url", type: String },
            { name: "title", type: String },
            { name: "subtitle", type: String },
            { name: "logo", type: String },
            { name: "mediaType", type: EnumMedia },
            { name: "transferMode", type: EnumTransferMode },
            { name: "autoplay", type: Boolean },
            { name: "frequency", type: Number },
            { name: "options", type: null },
        ],
    })
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
    @MethodToCallByMessage({
        message: EnumMediaMessage.TRACK,
        params: [
            { name: "type", type: EnumTrack },
            { name: "trackId", type: String },
            { name: "enabled", type: Boolean },
            { name: "options", type: null },
        ],
    })
    public doTrack(type: EnumTrack, trackId: string, enabled: boolean, options: any): EnumError {
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
    @MethodToCallByMessage({
        message: EnumMediaMessage.RESUME,
        params: [
            { name: "options", type: null },
        ],
    })
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
    @MethodToCallByMessage({
        message: EnumMediaMessage.PAUSE,
        params: [
            { name: "options", type: null },
        ],
    })
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
    @MethodToCallByMessage({
        message: EnumMediaMessage.STOP,
        params: [
            { name: "options", type: null },
        ],
    })
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
    @MethodToCallByMessage({
        message: EnumMediaMessage.CLOSE,
        params: [
            { name: "options", type: null },
        ],
    })
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
    @MethodToCallByMessage({
        message: EnumMediaMessage.SEEK,
        params: [
            { name: "position", type: Number },
            { name: "options", type: null },
        ],
    })
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
    @MethodToCallByMessage({
        message: EnumMediaMessage.VOLUME,
        params: [
            { name: "volume", type: Number },
            { name: "options", type: null },
        ],
    })
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
    @MethodToCallByMessage({
        message: EnumMediaMessage.MUTE,
        params: [
            { name: "mute", type: Boolean },
            { name: "options", type: null },
        ],
    })
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
    @MethodToCallByMessage({
        message: EnumMediaMessage.GET_PLAYBACK_STATUS,
        params: [
            { name: "id", type: Number },
            { name: "src", type: String },
            { name: "options", type: null },
        ],
    })
    public doGetPlaybackStatus(id: number, src: string, options: any) {
        Log.debug(TAG + "onGetPlaybackStatus" + id + "," + src);
        if (!this.media) {
            return EnumError.NO_PLAYER_INITIALIZED;
        }
        let status: any = this.media.getPlaybackStatus();
        status.code = EnumError.OK;
        this.sendReply(id, src, { name: MediaChannel.EVENTS.PLAYBACK_STATUS, params: status, options });
    }

    /**
     * Reply to getMetadata Command
     * @param {number} id
     * @param {string} src
     * @param  options
     * @returns {EnumError} - Error code
     */
    @MethodToCallByMessage({
        message: EnumMediaMessage.GET_METADATA,
        params: [
            { name: "id", type: Number },
            { name: "src", type: String },
            { name: "options", type: null },
        ],
    })
    public doGetMetadata(id: number, src: string, options: any) {
        Log.debug(TAG + "onGetMetadata " + id + "," + src);
        if (!this.media) {
            return EnumError.NO_PLAYER_INITIALIZED;
        }
        let status: any = this.media.getMedatadata();
        status.code = EnumError.OK;
        this.sendReply(id, src, { name: MediaChannel.EVENTS.METADATA_CHANGED, params: status, options });
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
                return this.notifier[method].apply(this.notifier, args);
            } catch (e) {
                Log.error(TAG + "Implementation error on Notifier Method " + method + " : ", e);
                Log.error(TAG + "Implementation error on Notifier Method " + method + " : ", e);
                return EnumError.IMPLEMENTATION_ERROR;
            }
        }
        return EnumError.OK;
    }
}

// Declare annotation
/**
 * Annotation to declare a link between a method and a message
 * @param controlParams Details
 */
function MethodToCallByMessage(controlParams: IMethodToCallByMessage): Function {
    return (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<Function>) => {
        // When a new method is detected, store his declaration
        methodsByMessage[controlParams.message] = {
            method: descriptor.value,
            methodName: propertyKey,
            params: controlParams.params,
        };
    };
}

// Interfacs to declare links between methods and messages
/**
 * Global option given to annotation MethodToCallByMessage.
 * This interface describe the link between a method and a message
 */
interface IMethodToCallByMessage {
    message: string;
    params: IParamWithNameAndType[];
}

/**
 * Declare type of each parameter
 */
interface IParamWithNameAndType {
    name: string;
    type: any;
}

/**
 * Store declared link of method/message
 */
interface IMethodWithParams {
    method: Function;
    methodName: string;
    params: IParamWithNameAndType[];
}
