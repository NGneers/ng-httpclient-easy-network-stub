import { HttpClientEasyNetworkStub } from './http-client-easy-network-stub';
import { HttpClientEasyNetworkStubInterceptor } from './http-client-easy-network-stub-interceptor';
import { Request } from 'easy-network-stub';

describe('init', () => {
  it('adds a handler to the http interceptor', () => {
    const interceptor = new HttpClientEasyNetworkStubInterceptor();
    const stub = new HttpClientEasyNetworkStub(/\/api\//);

    const interceptorSpy = jest.spyOn(interceptor, 'addHandler');

    stub.init(interceptor);
    expect(interceptorSpy).toHaveBeenCalledWith<[RegExp, (req: Request) => Promise<void>]>(/\/api\//, expect.anything());
  });
});
