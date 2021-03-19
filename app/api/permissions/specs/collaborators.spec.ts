import { testingDB } from 'api/utils/testing_db';
import { fixtures, groupA, groupB, userA, userB } from 'api/permissions/specs/fixtures';
import { collaborators } from 'api/permissions/collaborators';
import { PermissionType } from 'shared/types/permissionSchema';

describe('collaborators', () => {
  beforeEach(async () => {
    await testingDB.clearAllAndLoad(fixtures);
  });

  describe('search', () => {
    describe('matched user', () => {
      function assertUserAsCollaborator(actualContributor: any, expectedContributor: any) {
        expect(actualContributor).toEqual({
          refId: expectedContributor._id,
          label: expectedContributor.username,
          type: PermissionType.USER,
        });
      }

      it('should return exact insensitive case matched by the username', async () => {
        const availableCollaborators = await collaborators.search('userB');
        assertUserAsCollaborator(availableCollaborators[0], userB);
      });

      it('should return exact matched by the email of the user', async () => {
        const availableCollaborators = await collaborators.search('usera@domain.org');
        assertUserAsCollaborator(availableCollaborators[0], userA);
      });
    });

    describe('not matched user', () => {
      it('should return all groups that start with the searchTerm', async () => {
        const availableCollaborators = await collaborators.search('user1');
        expect(availableCollaborators.length).toBe(1);
        expect(availableCollaborators[0]).toEqual({
          refId: groupB._id.toString(),
          label: groupB.name,
          type: PermissionType.GROUP,
        });
      });

      it('should return all existing groups', async () => {
        const availableCollaborators = await collaborators.search('User');
        expect(availableCollaborators[0]).toEqual({
          refId: groupB._id.toString(),
          label: groupB.name,
          type: PermissionType.GROUP,
        });
        expect(availableCollaborators[1]).toEqual({
          refId: groupA._id.toString(),
          label: groupA.name,
          type: PermissionType.GROUP,
        });
      });
    });
  });
});