import {MediaChannel} from "../src/channel/media.channel";
import {OCast} from "../src/index";
import {EnumError} from '../src/type/enum.error';
import {Logger} from "../src/util/logger";
import {VideoPlayer} from "./mock/video.player";

import d2r = require("ocast-dongletv");
import assert = require("assert");
import chai = require("chai");
import os = require("os");
import util = require("util");

const expect = chai.expect;

import WebSocket = require("ws");
import {EnumMedia} from "../src/type/enum.media";
import {ImagePlayer} from "./mock/image.player";


const broker = d2r.broker;
const client = d2r.client;

let ocast: OCast = new OCast();
let dummyVideoPlayer: VideoPlayer = new VideoPlayer();
let dummyImagePlayer: ImagePlayer = new ImagePlayer();
let sequenceId: number = 4;
let hostname = os.hostname();

const Log: Logger = Logger.getInstance();
Log.setDebugLevel(Logger.NONE);

const EXPECTED_MESSAGE: any = {
    dst: hostname,
    src: "browser",
    type: "reply",
    id: "id_to_changed",
    status: "OK",
    message: {
        service: "org.ocast.media",
        data: {
            name: "name_to_changed",
            params: {
                code: 0,
            }
        }
    }
};

function getExpectedReply(name, code) {
    let expectedMessage = JSON.parse(JSON.stringify(EXPECTED_MESSAGE));
    expectedMessage.id = sequenceId++;
    expectedMessage.message.data.name = name;
    expectedMessage.message.data.params.code = code;
    return JSON.stringify(expectedMessage);
}

function getExpectedStatus(status, code) {
    let expectedMessage = JSON.parse(JSON.stringify(EXPECTED_MESSAGE));
    expectedMessage.id = sequenceId++;
    expectedMessage.message.data.name = "playbackStatus";
    expectedMessage.message.data.params = { state : status,
                                            code: code };
    expectedMessage.message.data.options = null;
    return JSON.stringify(expectedMessage);
}

function getExpectedMetadata(name, mediaType, withTrack, code) {
    let expectedMessage = JSON.parse(JSON.stringify(EXPECTED_MESSAGE));
    expectedMessage.id = sequenceId++;
    expectedMessage.message.data.name = "metadataChanged";
    expectedMessage.message.data.params = {
        title: "My Title",
        subtitle: "My SubTitle",
        logo: null,
        mediaType: mediaType,
        transferMode: "buffered",
        textTracks: [],
        audioTracks: [],
        videoTracks: [],
        code : code
    };
    if (withTrack) {
        let track: any  = {
            type: "type_to_changed",
            trackId: "0",
            enabled: true,
            language: "fr",
            label: "#1-fr"
        };
        let tmpTrack = JSON.parse(JSON.stringify(track));
        tmpTrack.type = "text";
        expectedMessage.message.data.params.textTracks = [JSON.parse(JSON.stringify(tmpTrack))];
        tmpTrack.type = "audio";
        expectedMessage.message.data.params.audioTracks = [JSON.parse(JSON.stringify(tmpTrack))];
        tmpTrack.type = "video";
        expectedMessage.message.data.params.videoTracks = [JSON.parse(JSON.stringify(tmpTrack))];
    }
    expectedMessage.message.data.options = null;
    return JSON.stringify(expectedMessage);
}

describe("MediaChannel", () => {

    before(() => {
        broker.init();
        ocast.start();
    });

    after(() => {
        broker.stop();
    });

    describe("Manage player not initialized", () => {
        it("Should return player not initialized for pause", () => {
            let testPromise = new Promise( (resolve, reject)  => {
                client.pause(resolve);
            } );
            return testPromise.then((result) => {
                expect(result).to.equal(getExpectedReply("pause", EnumError.NO_PLAYER_INITIALIZED));
            });
        });
        it("Should return player not initialized for resume", () => {
            let testPromise = new Promise( (resolve, reject)  => {
                client.resume(resolve);
            } );
            return testPromise.then((result) => {
                expect(result).to.equal(getExpectedReply("resume", EnumError.NO_PLAYER_INITIALIZED));
            });
        });
        it("Should return player not initialized for seek", () => {
            let testPromise = new Promise( (resolve, reject)  => {
                client.seek(0, resolve);
            } );
            return testPromise.then((result) => {
                expect(result).to.equal(getExpectedReply("seek", EnumError.NO_PLAYER_INITIALIZED));
            });
        });
        it("Should return player not initialized for stop", () => {
            let testPromise = new Promise( (resolve, reject)  => {
                client.stop(resolve);
            } );
            return testPromise.then((result) => {
                expect(result).to.equal(getExpectedReply("stop", EnumError.NO_PLAYER_INITIALIZED));
            });
        });
        it("Should return player not initialized for close", () => {
            let testPromise = new Promise( (resolve, reject)  => {
                client.close(resolve);
            } );
            return testPromise.then((result) => {
                expect(result).to.equal(getExpectedReply("close", EnumError.NO_PLAYER_INITIALIZED));
            });
        });
        it("Should return player not initialized for track", () => {
            let testPromise = new Promise( (resolve, reject)  => {
                client.track("audio", "0", true, resolve);
            } );
            return testPromise.then((result) => {
                expect(result).to.equal(getExpectedReply("track", EnumError.NO_PLAYER_INITIALIZED));
            });
        });
    });

    describe("Manage video player", () => {
        let mediaChannel = ocast.getMediaChannel();
        mediaChannel.addVideoMediaManager([EnumMedia.VIDEO], dummyVideoPlayer);
        it("Should accept prepare url ", () => {
            let testPromise = new Promise( (resolve, reject)  => {
                client.prepare("http://example.com/video.mp4", EnumMedia.VIDEO, resolve);
            } );
            return testPromise.then((result) => {
                expect(result).to.equal(getExpectedReply("prepare", EnumError.OK));
            });
        });
        it("Should return ok to pause command", () => {
            let testPromise = new Promise( (resolve, reject)  => {
                client.pause(resolve);
            } );
            return testPromise.then((result) => {
                expect(result).to.equal(getExpectedReply("pause", EnumError.OK));
            });
        });
        it("Should return a status with tracks on getPlaybackStatus command", () => {
            let testPromise = new Promise( (resolve, reject)  => {
                client.getPlaybackStatus(resolve);
            } );
            return testPromise.then((result) => {
                let expected =
                expect(result).to.equal(getExpectedStatus("paused", EnumError.OK));
            });
        });

        // todo: Detect error
        it("Should return getMetadata command", () => {
            let testPromise = new Promise( (resolve, reject)  => {
                client.getMetadata(resolve);
            } );
            return testPromise.then((result) => {
                expect(result).to.equal(getExpectedMetadata("metadataChanged", "video", true, EnumError.OK));
            });
        });

        it("Should return ok to set audio track", () => {
            let testPromise = new Promise( (resolve, reject)  => {
                client.track("audio", "0", true, resolve);
            } );
            return testPromise.then((result) => {
                expect(result).to.equal(getExpectedReply("track", EnumError.OK));
            });
        });
        it("Should return ok to set text track", () => {
            let testPromise = new Promise( (resolve, reject)  => {
                client.track("text", "0", true, resolve);
            } );
            return testPromise.then((result) => {
                expect(result).to.equal(getExpectedReply("track", EnumError.OK));
            });
        });
        it("Should return ok to set video track", () => {
            let testPromise = new Promise( (resolve, reject)  => {
                client.track("video", "0", true, resolve);
            } );
            return testPromise.then((result) => {
                expect(result).to.equal(getExpectedReply("track", EnumError.OK));
            });
        });
        it("Should return ok to resume", () => {
            let testPromise = new Promise( (resolve, reject)  => {
                client.resume(resolve);
            } );
            return testPromise.then((result) => {
                expect(result).to.equal(getExpectedReply("resume", EnumError.OK));
            });
        });
        it("Should return ok to seek", () => {
            let testPromise = new Promise( (resolve, reject)  => {
                client.seek(100, resolve);
            } );
            return testPromise.then((result) => {
                expect(result).to.equal(getExpectedReply("seek", EnumError.OK));
            });
        });
        it("Should return ok to mute", () => {
            let testPromise = new Promise( (resolve, reject)  => {
                client.mute(true, resolve);
            } );
            return testPromise.then((result) => {
                expect(result).to.equal(getExpectedReply("mute", EnumError.OK));
            });
        });
        it("Should return ok to volume", () => {
            let testPromise = new Promise( (resolve, reject)  => {
                client.volume(0.6, resolve);
            } );
            return testPromise.then((result) => {
                expect(result).to.equal(getExpectedReply("volume", EnumError.PARAMS_MISSING));
            });
        });
        it("Should return ok to stop video", () => {
            let testPromise = new Promise( (resolve, reject)  => {
                client.stop(resolve);
            } );
            return testPromise.then((result) => {
                expect(result).to.equal(getExpectedReply("stop", EnumError.OK));
            });
        });
        it("Should return invalid state to volume", () => {
            let testPromise = new Promise( (resolve, reject)  => {
                client.volume(0.6, resolve);
            } );
            return testPromise.then((result) => {
                expect(result).to.equal(getExpectedReply("volume", EnumError.PARAMS_MISSING));
            });
        });
        it("Should return invalide state to mute", () => {
            let testPromise = new Promise( (resolve, reject)  => {
                client.mute(true, resolve);
            } );
            return testPromise.then((result) => {
                expect(result).to.equal(getExpectedReply("mute", EnumError.PLAYER_INVALID_STATE));
            });
        });
        it("Should return invalide state to pause", () => {
            let testPromise = new Promise( (resolve, reject)  => {
                client.pause(resolve);
            } );
            return testPromise.then((result) => {
                expect(result).to.equal(getExpectedReply("pause", EnumError.PLAYER_INVALID_STATE));
            });
        });
        it("Should return invalide state to resume", () => {
            let testPromise = new Promise( (resolve, reject)  => {
                client.resume(resolve);
            } );
            return testPromise.then((result) => {
                expect(result).to.equal(getExpectedReply("resume", EnumError.PLAYER_INVALID_STATE));
            });
        });
        it("Should return invalide state to seek", () => {
            let testPromise = new Promise( (resolve, reject)  => {
                client.seek(600, resolve);
            } );
            return testPromise.then((result) => {
                expect(result).to.equal(getExpectedReply("seek", EnumError.PLAYER_INVALID_STATE));
            });
        });
    });
    describe("Manage image player", () => {
        let mediaChannel = ocast.getMediaChannel();
        mediaChannel.addImageMediaManager([EnumMedia.IMAGE], dummyImagePlayer);
        it("Should accept prepare url ", () => {
            let testPromise = new Promise( (resolve, reject)  => {
                client.prepare("http://example.com/test.gif", EnumMedia.IMAGE, resolve);
            } );
            return testPromise.then((result) => {
                expect(result).to.equal(getExpectedReply("prepare", EnumError.OK));
            });
        });
        it("Should return getMetadata command", () => {
            let testPromise = new Promise( (resolve, reject)  => {
                client.getMetadata(resolve);
            } );
            return testPromise.then((result) => {
                expect(result).to.equal(getExpectedMetadata("pause", "image", false, EnumError.OK));
            });
        });

        it("Should return not implemented to pause command", () => {
            let testPromise = new Promise( (resolve, reject)  => {
                client.pause(resolve);
            } );
            return testPromise.then((result) => {
                expect(result).to.equal(getExpectedReply("pause", EnumError.NO_IMPLEMENTATION));
            });
        });
        it("Should return player invalid state to resume command", () => {
            let testPromise = new Promise( (resolve, reject)  => {
                client.resume(resolve);
            } );
            return testPromise.then((result) => {
                expect(result).to.equal(getExpectedReply("resume", EnumError.PLAYER_INVALID_STATE));
            });
        });
        it("Should return not implemented to track command", () => {
            let testPromise = new Promise( (resolve, reject)  => {
                client.track("text", "0", true, resolve);
            } );
            return testPromise.then((result) => {
                expect(result).to.equal(getExpectedReply("track", EnumError.NO_IMPLEMENTATION));
            });
        });
        it("Should return not implemented to seek", () => {
            let testPromise = new Promise( (resolve, reject)  => {
                client.seek(100, resolve);
            } );
            return testPromise.then((result) => {
                expect(result).to.equal(getExpectedReply("seek", EnumError.NO_IMPLEMENTATION));
            });
        });
        it("Should return not implemented to mute", () => {
            let testPromise = new Promise( (resolve, reject)  => {
                client.mute(true, resolve);
            } );
            return testPromise.then((result) => {
                expect(result).to.equal(getExpectedReply("mute", EnumError.NO_IMPLEMENTATION));
            });
        });
        it("Should return not implemented to volume", () => {
            let testPromise = new Promise( (resolve, reject)  => {
                client.volume(0.6, resolve);
            } );
            return testPromise.then((result) => {
                expect(result).to.equal(getExpectedReply("volume", EnumError.PARAMS_MISSING));
            });
        });
        it("Should return ok to stop image", () => {
            let testPromise = new Promise( (resolve, reject)  => {
                client.stop(resolve);
            } );
            return testPromise.then((result) => {
                expect(result).to.equal(getExpectedReply("stop", EnumError.OK));
            });
        });
        it("Should return invalid state for resume command", () => {
            let testPromise = new Promise( (resolve, reject)  => {
                client.resume(resolve);
            } );
            return testPromise.then((result) => {
                expect(result).to.equal(getExpectedReply("resume", EnumError.PLAYER_INVALID_STATE));
            });
        });

    });
});