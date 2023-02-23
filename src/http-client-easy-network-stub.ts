import { EasyNetworkStub } from 'easy-network-stub';
import { HttpClientEasyNetworkStubInterceptor } from './http-client-easy-network-stub-interceptor';

export class HttpClientEasyNetworkStub extends EasyNetworkStub {
  constructor(urlMatch: string | RegExp) {
    super(urlMatch);
  }

  public init(interceptor: HttpClientEasyNetworkStubInterceptor) {
    this.initInternal({
      failer: error => {
        if (error instanceof Error) {
          throw error;
        } else {
          throw new Error(error);
        }
      },
      interceptor: (baseUrl, handler) => {
        interceptor.addHandler(baseUrl, handler);
      }
    });
  }
}
