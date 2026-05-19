import { HTTP_INTERCEPTORS, HttpInterceptor } from '@angular/common/http';
import { InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Request } from 'easy-network-stub';
import { expect, it, vi } from 'vitest';

import { HttpClientEasyNetworkStub } from './http-client-easy-network-stub';
import { HttpClientEasyNetworkStubInterceptor } from './http-client-easy-network-stub-interceptor';
import { HTTP_CLIENT_EASY_NETWORK_STUBS } from './injection-tokens';
import { provideHttpClientEasyNetworkStub } from './provide-http-client-easy-network-stub';

it('provideHttpClientEasyNetworkStub without injection token and stubFactory', () => {
  const urlMatch = /\/api\//;

  TestBed.configureTestingModule({
    providers: [provideHttpClientEasyNetworkStub({ urlMatch })],
  });

  const stubs = TestBed.inject(HTTP_CLIENT_EASY_NETWORK_STUBS);
  const interceptors = TestBed.inject(HTTP_INTERCEPTORS);

  expect(stubs).toHaveLength(1);
  expect((stubs[0] as any)._urlMatch).toEqual(urlMatch);
  expect(interceptors).toHaveLength(1);
  expect(interceptors[0]).toBeInstanceOf(HttpClientEasyNetworkStubInterceptor);
  expect((interceptors[0] as any)._interceptionHandlers).toEqual([
    {
      baseUrl: urlMatch,
      handler: expect.anything(),
    },
  ]);
});

it('provideHttpClientEasyNetworkStub with getIsEnabled', () => {
  const urlMatch = /\/api\//;
  const getIsEnabled = vi.fn();

  TestBed.configureTestingModule({
    providers: [provideHttpClientEasyNetworkStub({ urlMatch, getIsEnabled })],
  });

  const stubs = TestBed.inject(HTTP_CLIENT_EASY_NETWORK_STUBS, []);
  const interceptors = TestBed.inject(HTTP_INTERCEPTORS);

  expect(stubs).toHaveLength(1);
  expect((stubs[0] as any)._urlMatch).toEqual(urlMatch);
  expect(interceptors).toHaveLength(1);
  expect(interceptors[0]).toBeInstanceOf(HttpClientEasyNetworkStubInterceptor);
  expect((interceptors[0] as any)._interceptionHandlers).toEqual([
    {
      baseUrl: urlMatch,
      handler: expect.anything(),
      getIsEnabled,
    },
  ]);
});

it('provideHttpClientEasyNetworkStub with injection token', () => {
  const urlMatch = /\/api\//;
  const injectionToken = new InjectionToken<HttpClientEasyNetworkStub>('Blubbi');

  TestBed.configureTestingModule({
    providers: [provideHttpClientEasyNetworkStub({ urlMatch, stubInjectionToken: injectionToken })],
  });

  const stub = TestBed.inject(injectionToken);
  expect(stub).toBeInstanceOf(HttpClientEasyNetworkStub);
});

it('provideHttpClientEasyNetworkStub with stub factory', () => {
  const urlMatch = /\/api\//;
  const stubFactory = vi.fn<(stub: HttpClientEasyNetworkStub) => void>();

  TestBed.configureTestingModule({
    providers: [provideHttpClientEasyNetworkStub({ urlMatch, stubFactory })],
  });

  expect(stubFactory).toHaveBeenCalledWith(expect.anything());
});

it('multiple provideHttpClientEasyNetworkStub', () => {
  const urlMatch1 = /\/api\/v1\//;
  const urlMatch2 = /\/api\/v2\//;
  const injectionToken1 = new InjectionToken<HttpClientEasyNetworkStub>('v1');
  const injectionToken2 = new InjectionToken<HttpClientEasyNetworkStub>('v2');
  const stubFactory1 = vi.fn<(stub: HttpClientEasyNetworkStub) => void>();
  const stubFactory2 = vi.fn<(stub: HttpClientEasyNetworkStub) => void>();

  TestBed.configureTestingModule({
    providers: [
      provideHttpClientEasyNetworkStub({
        urlMatch: urlMatch1,
        stubFactory: stubFactory1,
        stubInjectionToken: injectionToken1,
      }),
      provideHttpClientEasyNetworkStub({
        urlMatch: urlMatch2,
        stubFactory: stubFactory2,
        stubInjectionToken: injectionToken2,
      }),
    ],
  });

  const stubs = TestBed.inject(HTTP_CLIENT_EASY_NETWORK_STUBS);
  const interceptors = TestBed.inject(HTTP_INTERCEPTORS);
  const stub1 = TestBed.inject(injectionToken1);
  const stub2 = TestBed.inject(injectionToken2);

  assertStubs(stubs, [
    [stub1, urlMatch1],
    [stub2, urlMatch2],
  ]);

  assertInterceptors(interceptors, [
    [
      {
        baseUrl: urlMatch1,
        handler: expect.anything(),
      },
    ],
    [
      {
        baseUrl: urlMatch2,
        handler: expect.anything(),
      },
    ],
  ]);

  expect(stubFactory1).toHaveBeenCalledWith(stub1);
  expect(stubFactory2).toHaveBeenCalledWith(stub2);
});

it('multiple stub configs', () => {
  const urlMatch1 = /\/api\/v1\//;
  const urlMatch2 = /\/api\/v2\//;
  const injectionToken1 = new InjectionToken<HttpClientEasyNetworkStub>('v1');
  const injectionToken2 = new InjectionToken<HttpClientEasyNetworkStub>('v2');
  const stubFactory1 = vi.fn<(stub: HttpClientEasyNetworkStub) => void>();
  const stubFactory2 = vi.fn<(stub: HttpClientEasyNetworkStub) => void>();

  TestBed.configureTestingModule({
    providers: [
      provideHttpClientEasyNetworkStub([
        {
          urlMatch: urlMatch1,
          stubFactory: stubFactory1,
          stubInjectionToken: injectionToken1,
        },
        {
          urlMatch: urlMatch2,
          stubFactory: stubFactory2,
          stubInjectionToken: injectionToken2,
        },
      ]),
    ],
  });

  const stubs = TestBed.inject(HTTP_CLIENT_EASY_NETWORK_STUBS);
  const interceptors = TestBed.inject(HTTP_INTERCEPTORS);
  const stub1 = TestBed.inject(injectionToken1);
  const stub2 = TestBed.inject(injectionToken2);

  assertStubs(stubs, [
    [stub1, urlMatch1],
    [stub2, urlMatch2],
  ]);

  assertInterceptors(interceptors, [
    [
      {
        baseUrl: urlMatch1,
        handler: expect.anything(),
      },
      {
        baseUrl: urlMatch2,
        handler: expect.anything(),
      },
    ],
  ]);

  expect(stubFactory1).toHaveBeenCalledWith(stub1);
  expect(stubFactory2).toHaveBeenCalledWith(stub2);
});

function assertStubs(
  actualStubs: HttpClientEasyNetworkStub[],
  expectedStubs: [HttpClientEasyNetworkStub, string | RegExp][]
) {
  expect(actualStubs).toHaveLength(expectedStubs.length);

  expectedStubs.forEach(([stub, urlMatch]) => {
    expect((stub as any)._urlMatch).toBe(urlMatch);
    expect(actualStubs).toContain(stub);
  });
}

function assertInterceptors(
  actualInterceptors: readonly HttpInterceptor[],
  expectedInterceptorHandlers: {
    baseUrl: string | RegExp;
    handler: (req: Request) => Promise<void>;
  }[][]
) {
  expect(actualInterceptors).toHaveLength(expectedInterceptorHandlers.length);

  expectedInterceptorHandlers.forEach((handlers, index) => {
    const interceptor = actualInterceptors[index];
    expect(interceptor).toBeInstanceOf(HttpClientEasyNetworkStubInterceptor);
    expect((interceptor as any)._interceptionHandlers).toEqual(handlers);
  });
}
