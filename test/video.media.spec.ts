import { VideoMedia } from "../src";
import chai = require("chai");
import { Metadata } from "../src/protocol/metadata";

const expect = chai.expect;

describe("VideoMedia", () => {

    let videoMedia: VideoMedia = null;
    let mediaElement: any = null;
    before(() => {
        mediaElement = {};
        videoMedia = new VideoMedia(mediaElement, null);
    });

    it("When VideoMedia take partial metadatas, it give metadatas corrects => Check audio tracks", () => {
        videoMedia.setMetadata(null, null, null, null, null);
        mediaElement.audioTracks = [
            {
                enabled: true,
                label: "English",
                language: "en",
            },
            {
                enabled: false,
                language: "fr",
            },
            {
                // No data
            },
        ];
        const metadatas: Metadata = videoMedia.getMedatadata();
        expect(metadatas.audioTracks.length).to.equals(3, "Check how many audio tracks have been restitued");
        if (metadatas.audioTracks.length === 3) {
            // Don't execute next tests if length is bad!
            expect(metadatas.audioTracks[0].enabled).to.equals(true, "Check enabled field for the first audio track");
            expect(metadatas.audioTracks[0].label).to.equals("English", "Check label field for the first audio track");
            expect(metadatas.audioTracks[0].language).to.equals("en",
                "Check language field for the first audio track");

            expect(metadatas.audioTracks[1].enabled).to.equals(false, "Check enabled field for the second audio track");
            expect(metadatas.audioTracks[1].label).to.equals("", "Check label field for the second audio track");
            expect(metadatas.audioTracks[1].language).to.equals("fr",
                "Check language field for the second audio track");

            expect(metadatas.audioTracks[2].enabled).to.equals(false, "Check enabled field for the third audio track");
            expect(metadatas.audioTracks[2].label).to.equals("", "Check label field for the third audio track");
            expect(metadatas.audioTracks[2].language).to.equals("",
                "Check language field for the third audio track");
        }
    });

    it("When VideoMedia take partial metadatas, it give metadatas corrects => Check video tracks", () => {
        videoMedia.setMetadata(null, null, null, null, null);
        mediaElement.videoTracks = [
            {
                label: "English",
                language: "en",
                selected: true,
            },
            {
                language: "fr",
                selected: false,
            },
            {
                // No data
            },
        ];
        const metadatas: Metadata = videoMedia.getMedatadata();
        expect(metadatas.videoTracks.length).to.equals(3, "Check how many video tracks have been restitued");
        if (metadatas.videoTracks.length === 3) {
            // Don't execute next tests if length is bad!
            expect(metadatas.videoTracks[0].enabled).to.equals(true, "Check enabled field for the first video track");
            expect(metadatas.videoTracks[0].label).to.equals("English", "Check label field for the first video track");
            expect(metadatas.videoTracks[0].language).to.equals("en",
                "Check language field for the first video track");

            expect(metadatas.videoTracks[1].enabled).to.equals(false, "Check enabled field for the second video track");
            expect(metadatas.videoTracks[1].label).to.equals("", "Check label field for the second video track");
            expect(metadatas.videoTracks[1].language).to.equals("fr",
                "Check language field for the second video track");

            expect(metadatas.videoTracks[2].enabled).to.equals(false, "Check enabled field for the third video track");
            expect(metadatas.videoTracks[2].label).to.equals("", "Check label field for the third video track");
            expect(metadatas.videoTracks[2].language).to.equals("",
                "Check language field for the third video track");
        }
    });

    it("When VideoMedia take partial metadatas, it give metadatas corrects => Check text tracks", () => {
        videoMedia.setMetadata(null, null, null, null, null);
        mediaElement.textTracks = [
            {
                label: "English",
                language: "en",
                mode: "showing",
            },
            {
                language: "fr",
                mode: "toto",
            },
            {
                // No data
            },
        ];
        const metadatas: Metadata = videoMedia.getMedatadata();
        expect(metadatas.textTracks.length).to.equals(3, "Check how many text tracks have been restitued");
        if (metadatas.textTracks.length === 3) {
            // Don't execute next tests if length is bad!
            expect(metadatas.textTracks[0].enabled).to.equals(true, "Check enabled field for the first text track");
            expect(metadatas.textTracks[0].label).to.equals("English", "Check label field for the first text track");
            expect(metadatas.textTracks[0].language).to.equals("en",
                "Check language field for the first text track");

            expect(metadatas.textTracks[1].enabled).to.equals(false, "Check enabled field for the second text track");
            expect(metadatas.textTracks[1].label).to.equals("", "Check label field for the second text track");
            expect(metadatas.textTracks[1].language).to.equals("fr",
                "Check language field for the second text track");

            expect(metadatas.textTracks[2].enabled).to.equals(false, "Check enabled field for the third text track");
            expect(metadatas.textTracks[2].label).to.equals("", "Check label field for the third text track");
            expect(metadatas.textTracks[2].language).to.equals("",
                "Check language field for the third text track");
        }
    });
});
