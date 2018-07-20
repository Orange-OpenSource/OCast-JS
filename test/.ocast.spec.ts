import {Channel} from "../src/channel/channel";
import {MediaChannel} from "../src/channel/media.channel";
import {WebappChannel} from "../src/channel/webapp.channel";
import {OCast} from "../src/index";
import {Logger} from "../src/util/logger";
import {VideoPlayer} from "./mock/video.player";

import d2r = require("ocast-dongletv");
import assert = require("assert");
import chai = require("chai");
import os = require("os");
import util = require("util");

const expect = chai.expect;

import WebSocket = require("ws");
global['WebSocket'] = WebSocket;

const broker = d2r.broker;
const client = d2r.client;

let ocast: OCast = new OCast({
    webSocketPort: 4434,
    webSocketProtocol: "ws://",
});
let dummyVideoPlayer: VideoPlayer = new VideoPlayer();

const Log: Logger = Logger.getInstance();
Log.setDebugLevel(Logger.NONE);

// Todo: Refactor test cases

describe("OCast", () => {
    before(() => {
        broker.init();
    });

    after(() => {
        broker.stop();
    });

    it("Should return connected after start", () => {
        let testPromise = new Promise( (resolve, reject)  => {
            client.listen(resolve);
            ocast.start();
        } );
        return testPromise.then((result) => {
            expect(result).to.equal('{"dst":"*","src":"browser","type":"event","id":1,' +
                                    '"message":{"service":"org.ocast.webapp",' +
                                    '"data":{"name":"connectionStatus","params":{"status":"connected"}}}}');
        });
    });

    it("Should return a non null mediaChannel", () => {
        assert.equal(true, ocast.getMediaChannel() !== null);
        assert.equal(true, ocast.getMediaChannel() instanceof MediaChannel);
    });

    it("Should return a non null webappChannel", () => {
        let webappChannel: any = ocast.getWebappChannel();
        assert.equal(true, webappChannel !== null);
        assert.equal(true, webappChannel instanceof WebappChannel);
    });

    it("Should return a non null CustomChannel", () => {
        assert.equal(true, ocast.createChannel("mychannel") !== null);
        assert.equal(true, ocast.getChannel("mychannel") instanceof Channel);
    });
});