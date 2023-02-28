import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { ServiceError } from '@grpc/grpc-js';

export interface Song {
  duration: number;
  title: string;
}

export interface SongRes {
  id: number;
  duration: number;
  title: string;
}

export interface SongsRes {
  songs: SongRes[];
}

export interface ResponseObject {
  status: string;
}

export class PlaylistClient {
  grpcPort: number;
  protoPath: string;
  playlistService: any;

  constructor(grpcPort: number, protoPath: string) {
    this.grpcPort = grpcPort;
    this.protoPath = protoPath;

    const packageDefinition = protoLoader.loadSync(
      this.protoPath,
      {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      });

    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
    // @ts-ignore
    this.playlistService = new protoDescriptor.playlist.PlaylistService(`0.0.0.0:${this.grpcPort}`, grpc.credentials.createInsecure());
  }

  play(callback: (error: ServiceError, response: ResponseObject) => void) {
    this.playlistService.play({}, callback);
  }

  pause(callback: (error: ServiceError, response: ResponseObject) => void) {
    this.playlistService.pause({}, callback);
  }

  next(callback: (error: ServiceError, response: ResponseObject) => void) {
    this.playlistService.next({}, callback);
  }

  prev(callback: (error: ServiceError, response: ResponseObject) => void) {
    this.playlistService.prev({}, callback);
  }

  addSong(song: Song, callback: (error: ServiceError, response: ResponseObject) => void) {
    this.playlistService.addSong({ ...song }, callback);
  }

  addSongs(songs: Song[], callback: (error: ServiceError, response: ResponseObject) => void) {
    this.playlistService.addSong({ songs: [...songs] }, callback);
  }

  async getAllSongs(callback: (error: ServiceError, response: ResponseObject) => void): Promise<SongsRes> {
    return new Promise<SongsRes>((resolve) => {
      this.playlistService.getAllSongs(callback);
    });
  }

  async getSongById(id: number, callback: (error: ServiceError, response: ResponseObject) => void): Promise<SongRes> {
    return new Promise<SongRes>((resolve) => {
      this.playlistService.getSongById({ id: id }, callback);
    });
  }

  updateSong(id: number, newSong: Song, callback: (error: ServiceError, response: ResponseObject) => void) {
    this.playlistService.updateSong({ id: id, newSong: { ...newSong } }, callback);
  }

  deleteSong(id: number, callback: (error: ServiceError, response: ResponseObject) => void) {
    this.playlistService.deleteSong({ id: id }, callback);
  }

  clear(callback: (error: ServiceError, response: ResponseObject) => void) {
    this.playlistService.clear({}, callback);
  }
}