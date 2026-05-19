import { describe, expect, it, vi } from 'vitest';

import { HttpClientEasyNetworkStub } from './http-client-easy-network-stub';
import { HttpClientEasyNetworkStubInterceptor } from './http-client-easy-network-stub-interceptor';

describe('init', () => {
  it('adds a handler to the http interceptor', () => {
    const interceptor = new HttpClientEasyNetworkStubInterceptor();
    const getIsEnabled = vi.fn();
    const stub = new HttpClientEasyNetworkStub(/\/api\//);

    const interceptorSpy = vi.spyOn(interceptor, 'addHandler');

    stub.init(interceptor, getIsEnabled);
    expect(interceptorSpy).toHaveBeenCalledWith({
      baseUrl: /\/api\//,
      handler: expect.anything(),
      getIsEnabled,
    });
  });
});
