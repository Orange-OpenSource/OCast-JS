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
import { Metadata } from "../protocol/metadata";
import { PlaybackStatus } from "../protocol/playback.status";
import { Track } from "../protocol/track";
import { EnumError } from "../type/enum.error";
import { EnumMedia } from "../type/enum.media";
import { EnumMediaStatus } from "../type/enum.media.status";
import { EnumTrack } from "../type/enum.track";
import { EnumTransferMode } from "../type/enum.transfermode";
import { Logger } from "../util/logger";
import { Media } from "./media";
import { VideoPlaybackStatus } from "./video.playback.status";

const TAG: string = " [VideoMedia] ";
const Log: Logger = Logger.getInstance();
/**
 * Media Controller for Audio/Video
 */
export class VideoMedia extends Media {
  /**
   * Get Media Player Status
   * @returns {PlaybackStatus}
   */
  public getPlaybackStatus(): PlaybackStatus {
    return new VideoPlaybackStatus(
      this.mediaElement.status,
      this.mediaElement.volume,
      this.mediaElement.muted,
      this.mediaElement.currentTime,
      this.mediaElement.duration,
    ) as PlaybackStatus;
  }

  /** set metadata
   * @param title
   * @param subtitle
   * @param logo
   * @param mediaType
   * @param transferMode
   * @param subtitleTracks
   * @param audioTracks
   */
  public setMetadata(
    title: string,
    subtitle: string,
    logo: string,
    mediaType: EnumMedia,
    transferMode: EnumTransferMode,
  ) {
    this.metadata = new Metadata(
      title,
      subtitle,
      logo,
      mediaType,
      transferMode,
    );
  }

  public getMedatadata(): Metadata {
    this.updateTracks();
    return this.metadata;
  }

  public setTrack(
    type: EnumTrack,
    trackId: string,
    enabled: boolean,
  ): EnumError {
    let status = this.getStatus();
    let mediaVideo: any = this.mediaElement;
    let i: number = 0;
    if (
      status === EnumMediaStatus.BUFFERING ||
      status === EnumMediaStatus.PLAYING ||
      status === EnumMediaStatus.PAUSED
    ) {
      try {
        let id = parseFloat(trackId);
        switch (type) {
          case EnumTrack.AUDIO:
            for (i = 0; i < mediaVideo.audioTracks.length; i++) {
              mediaVideo.audioTracks[i].enabled = !enabled;
            }
            mediaVideo.audioTracks[id].enabled = enabled;
            break;
          case EnumTrack.VIDEO:
            for (i = 0; i < mediaVideo.videoTracks.length; i++) {
              mediaVideo.videoTracks[i].selected = !enabled;
            }
            mediaVideo.videoTracks[id].selected = enabled;
            break;
          case EnumTrack.TEXT:
            for (i = 0; i < mediaVideo.textTracks.length; i++) {
              mediaVideo.textTracks[i].mode = enabled ? "disabled" : "showing";
            }
            mediaVideo.textTracks[id].mode = enabled ? "showing" : "disabled";
            break;
          default:
            return EnumError.INVALID_TRACK;
        }
        return EnumError.OK;
      } catch (e) {
        Log.warn(TAG + "setTrack error : ", e);
        return EnumError.INVALID_TRACK;
      }
    } else {
      return EnumError.PLAYER_INVALID_STATE;
    }
  }
  public seek(position): EnumError {
    let status = this.getStatus();
    if (
      status !== EnumMediaStatus.BUFFERING &&
      status !== EnumMediaStatus.PLAYING &&
      status !== EnumMediaStatus.PAUSED
    ) {
      return EnumError.PLAYER_INVALID_STATE;
    }
    this.mediaElement.currentTime = position;
    return EnumError.OK;
  }

  public setVolume(level: number): EnumError {
    let status = this.getStatus();
    if (
      status !== EnumMediaStatus.PLAYING &&
      status !== EnumMediaStatus.PAUSED
    ) {
      return EnumError.PLAYER_INVALID_STATE;
    }
    this.mediaElement.volume = level;
    return EnumError.OK;
  }

  public setMute(mute: boolean): EnumError {
    let status = this.getStatus();
    if (
      status !== EnumMediaStatus.PLAYING &&
      status !== EnumMediaStatus.PAUSED
    ) {
      return EnumError.PLAYER_INVALID_STATE;
    }
    this.mediaElement.muted = mute;
    return EnumError.OK;
  }

  public pause(): EnumError {
    let status = this.getStatus();
    if (
      status !== EnumMediaStatus.BUFFERING &&
      status !== EnumMediaStatus.PLAYING
    ) {
      return EnumError.PLAYER_INVALID_STATE;
    }
    this.mediaElement.pause();
    return EnumError.OK;
  }

  public resume(): EnumError {
    let status = this.getStatus();
    if (status !== EnumMediaStatus.PAUSED) {
      return EnumError.PLAYER_INVALID_STATE;
    }
    this.mediaElement.play();
    return EnumError.OK;
  }
  /**
   * Set the source of the stream
   * @param {string} src - url of the stream
   */
  public load(src: string, autoplay?: boolean) {
    this.addListeners();
    if (autoplay !== undefined) {
      this.mediaElement.autoplay = autoplay;
    }
    if (src) {
      this.mediaElement.src = src;
    } else {
      this.mediaElement.pause();
      this.mediaElement.src = "";
      this.mediaElement.load();
    }
  }

  /**
   * get is Live Status
   * @returns {boolean}
   */
  get isLive(): boolean {
    return this.metadata.transferMode === EnumTransferMode.STREAMED;
  }

  /**
   * return Mapping with internal Values
   * @returns {{abort: EnumMediaStatus, ended: EnumMediaStatus, error: EnumMediaStatus, loadstart: EnumMediaStatus,
   * pause: EnumMediaStatus, playing: EnumMediaStatus, seeking: EnumMediaStatus, timeupdate: EnumMediaStatus}}
   * @protected
   */
  protected getMediaEvents() {
    return {
      abort: EnumMediaStatus.IDLE,
      ended: EnumMediaStatus.IDLE,
      error: EnumMediaStatus.UNKNOWN,
      loadstart: EnumMediaStatus.BUFFERING,
      pause: EnumMediaStatus.PAUSED,
      playing: EnumMediaStatus.PLAYING,
      seeking: EnumMediaStatus.BUFFERING,
      timeupdate: EnumMediaStatus.PLAYING,
    };
  }
  protected onUpdateMetadata(event): void {
    if (!this.mediaElement) {
      Log.warn("MediaElement is null, ignore event (" + event.type + ")");
      return;
    }
    if (!this.metadata) {
      Log.warn("Metadata is null !!! ( implementation error )");
      return;
    }

    if (
      !(
        this.mediaElement.audioTracks &&
        this.mediaElement.videoTracks &&
        this.mediaElement.textTracks
      )
    ) {
      Log.warn("Tracks not implemented !!! ( implementation error )");
      return;
    }
    let signature: string = JSON.stringify(this.metadata);
    this.updateTracks();
    if (JSON.stringify(this.metadata) !== signature) {
      this.mediaChannel.onUpdateMetadata(this.getMedatadata());
    }
  }

  private updateTracks() {
    // Catch AudioTracks
    let i = 0;
    let tracks;
    tracks = [];
    // TODO: Refactor this code (redundancy)
    let audioTracks = this.mediaElement.audioTracks;
    if (audioTracks) {
      for (i = 0; i < audioTracks.length; i++) {
        tracks.push(
          new Track(
            EnumTrack.AUDIO,
            i.toString(),
            audioTracks[i].enabled,
            audioTracks[i].language,
            audioTracks[i].label,
          ),
        );
      }
      this.metadata.audioTracks = tracks;
    }
    // Catch VideoTracks
    tracks = [];
    let videoTracks = this.mediaElement.videoTracks;
    if (videoTracks) {
      for (i = 0; i < videoTracks.length; i++) {
        tracks.push(
          new Track(
            EnumTrack.VIDEO,
            i.toString(),
            videoTracks[i].selected,
            videoTracks[i].language,
            videoTracks[i].label,
          ),
        );
      }
      this.metadata.videoTracks = tracks;
    }
    // Catch TextTracks
    tracks = [];
    let textTracks = this.mediaElement.textTracks;
    if (textTracks) {
      for (i = 0; i < textTracks.length; i++) {
        tracks.push(
          new Track(
            EnumTrack.TEXT,
            i.toString(),
            textTracks[i].mode === "showing",
            textTracks[i].language,
            textTracks[i].label,
          ),
        );
      }
      this.metadata.textTracks = tracks;
    }
  }
}
