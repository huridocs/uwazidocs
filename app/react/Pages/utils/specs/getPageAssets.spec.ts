import api from 'app/Search/SearchAPI';
import { RequestParams } from 'app/utils/RequestParams';
import { markdownDatasets } from 'app/Markdown';

import PagesAPI from '../../PagesAPI';
import pageItemLists from '../pageItemLists';

import { getPageAssets } from '../getPageAssets';

describe('getPageAssets', () => {
  const page = {
    _id: 'abc2',
    title: 'Page 1',
    metadata: /*non-metadata-object*/ { content: 'originalContent' },
  };

  let data;
  let request: RequestParams;
  let apiSearch: jasmine.Spy;

  beforeEach(() => {
    spyOn(PagesAPI, 'getById').and.returnValue(Promise.resolve(page));

    spyOn(pageItemLists, 'generate').and.returnValue({
      content: 'parsedContent',
      params: [
        '?q=(a:1,b:2)',
        '',
        '?q=(x:1,y:!(%27array%27),limit:24)',
        '?order=metadata.form&treatAs=number',
      ],
      options: [{}, { limit: 9 }, { limit: 0 }, { limit: 12 }],
    });

    let searchCalls = -1;

    apiSearch = jasmine.createSpy('apiSearch').and.callFake(async () => {
      searchCalls += 1;
      return Promise.resolve({ rows: [`resultsFor:${searchCalls}`] });
    });

    spyOn(api, 'search').and.callFake(apiSearch);

    data = { sharedId: 'abc2' };
    request = new RequestParams(data, 'headers');
  });

  it('should request page for view', async () => {
    const stateActions = await getPageAssets(request);

    expect(PagesAPI.getById).toHaveBeenCalledWith(request);
    expect(stateActions).toMatchSnapshot();
  });

  const assertItemLists = (itemLists: any) => {
    expect(itemLists.length).toBe(4);
    expect(itemLists[0].params).toBe('?q=(a:1,b:2)');
    expect(itemLists[0].items).toEqual(['resultsFor:0']);
    expect(itemLists[1].params).toBe('');
    expect(itemLists[1].items).toEqual(['resultsFor:1']);
    expect(itemLists[2].params).toBe('?q=(x:1,y:!(%27array%27),limit:24)');
    expect(itemLists[2].items).toEqual(['resultsFor:2']);
    expect(itemLists[3].params).toBe('?order=metadata.form&treatAs=number');
    expect(itemLists[3].items).toEqual(['resultsFor:3']);
    expect(itemLists[3].options).toEqual({ limit: 12 });
  };

  it('should request each list inside the content limited to 6 items (default) or the passed value and set the state', async () => {
    const stateActions = await getPageAssets(request);

    expect(apiSearch.calls.count()).toBe(4);
    expect(JSON.parse(JSON.stringify(apiSearch.calls.argsFor(0)[0]))).toEqual({
      data: { a: 1, b: 2, limit: '6' },
      headers: 'headers',
    });
    expect(apiSearch.calls.argsFor(1)[0]).toEqual({
      data: { filters: {}, types: [], limit: '9' },
      headers: 'headers',
    });

    expect(JSON.parse(JSON.stringify(apiSearch.calls.argsFor(2)[0]))).toEqual({
      data: {
        x: 1,
        y: ['array'],
        limit: '6',
      },
      headers: 'headers',
    });
    expect(apiSearch.calls.argsFor(3)[0]).toEqual({
      data: { filters: {}, types: [], limit: '12' },
      headers: 'headers',
    });

    assertItemLists(stateActions.itemLists);
  });

  describe('Datasets', () => {
    let markdownDatasetsResponse: {};

    beforeEach(() => {
      markdownDatasetsResponse = { request1: 'url1', request2: 'url2' };
      spyOn(markdownDatasets, 'fetch').and.callFake(async (content, requestParams, options) => {
        expect(content).toBe('originalContent');
        expect(requestParams).toEqual(request.onlyHeaders());
        return Promise.resolve({ ...markdownDatasetsResponse, ...options.additionalDatasets });
      });
    });

    it('should request each dataset inside the content', async () => {
      const stateActions = await getPageAssets(request);
      expect(stateActions.datasets).toEqual(markdownDatasetsResponse);
    });

    describe('Extended datasets and data', () => {
      it('should request additional dataset queries and passed data', async () => {
        const stateActions = await getPageAssets(
          request,
          { customDataset: { url: 'someurl' } },
          { customData: { localData: 'from store' } }
        );

        expect(stateActions.datasets).toEqual({
          request1: 'url1',
          request2: 'url2',
          customDataset: { url: 'someurl' },
          customData: { localData: 'from store' },
        });
      });
    });
  });
});
