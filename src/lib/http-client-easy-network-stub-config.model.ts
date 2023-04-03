import { InjectionToken } from '@angular/core';
import { HttpClientEasyNetworkStub } from './http-client-easy-network-stub';

export interface HttpClientEasyNetworkStubConfig {
  urlMatch: string | RegExp;
  stubFactory?: (stub: HttpClientEasyNetworkStub) => void;
  stubInjectionToken?: InjectionToken<HttpClientEasyNetworkStub>;
  getIsEnabled?: () => boolean;
}
