import insertFixtures from '../helpers/insertFixtures';
import proxyMock from '../helpers/proxyMock';
import { adminLogin, logout } from '../helpers/login';
import { host } from '../config';
import disableTransitions from '../helpers/disableTransitions';

describe('Share entities', () => {
  beforeAll(async () => {
    await insertFixtures();
    await proxyMock();
    await adminLogin();
    await page.goto(`${host}/library`);
    await disableTransitions();
  });

  afterAll(async () => {
    await logout();
  });

  const getEntitiesCollaborators = async () =>
    page.$$eval('.members-list tr .member-list-item', items => items.map(item => item.textContent));

  const checkAccessOfPersons = (accesses: string[]) => {
    accesses.map(async (access, index) => {
      await expect(page).toMatchElement(`.members-list tr:nth-child(${index + 1}) select`, {
        text: access,
      });
    });
  };

  it('Should list available collaborators of an entity', async () => {
    await expect(page).toClick('.item-document', { text: 'Artavia Murillo y otros' });
    await page.waitForSelector('.share-btn');
    await expect(page).toClick('button', { text: 'Share' });
    await expect(page).toClick('.userGroupsLookupField');
    await page.waitForSelector('.userGroupsLookupField li .press-enter-note');
    const availableCollaborators = await page.$$eval(
      '.userGroupsLookupField li .member-list-item',
      items => items.map(item => item.textContent)
    );
    expect(availableCollaborators).toEqual(['Activistas', 'Asesores legales']);
  });

  const selectLookupOption = async (searchTerm: string, option: string) => {
    await expect(page).toClick('.userGroupsLookupField');
    await expect(page).toFill('.userGroupsLookupField', searchTerm);
    await page.waitForSelector('.userGroupsLookupField li .press-enter-note');
    await expect(page).toClick('.userGroupsLookupField li .member-list-item', { text: option });
  };

  it('Should update the permissions of an entity', async () => {
    await selectLookupOption('editor', 'editor');
    await selectLookupOption('Ase', 'Asesores legales');
    const selectedCollaborators = await getEntitiesCollaborators();
    expect(selectedCollaborators).toEqual([
      'Administrators and Editors',
      'editor',
      'Asesores legales',
    ]);
    await expect(page).toSelect('select', 'Can edit');
    await page.waitForSelector('.confirm-button');
    await expect(page).toClick('button', {
      text: 'Save changes',
    });
    await page.waitForSelector('.share-modal', { hidden: true });
  });

  it('Should not keep previous entity data', async () => {
    await expect(page).toClick('.item-document', { text: 'Apitz Barbera y otros.' });
    await expect(page).toClick('button', { text: 'Share' });
    await expect(page).toClick('.userGroupsLookupField');
    await page.waitForSelector('.members-list tr:nth-child(1) .member-list-item');
    expect(await getEntitiesCollaborators()).toEqual(['Administrators and Editors']);
    await expect(page).toClick('button', { text: 'Close' });
    await page.waitForSelector('.share-modal', { hidden: true });
  });

  it('Should load saved permissions for each entity', async () => {
    await expect(page).toClick('.item-document', { text: 'Artavia Murillo y otros' });
    await expect(page).toClick('button', { text: 'Share' });
    await page.waitForSelector('.members-list tr:nth-child(2) .member-list-item');
    expect(await getEntitiesCollaborators()).toEqual([
      'Administrators and Editors',
      'Asesores legales',
      'editor',
    ]);
    checkAccessOfPersons(['Can edit', 'Can see', 'Can edit']);
    await expect(page).toClick('button', { text: 'Close' });
    await page.waitForSelector('.share-modal', { hidden: true });
  });

  it('Should open the share modal for multiple selection', async () => {
    await expect(page).toClick('button', { text: 'Select all' });
    await expect(page).toClick('.is-active .share-btn', { text: 'Share' });
    await page.waitForSelector('.members-list tr:nth-child(2)');
    const loadedCollaborators = await getEntitiesCollaborators();
    expect(loadedCollaborators).toEqual([
      'Administrators and Editors',
      'Asesores legales',
      'editor',
    ]);
    checkAccessOfPersons(['Can edit', 'Mixed access', 'Mixed access']);
    await expect(page).toClick('button', { text: 'Close' });
    await page.waitForSelector('.share-modal', { hidden: true });
  });
});