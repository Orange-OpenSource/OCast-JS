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

import {Metadata} from "../protocol/metadata";
import {PlaybackStatus} from "../protocol/playback.status";
import {EnumError} from "../type/enum.error";
import {EnumMedia} from "../type/enum.media";
import {EnumTrack} from "../type/enum.track";
import {EnumTransferMode} from "../type/enum.transfermode";

export interface IMediaNotifier {

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
    onPrepare(url: string, title: string, subtitle: string, logo: string, mediaType: EnumMedia,
                         transferMode: EnumTransferMode, autoplay: boolean, frequency: number,
                         options: any): EnumError | Promise<EnumError>;

    /**
     * pause
     * @param options
     * @returns {EnumError} - Error code
     */
    onPause(options: any): EnumError | Promise<EnumError>;

    /**
     * track
     * @param type
     * @param trackId
     * @param enabled
     * @param options
     * @returns {EnumError} - Error code
     */
    onTrack(type: EnumTrack, trackId: string, enabled: boolean, options): EnumError | Promise<EnumError>;

    /**
     * resume
     * @param options
     * @returns {EnumError} - Error code
     */
    onResume(options: any): EnumError | Promise<EnumError>;

    /**
     * stop
     * @param options
     * @returns {EnumError} - Error code
     */
    onStop(options: any): EnumError | Promise<EnumError>;

    /**
     * close
     * @param options
     * @returns {EnumError} - Error code
     */
    onClose(options: any): EnumError | Promise<EnumError>;

    /**
     * on Seek
     * @param {position} position
     * @param options
     * @returns {EnumError} - Error code
     */
    onSeek(position: number, options: any): EnumError | Promise<EnumError>;

    /**
     * Implements  volume command
     * @param {number} volume
     * @param options
     * @returns {EnumError} - Error code
     */
    onVolume(volume: number, options: any): EnumError | Promise<EnumError>;

    /**
     * Send a mute command
     * @param {boolean} mute
     * @param options
     * @returns {EnumError} - Error code
     */
     onMute(mute: boolean, options: any): EnumError | Promise<EnumError>;

    /**
     * @param {PlaybackStatus} status
     * @param options
     */
     onUpdateStatus(status: PlaybackStatus, options: any): void;

    /**
     * @param {Metadata} metadata
     * @param options
     */
     onUpdateMetadata(metadata: Metadata, options: any): void;

}
