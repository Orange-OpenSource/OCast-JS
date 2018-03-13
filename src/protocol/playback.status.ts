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

import {EnumMediaStatus} from "../type/enum.media.status";
/**
 * PlaybackStatus Class
 */
export class PlaybackStatus {

    /**
     * @constructor
     * @param {EnumMediaStatus} state - Media Status
     * @param {number} volume - Audio volume
     * @param {boolean} mute - Mute OnOff Value
     * @param {number} position - Current Position
     * @param {number} duration - Duration
     */
    constructor(public state: EnumMediaStatus,
                public volume: number,
                public mute: boolean,
                public position: number,
                public duration: number) {

    }
}
