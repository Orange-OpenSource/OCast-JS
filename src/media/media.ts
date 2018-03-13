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

import {MediaChannel} from "../channel/media.channel";
import {Metadata} from "../protocol/metadata";
import {PlaybackStatus} from "../protocol/playback.status";
import {Track} from "../protocol/track";
import {EnumError} from "../type/enum.error";
import {EnumMedia} from "../type/enum.media";
import {EnumMediaStatus} from "../type/enum.media.status";
import {EnumTrack} from "../type/enum.track";
import {EnumTransferMode} from "../type/enum.transfermode";
import {Logger} from "../util/logger";

const Log: Logger = Logger.getInstance();

/**
 * Base Class MediaController
 */
export abstract class Media {
    public updateFrequency: number;
    public metadata: Metadata;
    protected statusHandler: any;
    private lastUpdate: number;

    /**
     * @constructor:
     * @param mediaElement
     * @param mediaChannel
     */
    constructor(public mediaElement: any, public mediaChannel: MediaChannel) {
        this.mediaElement.status = EnumMediaStatus.IDLE;
        this.lastUpdate = 0;
        this.statusHandler = this.onUpdateStatus.bind(this);
        this.metadata = null;
        this.addListeners();
    }

    /**
     * Return Status
     * @returns {any}
     */
    public getStatus(): EnumMediaStatus {
        return (this.mediaElement) ? this.mediaElement.status as EnumMediaStatus : null;
    }

    /** set metadata
     * @param title
     * @param subtitle
     * @param logo
     * @param mediaType
     * @param transferMode
     * @param subtitleTracks
     * @param audioTracks
     */
    public setMetadata(title: string, subtitle: string, logo: string, mediaType: EnumMedia,
                       transferMode: EnumTransferMode) {
        this.metadata = new Metadata(title, subtitle, logo, mediaType, transferMode);
    }

    /**
     * Set the source of the stream
     * @param {string} src - url of the stream
     */
    public abstract load(src: string, autoplay?: boolean);

    /**
     * update frequency
     * @param frequency
     */
    public setUpdateFrequency(frequency: number) {
        this.updateFrequency = frequency;
    }

    /**
     *
     * @returns {PlaybackStatus}
     */
    public abstract getPlaybackStatus(): PlaybackStatus; // must be implemented in derived class

    public seek(position: number): EnumError {
        return EnumError.NO_IMPLEMENTATION;
    }

    public setVolume(level: number): EnumError {
        return EnumError.NO_IMPLEMENTATION;
    }

    public setMute(mute: boolean): EnumError {
        return EnumError.NO_IMPLEMENTATION;
    }

    public pause(): EnumError {
        return EnumError.NO_IMPLEMENTATION;
    }

    public stop(): EnumError {
        this.clear();
        this.updateStatus(EnumMediaStatus.STOPPED);
        return EnumError.OK;
    }

    public abort(): EnumError {
        this.clear();
        this.updateStatus(EnumMediaStatus.CANCELLED);
        return EnumError.OK;
    }

    public resume(): EnumError {
        return EnumError.NO_IMPLEMENTATION;
    }

    /**
     * erase media player
     */
    public clear(): void {
        this.load(null);
        this.removeListeners();
    }

    public setTrack(type: EnumTrack, trackId: string, enabled: boolean): EnumError {
        return EnumError.NO_IMPLEMENTATION;
    }
    /**
     * return Metadatas
     * @returns {Metadata}
     */
    public getMedatadata(): Metadata {
        return this.metadata;
    }

    protected abstract getMediaEvents();

    /**
     * Add Listeners
     * @private
     */
    protected addListeners(): void {
        const events: any = this.getMediaEvents();
        for (const event in events) {
            if (events.hasOwnProperty(event)) {
                Log.debug("add Event Listener on <<<" + event + ">>>");
                this.mediaElement.addEventListener(event, this.statusHandler);
            }
        }
    }

    /**
     * Remove Listeners
     * @private
     */
    protected removeListeners(): void {
        const events: any = this.getMediaEvents();
        for (const event in events) {
            if (events.hasOwnProperty(event)) {
                this.mediaElement.removeEventListener(event, this.statusHandler);
            }
        }
    }
    protected onUpdateMetadata(event): void  {
        if (! this.mediaElement) {
            console.warn("MediaElement is null, ignore event ", event);
            return;
        }
        this.mediaChannel.onUpdateMetadata(this.getMedatadata());
    }

    private onUpdateStatus(event) {
        const mapping = this.getMediaEvents();
        this.updateStatus(mapping[event.type]);
        this.onUpdateMetadata(event);
    }

    private updateStatus(status) {
        if (!this.mediaElement) {
            Log.warn("MediaElement is null, ignore event ", event);
            return;
        }
        const newUpdate = new Date().getTime();

        const previousStatus = this.mediaElement.status;
        this.mediaElement.status = status;

        // Dispatch Event If Needed
        if (previousStatus !== this.mediaElement.status) {
            this.mediaChannel.onUpdateStatus(this.mediaElement.status);
        } else if ((this.updateFrequency !== 0) && (newUpdate > this.lastUpdate + this.updateFrequency * 1000)) {
            this.lastUpdate = newUpdate;
            this.mediaChannel.onUpdateStatus(this.getPlaybackStatus());
        }

        // Manage Automatic Transition
        if ((this.mediaElement.status === EnumMediaStatus.STOPPED) ||
            (this.mediaElement.status === EnumMediaStatus.CANCELLED)) {
            this.mediaElement.status = EnumMediaStatus.IDLE;
            this.mediaChannel.onUpdateStatus(this.getPlaybackStatus());
        }
    }
}
