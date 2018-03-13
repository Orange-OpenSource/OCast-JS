import {Logger} from "../../src/util/logger";
import {Player} from "./player";

let Log: Logger = Logger.getInstance();
const TAG: string = " [VideoPlayer] ";

export class VideoPlayer extends Player {

    public static PLAYING: string = "playing";
    public static PAUSED: string = "pause";

    public set src(source: string) {
        this.dispatchEvent(VideoPlayer.PLAYING);
    }

    public pause(): void {
        /**
         * Dummy Function
         */
        this.dispatchEvent(VideoPlayer.PAUSED);
    }

    public play(): void {
        /**
         * Dummy Function
         */
    }

    public load(): void {
        /**
         * Dummy Function
         */
    }

    public get audioTracks() {
        return [{enabled: true, label: "#1-fr", language: "fr"}];
    }

    public get textTracks() {
        return [{mode: "showing", label: "#1-fr", language: "fr"}];
    }

    public get videoTracks() {
        return [{selected: true, label: "#1-fr", language: "fr"}];
    }

    protected getMediaEvents(): any {
        return {
            PAUSED: "pause",
            PLAYING: "playing",
        };
    }
}