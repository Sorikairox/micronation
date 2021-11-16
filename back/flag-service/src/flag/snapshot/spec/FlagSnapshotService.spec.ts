import { ObjectId } from 'mongodb';
import { FlagSnapshotRepository } from '../FlagSnapshotRepository';
import { FlagSnapshotService } from "../FlagSnapshotService";
import { FlagSnapshotPixelService } from '../pixel/FlagSnapshotPixelService';

describe(FlagSnapshotService.name, () => {
  const flagSnapshotRepository = new FlagSnapshotRepository(undefined);
  const snapshotPixelService = new FlagSnapshotPixelService(null);
  const flagSnapshotService = new FlagSnapshotService(flagSnapshotRepository, null, null, snapshotPixelService);

  describe(FlagSnapshotService.prototype.createNewEmptySnapshot, () => {
    let repositoryCreateWatcher;
    let snapshot;
    beforeAll(async () => {
      repositoryCreateWatcher = jest.spyOn(flagSnapshotRepository, 'createAndReturn')
        .mockImplementation(async (flagSnapshotData) => flagSnapshotData);
      snapshot = await flagSnapshotService.createNewEmptySnapshot(42);
    });

    it('calls ' + FlagSnapshotRepository.prototype.createAndReturn + ' once', async () => {
      expect(repositoryCreateWatcher).toHaveBeenCalledTimes(1);
    });

    it('returns the snapshot', () => {
      expect(snapshot.lastEventId).toBe(42);
      expect(snapshot.complete).toBe(false);
      expect(snapshot.pixels).toBe(undefined);
    });
  });

  describe(FlagSnapshotService.prototype.createSnapshot, () => {
    let serviceCreateSnapshotWatcher;
    beforeAll(async () => {
      jest.spyOn(flagSnapshotService, 'getPixelsForSnapshot')
        .mockImplementation(async () => []);
      serviceCreateSnapshotWatcher = jest.spyOn(flagSnapshotService, 'createNewEmptySnapshot')
        .mockImplementation(async () => ({ _id: new ObjectId() } as any));
      jest.spyOn(snapshotPixelService, 'saveSnapshotPixels')
        .mockImplementation(async () => ({} as any));
      await flagSnapshotService.createSnapshot(1);
    });

    it('calls ' + FlagSnapshotService.prototype.createNewEmptySnapshot + ' once', async () => {
      expect(serviceCreateSnapshotWatcher).toHaveBeenCalledTimes(1);
    });
  });
});
