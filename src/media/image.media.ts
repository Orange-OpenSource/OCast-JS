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

import { ImagePlaybackStatus } from "../media/image.playback.status";
import { Metadata } from "../protocol/metadata";
import { PlaybackStatus } from "../protocol/playback.status";
import { EnumMedia } from "../type/enum.media";
import { EnumMediaStatus } from "../type/enum.media.status";
import { EnumTransferMode } from "../type/enum.transfermode";
import { Media } from "./media";

/**
 * Media Controller for Images
 */
export class ImageMedia extends Media {
  /**
   * Return get playback Status
   * @returns {PlaybackStatus} - Play back Status
   */
  public getPlaybackStatus(): PlaybackStatus {
    // TODO: Adapt PlaybackStatus for Images ?
    return new ImagePlaybackStatus(this.mediaElement.status) as PlaybackStatus;
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
    // TODO: Adapt metadata for Images ?
    this.metadata = new Metadata(
      title,
      subtitle,
      logo,
      mediaType,
      transferMode,
    );
  }

  public getMedatadata(): Metadata {
    return this.metadata;
  }
  /**
   * Set the source of the stream
   * @param {string} src - url of the stream
   */
  public load(src: string) {
    this.addListeners();
    if (src) {
      this.mediaElement.src = src;
    } else {
      this.mediaElement.src = "";
    }
  }
  /**
   * get Table of Mapping With Internal Status
   * @returns {{ended: EnumMediaStatus, error: EnumMediaStatus, timeupdate: EnumMediaStatus}}
   * @protected
   */
  protected getMediaEvents(): any {
    return {
      ended: EnumMediaStatus.BUFFERING,
      error: EnumMediaStatus.UNKNOWN,
      load: EnumMediaStatus.PLAYING,
    };
  }
}
