import { HttpClientEasyNetworkStub } from './http-client-easy-network-stub';
import {
  HttpClientEasyNetworkStubInterceptor,
  InterceptorHandler,
} from './http-client-easy-network-stub-interceptor';

describe('init', () => {
  it('adds a handler to the http interceptor', () => {
    const interceptor = new HttpClientEasyNetworkStubInterceptor();
    const getIsEnabled = jest.fn();
    const stub = new HttpClientEasyNetworkStub(/\/api\//);

    const interceptorSpy = jest.spyOn(interceptor, 'addHandler');

    stub.init(interceptor, getIsEnabled);
    expect(interceptorSpy).toHaveBeenCalledWith<[InterceptorHandler]>({
      baseUrl: /\/api\//,
      handler: expect.anything(),
      getIsEnabled,
    });
  });
});
