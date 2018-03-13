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

import {EnumMedia} from "../type/enum.media";
import {EnumTrack} from "../type/enum.track";
import {EnumTransferMode} from "../type/enum.transfermode";
import {Track} from "./track";

/**
 * Metadata Root Object
 */
export class Metadata {

    public textTracks: Track[];
    public audioTracks: Track[];
    public videoTracks: Track[];
    /**
     *
     * @param {string} title
     * @param {string} subtitle
     * @param {string} logo
     * @param {EnumMedia} mediaType
     * @param {EnumTransferMode} transferMode
     */
    constructor(public title: string,
                public subtitle: string,
                public logo: string,
                public mediaType: EnumMedia,
                public transferMode: EnumTransferMode) {
        this.textTracks = [];
        this.audioTracks = [];
        this.videoTracks = [];
    }
}
