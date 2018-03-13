import {Logger} from "../../src/util/logger";

let Log: Logger = Logger.getInstance();
const TAG: string = " [Player] ";

export abstract class Player {

    private listeners: any = [];

    public addEventListener(event: string, listener: any): void {
        /**
         * Dummy Function
         */
        this.listeners[event] = listener;
    }

    public removeEventListener(event: string, listener: any): void {
        /**
         * Dummy Function
         */
    }

    public set src(source: string) {
        this.dispatchEvent(this.getMediaEvents().PLAYING);
    }

    /**
     * get Table of Mapping With Internal Status
     * @returns {{ended: EnumMediaStatus, error: EnumMediaStatus, timeupdate: EnumMediaStatus}}
     * @protected
     */
    protected abstract getMediaEvents(): any;

    protected dispatchEvent(eventType: string) {
        if (this.listeners.hasOwnProperty(eventType)) {
            let event: any = {};
            event.type = eventType;
            Log.debug(TAG + "Dispatch Event : " + eventType);
            this.listeners[eventType](event);
        } else {
            Log.warn(TAG + "Unknown Event : " + eventType);
        }
    }
}