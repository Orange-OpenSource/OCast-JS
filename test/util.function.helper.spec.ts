import assert = require("assert");
import chai = require("chai");
import {FunctionHelper} from "../src/util/function.helper";
const expect = chai.expect;

describe("FunctionHelper", () => {
    describe("capitalizeFirstLetter", () => {
        it("Should return a String with first letter capitalize", () => {
            assert.equal(FunctionHelper.capitalizeFirstLetter("test"), "Test");
            assert.equal(FunctionHelper.capitalizeFirstLetter("Test"), "Test");
        });
    });
    describe("getParamNames", () => {
        it("Should return a list of parameters for a function with two parameters", () => {
            let dummyFunction = (param1, param2) => {
                let dummy = true;
            };
            assert.deepEqual(FunctionHelper.getParamNames(dummyFunction), ["param1", "param2"]);
        });

        it("Should return a list of parameters for a function with two typed parameters", () => {
            let dummyFunction = (param1: string, param2: any) => {
                let dummy = true;
            };
            assert.deepEqual(FunctionHelper.getParamNames(dummyFunction), ["param1", "param2"]);
        });

        it("Should return a empty list of parameters for a function without parameters", () => {
            let dummyFunction = () => {
                let dummy = true;
            };
            assert.deepEqual(FunctionHelper.getParamNames(dummyFunction), []);
        });
    });
});
