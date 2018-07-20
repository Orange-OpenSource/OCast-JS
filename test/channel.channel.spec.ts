import {Channel} from "../src/channel/channel";
import {OCast} from "../src/index";
import {EnumError} from "../src/type/enum.error";
import {Logger} from "../src/util/logger";

import d2r = require("ocast-dongletv");
import assert = require("assert");
import chai = require("chai");
import os = require("os");
import util = require("util");

const expect = chai.expect;

import WebSocket = require("ws");
global.WebSocket = WebSocket;

const broker = d2r.broker;
const client = d2r.client;

let ocast: OCast = new OCast({
    webSocketPort: 4434,
    webSocketProtocol: "ws://"
});

const Log: Logger = Logger.getInstance();

describe("Channel", () => {
    before(() => {
        broker.init();
        ocast.start();

    });

    after(() => {
        broker.stop();
    });

    it("Should return unknown namespace if channel not created", () => {
        let testPromise = new Promise((resolve, reject) => {
            client.sendMessage({cmd: "test"}, "com.orange.sample", resolve);
        });
        return testPromise.then((result) => {
            let hostname = os.hostname();
            const expected: string = '{"dst":"' + hostname + '","src":"browser",' +
                '"type":"reply","id":1,"message":{"service":"com.orange.sample","data":{"params":{"code":2404}}}}';
            expect(result).to.equal(expected);
        });
    });
    it("Should return receive a reply from a custom channel", () => {
        let channel: Channel = ocast.createChannel("com.orange.sample2");
        let testPromise = new Promise((resolve, reject) => {
            client.sendMessage({cmd: "test"}, "com.orange.sample2", resolve);
        });
        return testPromise.then((result) => {
            let hostname = os.hostname();
            const expected: string = '{"dst":"' + hostname + '","src":"browser",' +
                '"type":"reply","id":2,"status":"OK",' +
                '"message":{"service":"com.orange.sample2","data":{"params":{"code":2400}}}}';
            expect(result).to.equal(expected);
        });
    });
    it("Should return receive a reply from a custom channel", () => {
        let channel: Channel = ocast.createChannel("com.orange.sample");
        channel.onMessage = function (transportMessage) {
            this.sendReply(transportMessage.id, transportMessage.src, {params: {code: EnumError.OK}});
        };
        let testPromise = new Promise((resolve, reject) => {
            client.sendMessage({cmd: "test"}, "com.orange.sample", resolve);
        });
        return testPromise.then((result) => {
            let hostname = os.hostname();
            const expected: string = '{"dst":"' + hostname + '","src":"browser",' +
                '"type":"reply","id":3,"status":"OK",' +
                '"message":{"service":"com.orange.sample","data":{"params":{"code":0}}}}';
            expect(result).to.equal(expected);
        });
    });
});

