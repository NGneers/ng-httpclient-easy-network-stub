import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { EnvironmentProviders, ModuleWithProviders, NgModule, Provider } from '@angular/core';
import { HttpClientEasyNetworkStub } from './http-client-easy-network-stub';
import { HttpClientEasyNetworkStubConfig } from './http-client-easy-network-stub-config.model';
import { HttpClientEasyNetworkStubInterceptor } from './http-client-easy-network-stub-interceptor';

@NgModule()
export class HttpClientEasyNetworkStubModule {
  static forRoot(config: HttpClientEasyNetworkStubConfig): ModuleWithProviders<HttpClientEasyNetworkStubModule> {
    const interceptor = new HttpClientEasyNetworkStubInterceptor();
    const stub = new HttpClientEasyNetworkStub(config.urlMatch);
    stub.init(interceptor);
    config.stubFactory?.(stub);

    const providers: Array<Provider | EnvironmentProviders> = [];
    if (config.stubInjectionToken) {
      providers.push({
        provide: config.stubInjectionToken,
        useValue: stub
      });
    }

    return {
      ngModule: HttpClientEasyNetworkStubModule,
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          multi: true,
          useValue: interceptor
        },
        {
          provide: HttpClientEasyNetworkStub,
          multi: true,
          useValue: stub
        },
        ...providers
      ]
    };
  }
}
