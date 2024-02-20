import { InjectionToken } from '@angular/core';

import { HttpClientEasyNetworkStub } from './http-client-easy-network-stub';

export const HTTP_CLIENT_EASY_NETWORK_STUBS = new InjectionToken<HttpClientEasyNetworkStub[]>(
  'HTTP_CLIENT_EASY_NETWORK_STUBS'
);
