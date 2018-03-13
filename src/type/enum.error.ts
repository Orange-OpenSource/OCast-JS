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

/**
 * Enum for error values.
 * @readonly
 * @enum {number}
 */
export enum EnumError {
    /** OK Value */
    OK = 0,
    /** The message cannot be proceed by the application, not the receiver for this namespace */
    INVALID_NAMESPACE = 2404,
    /** In the namespace org.ocast.media, the command is not implemented by the application */
    NO_IMPLEMENTATION = 2400,
    /** Invalid Track */
    INVALID_TRACK = 2414,
    /** Parameter are missing */
    PARAMS_MISSING = 2422,
    /** The command cannot be performed according to the player state */
    PLAYER_INVALID_STATE = 2412,
    /** The command cannot be performed according to the player state */
    NO_PLAYER_INITIALIZED = 2413,
    /** The mediaType is not known */
    UNKNOWN_MEDIA_TYPE = 2415,
    /** The tranferMode is not known */
    UNKNOWN_TRANSFER_MODE = 2006,
    /** Internal Error, please send details on the tracker */
    UNKNOWN_ERROR = 2500,
    /** In the namespace org.ocast.media, the command is not implemented by the application */
    IMPLEMENTATION_ERROR = 2400,
}
