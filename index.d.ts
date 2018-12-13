export default got;

declare const got: got.GotFn &
  Record<'get' | 'post' | 'put' | 'patch' | 'head' | 'delete', got.GotFn>;

declare namespace got {
  interface GotFn {
    (url: string): Promise<string>;
    (url: string, options: GotJSONOptions): Promise<any>;
    (url: string, options: GotOptions): Promise<string>;
  }

  interface GotJSONOptions extends GotOptions {
    json: true;
  }

  interface GotOptions {
    query?: string | object;
    body?: string | object;
    // timeout?: number;

    ajax?: boolean;
    json?: boolean;
    referer?: string;
    callbackName?: string;
  }
}
