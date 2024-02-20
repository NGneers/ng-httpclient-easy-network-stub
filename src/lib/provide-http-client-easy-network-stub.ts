import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { EnvironmentProviders, Provider, makeEnvironmentProviders } from '@angular/core';

import { HttpClientEasyNetworkStub } from './http-client-easy-network-stub';
import { HttpClientEasyNetworkStubConfig } from './http-client-easy-network-stub-config.model';
import { HttpClientEasyNetworkStubInterceptor } from './http-client-easy-network-stub-interceptor';
import { HTTP_CLIENT_EASY_NETWORK_STUBS } from './injection-tokens';

export function provideHttpClientEasyNetworkStub(
  config: HttpClientEasyNetworkStubConfig | HttpClientEasyNetworkStubConfig[]
): EnvironmentProviders {
  const interceptor = new HttpClientEasyNetworkStubInterceptor();

  const configs = config instanceof Array ? config : [config];
  const providers: Array<Provider | EnvironmentProviders> = [];

  configs.forEach(stubConfig => {
    const stub = new HttpClientEasyNetworkStub(stubConfig.urlMatch);
    stub.init(interceptor, stubConfig.getIsEnabled);
    stubConfig.stubFactory?.(stub);

    providers.push({
      provide: HTTP_CLIENT_EASY_NETWORK_STUBS,
      multi: true,
      useValue: stub,
    });

    if (stubConfig.stubInjectionToken) {
      providers.push({
        provide: stubConfig.stubInjectionToken,
        useValue: stub,
      });
    }
  });

  return makeEnvironmentProviders([
    {
      provide: HTTP_INTERCEPTORS,
      multi: true,
      useValue: interceptor,
    },
    ...providers,
  ]);
}
