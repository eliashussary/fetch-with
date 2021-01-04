type FetchWithOptions<T = any> = Omit<RequestInit, keyof T> & Partial<T>;

type FetchWithContext<T = any> = {
  url: string;
  options: FetchWithOptions<T>;
};

export type FetchWithMiddleware<T = any> = (
  ctx: FetchWithContext<T>
) => FetchWithContext<T>;

export type InferMiddlewareCtx<T> = T extends FetchWithMiddleware<infer C>
  ? C
  : unknown;

export function composeFetchMiddleware<T>(
  ...middleware: FetchWithMiddleware[]
) {
  const composedMiddleware: FetchWithMiddleware<T> = ctx => {
    return middleware.reduce((acc, fn) => {
      const rCtx = fn(acc);
      if (rCtx) {
        return rCtx;
      }

      return acc;
    }, ctx);
  };

  return composedMiddleware;
}

export function fetchWith<T>(
  url: string,
  options?: FetchWithOptions<T>,
  ...middleware: FetchWithMiddleware<T>[]
) {
  const ctx = {
    url,
    options: options || ({} as FetchWithOptions<T>),
  };

  const nextCtx = composeFetchMiddleware(...middleware)(ctx);

  return fetch(nextCtx.url, nextCtx.options);
}

export default fetchWith;
