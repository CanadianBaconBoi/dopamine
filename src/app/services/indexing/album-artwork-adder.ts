import { Injectable } from '@angular/core';
import { Logger } from '../../core/logger';
import { AlbumData } from '../../data/album-data';
import { AlbumArtwork } from '../../data/entities/album-artwork';
import { Track } from '../../data/entities/track';
import { BaseAlbumArtworkRepository } from '../../data/repositories/base-album-artwork-repository';
import { BaseTrackRepository } from '../../data/repositories/base-track-repository';
import { FileMetadata } from '../../metadata/file-metadata';
import { FileMetadataFactory } from '../../metadata/file-metadata-factory';
import { AlbumArtworkCacheId } from '../album-artwork-cache/album-artwork-cache-id';
import { BaseAlbumArtworkCacheService } from '../album-artwork-cache/base-album-artwork-cache.service';
import { AlbumArtworkGetter } from './album-artwork-getter';

@Injectable()
export class AlbumArtworkAdder {
    constructor(
        private albumArtworkCacheService: BaseAlbumArtworkCacheService,
        private albumArtworkRepository: BaseAlbumArtworkRepository,
        private trackRepository: BaseTrackRepository,
        private fileMetadataFactory: FileMetadataFactory,
        private logger: Logger,
        private albumArtworkGetter: AlbumArtworkGetter
    ) {
    }

    public async addAlbumArtworkForTracksThatNeedAlbumArtworkIndexingAsync(): Promise<void> {
        try {
            const albumDataThatNeedsIndexing: AlbumData[] = this.trackRepository.getAlbumDataThatNeedsIndexing();
            this.logger.info(
                `Found ${albumDataThatNeedsIndexing.length} album data that needs indexing`,
                'AlbumArtworkAdder',
                'addAlbumArtworkForTracksThatNeedAlbumArtworkIndexingAsync');

            for (const albumData of albumDataThatNeedsIndexing) {
                try {
                    await this.addAlbumArtworkAsync(albumData.albumKey);
                } catch (e) {
                    this.logger.error(
                        `Could not add album artwork for albumKey=${albumData.albumKey}. Error: ${e.message}`,
                        'AlbumArtworkAdder',
                        'addAlbumArtworkForTracksThatNeedAlbumArtworkIndexingAsync');
                }
            }
        } catch (e) {
            this.logger.info(
                `Could not add album artwork for tracks that need album artwork indexing. Error: ${e.message}`,
                'AlbumArtworkAdder',
                'addAlbumArtworkForTracksThatNeedAlbumArtworkIndexingAsync'
            );
        }
    }

    private async addAlbumArtworkAsync(albumKey: string): Promise<void> {
        const track: Track = this.trackRepository.getLastModifiedTrackForAlbumKeyAsync(albumKey);

        if (track == undefined) {
            return;
        }

        const fileMetadata: FileMetadata = await this.fileMetadataFactory.createReadOnlyAsync(track.path);
        const albumArtwork: Buffer = await this.albumArtworkGetter.getAlbumArtworkAsync(fileMetadata);

        if (albumArtwork == undefined) {
            return;
        }

        const albumArtworkCacheId: AlbumArtworkCacheId =
            await this.albumArtworkCacheService.addArtworkDataToCacheAsync(albumArtwork);

        if (albumArtworkCacheId == undefined) {
            return;
        }

        await this.trackRepository.disableNeedsAlbumArtworkIndexingAsync(albumKey);
        const newAlbumArtwork: AlbumArtwork = new AlbumArtwork(albumKey, albumArtworkCacheId.id);
        this.albumArtworkRepository.addAlbumArtwork(newAlbumArtwork);
    }
}
