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

import {EnumTrack} from "../type/enum.track";
/**
 * Track Class ( Audio / Video /Text)
 */
export class Track {

    /**
     * Track Constructor
     * @param type
     * @param trackId
     * @param enabled
     * @param language
     * @param label
     */
    constructor(public type: EnumTrack, public trackId: string, public enabled: boolean,
                public language: string, public label: string) {
    }
}
