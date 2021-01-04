# fetch-with

Create your own `fetch` with composable request middleware.

## Usage

```sh
yarn add fetch-with
# or
npm i fetch-with
```

### Example

```ts
import {
  fetchWith,
  composeFetchMiddleware,
  FetchWithMiddleware,
} from 'fetch-with';

type FetchJsonBody = { body: object | string };

const withJsonBody: FetchWithMiddleware<FetchJsonBody> = ctx => {
  let body = ctx.options.body;
  if (typeof body === 'object') {
    ctx.options.body = JSON.stringify(body, null, '');
  }

  return ctx;
};

type FetchQuery = { query: object };

const withQuery: FetchWithMiddleware<FetchQuery> = ctx => {
  let query = ctx.options.query;
  if (query) {
    ctx.url += `?${qs.stringify(query)}`;
  }
  return ctx;
};

type FetchOptions = JSONBody & FetchQuery;

const myMiddleware = composeFetchMiddleware<FetchOptions>(
  withJsonBody,
  withQuery
);

const myFetch = (url: string, options: FetchOptions) => {
  return fetchWith(url, options, myMiddleware);
};

myFetch('/api/foo', {
  method: 'post',
  body: {
    foo: 'bar',
  },
});

myFetch('/api/bar', {
  query: {
    offset: 0,
    limit: 30,
  },
});
```
