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

import {ImagePlaybackStatus} from "../media/image.playback.status";
import {PlaybackStatus} from "../protocol/playback.status";
import {EnumMediaStatus} from "../type/enum.media.status";
import {Media} from "./media";

/**
 * Media Controller for Images
 */
export class ImageMedia extends Media {

    /**
     * Return get playback Status
     * @returns {PlaybackStatus} - Play back Status
     */
    public getPlaybackStatus(): PlaybackStatus {
        // TODO: Adapt PlaybackStatus for Images ?
        return new ImagePlaybackStatus(this.mediaElement.status) as PlaybackStatus;
    }

    /**
     * Set the source of the stream
     * @param {string} src - url of the stream
     */
    public load(src: string) {
        if (src) {
            this.mediaElement.src = src;
        } else {
            this.mediaElement.src = "";
        }
    }
    /**
     * get Table of Mapping With Internal Status
     * @returns {{ended: EnumMediaStatus, error: EnumMediaStatus, timeupdate: EnumMediaStatus}}
     * @protected
     */
    protected getMediaEvents(): any {
        return {
            ended: EnumMediaStatus.BUFFERING,
            error: EnumMediaStatus.ERROR,
            load: EnumMediaStatus.PLAYING,
        };
    }
}
