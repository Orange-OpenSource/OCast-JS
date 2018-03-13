import {Logger} from "../src/util/logger";

import assert = require("assert");
import chai = require("chai");
const expect = chai.expect;

describe("Logger", () => {
    it("Should return a non null Logger", () => {
        assert.ok(Logger.getInstance() instanceof Logger);
    });
    it("Should not write a log when setting Logger.NONE", () => {
        let Log = Logger.getInstance();
        Log.setDebugLevel(Logger.NONE);
        assert.ok(Log.debug("test debug") === false);
        assert.ok(Log.info("test info") === false);
        assert.ok(Log.warn("test warn") === false);
        assert.ok(Log.error("test error") === false);
    });
    it("Should write a debug log", () => {
        let Log = Logger.getInstance();
        Log.setDebugLevel(Logger.DEBUG);
        assert.ok(Log.debug("test") === undefined);
    });
    it("Should write a info log", () => {
        let Log = Logger.getInstance();
        Log.setDebugLevel(Logger.INFO);
        assert.ok(Log.info("test") === undefined);
    });
    it("Should write a warning log", () => {
        let Log = Logger.getInstance();
        Log.setDebugLevel(Logger.WARN);
        assert.ok(Log.warn("test") === undefined);
    });
    it("Should write a error log", () => {
        let Log = Logger.getInstance();
        Log.setDebugLevel(Logger.ERROR);
        assert.ok(Log.error("test") === undefined);
    });
});
