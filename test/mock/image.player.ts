import {Logger} from "../../src/util/logger";
import {Player} from "./player";

let Log: Logger = Logger.getInstance();
const TAG: string = " [ImagePlayer] ";

export class ImagePlayer extends Player {

    /**
     * get Table of Mapping With Internal Status
     * @returns {{ended: EnumMediaStatus, error: EnumMediaStatus, timeupdate: EnumMediaStatus}}
     * @protected
     */
    protected getMediaEvents(): any {
        return {
            PAUSED: "pause",
            PLAYING: "load",
        };
    }
}