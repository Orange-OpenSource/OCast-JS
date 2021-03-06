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

import {EnumTransport} from "../type/enum.transport";
import {TransportMessage} from "./transport.message";

/**
 * Transport Class
 */
export class Transport {
    public static WILDCARD: string = "*";
    public static UUID: string = "browser";

    private status: string;

    /**
     * Constructor
     * @param src
     * @param dst
     * @param type
     * @param id
     * @param message
     */
    constructor(public src: string,
                public dst: string,
                public type: EnumTransport,
                public id: number,
                public message: TransportMessage) {

    }

    /**
     * Set status of message ( OK or Error Message )
     * @param {string} status
     */
    public setStatus(status: string) {
        this.status = status;
    }

}
