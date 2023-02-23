import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { EnvironmentProviders, InjectionToken, ModuleWithProviders, NgModule, Provider } from '@angular/core';
import { HttpClientEasyNetworkStub } from './http-client-easy-network-stub';
import { HttpClientEasyNetworkStubConfig } from './http-client-easy-network-stub-config.model';
import { HttpClientEasyNetworkStubInterceptor } from './http-client-easy-network-stub-interceptor';

export const HTTP_CLIENT_EASY_NETWORK_STUBS = new InjectionToken<HttpClientEasyNetworkStub[]>('HTTP_CLIENT_EASY_NETWORK_STUBS');

@NgModule()
export class HttpClientEasyNetworkStubModule {
  static forRoot(
    config: HttpClientEasyNetworkStubConfig | HttpClientEasyNetworkStubConfig[]
  ): ModuleWithProviders<HttpClientEasyNetworkStubModule> {
    const interceptor = new HttpClientEasyNetworkStubInterceptor();

    const configs = config instanceof Array ? config : [config];
    const providers: Array<Provider | EnvironmentProviders> = [];

    configs.forEach(stubConfig => {
      const stub = new HttpClientEasyNetworkStub(stubConfig.urlMatch);
      stub.init(interceptor);
      stubConfig.stubFactory?.(stub);

      providers.push({
        provide: HTTP_CLIENT_EASY_NETWORK_STUBS,
        multi: true,
        useValue: stub
      });

      if (stubConfig.stubInjectionToken) {
        providers.push({
          provide: stubConfig.stubInjectionToken,
          useValue: stub
        });
      }
    });

    return {
      ngModule: HttpClientEasyNetworkStubModule,
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          multi: true,
          useValue: interceptor
        },
        ...providers
      ]
    };
  }
}
