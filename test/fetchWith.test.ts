import {
  fetchWith,
  composeFetchMiddleware,
  FetchWithMiddleware,
  InferMiddlewareCtx,
} from '../src/fetchWith';

const mockFetch = jest.fn();

global.fetch = mockFetch;

const withJSONBody: FetchWithMiddleware<{
  body: object | string;
}> = ctx => {
  let body = ctx.options.body;
  if (typeof body === 'object') {
    ctx.options.body = JSON.stringify(body, null, '');
  }

  return ctx;
};

const withQuery: FetchWithMiddleware<{
  query: string;
}> = ctx => {
  let query = ctx.options.query;
  if (query) {
    ctx.url += query;
  }
  return ctx;
};

const url = '/example';
const optsWithBody = { body: { foo: 'bar' } };
const optsWithQuery = { query: '?baz=boz' };
const optsWithBodyAndQuery = {
  ...optsWithBody,
  ...optsWithQuery,
};

const withBodyResult = {
  body: JSON.stringify(optsWithBody.body, null, ''),
};

const withQueryResult = url + optsWithQuery.query;

type ComposedCtx = InferMiddlewareCtx<typeof withQuery> &
  InferMiddlewareCtx<typeof withJSONBody>;

describe('fetchWith', () => {
  it('calls on fetch', () => {
    fetchWith<{ body: object }>(url, optsWithBody);
    expect(mockFetch).toHaveBeenCalledWith(url, optsWithBody);
  });

  it('uses withBody middleware', () => {
    fetchWith(url, optsWithBody, withJSONBody);
    expect(mockFetch).toHaveBeenCalledWith(url, withBodyResult);
  });

  it('uses withQuery middleware', () => {
    const expectedUrl = url + optsWithQuery.query;
    fetchWith(url, optsWithQuery, withQuery);
    expect(mockFetch).toHaveBeenCalledWith(expectedUrl, optsWithQuery);
  });

  it('uses multiple middleware', () => {
    fetchWith<ComposedCtx>(
      url,
      optsWithBodyAndQuery,
      composeFetchMiddleware(withQuery, withJSONBody)
    );
    expect(mockFetch).toHaveBeenCalledWith(withQueryResult, {
      ...withBodyResult,
      ...optsWithQuery,
    });
  });
});
