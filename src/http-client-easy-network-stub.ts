import { EasyNetworkStub } from 'easy-network-stub';
import { HttpClientEasyNetworkStubInterceptor } from './http-client-easy-network-stub-interceptor';

export class HttpClientEasyNetworkStub extends EasyNetworkStub {
  constructor(urlMatch: string | RegExp) {
    super(urlMatch);
  }

  public init(interceptor: HttpClientEasyNetworkStubInterceptor) {
    // TODO: Register handler in interceptor
  }
}
