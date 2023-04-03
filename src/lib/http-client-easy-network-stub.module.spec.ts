import { HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Request } from 'easy-network-stub';
import { HttpClientEasyNetworkStub } from './http-client-easy-network-stub';
import { HttpClientEasyNetworkStubInterceptor } from './http-client-easy-network-stub-interceptor';
import { HttpClientEasyNetworkStubModule, HTTP_CLIENT_EASY_NETWORK_STUBS } from './http-client-easy-network-stub.module';

it('forRoot without injection token and stubFactory', () => {
  const urlMatch = /\/api\//;

  TestBed.configureTestingModule({
    imports: [HttpClientEasyNetworkStubModule.forRoot({ urlMatch })]
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
      handler: expect.anything()
    }
  ]);
});

it('forRoot with getIsEnabled', () => {
  const urlMatch = /\/api\//;
  const getIsEnabled = jest.fn();

  TestBed.configureTestingModule({
    imports: [HttpClientEasyNetworkStubModule.forRoot({ urlMatch, getIsEnabled })]
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
      getIsEnabled
    }
  ]);
});

it('forRoot with injection token', () => {
  const urlMatch = /\/api\//;
  const injectionToken = new InjectionToken<HttpClientEasyNetworkStub>('Blubbi');

  TestBed.configureTestingModule({
    imports: [HttpClientEasyNetworkStubModule.forRoot({ urlMatch, stubInjectionToken: injectionToken })]
  });

  const stub = TestBed.inject(injectionToken);
  expect(stub).toBeInstanceOf(HttpClientEasyNetworkStub);
});

it('forRoot with stub factory', () => {
  const urlMatch = /\/api\//;
  const stubFactory = jest.fn<void, [HttpClientEasyNetworkStub]>();

  TestBed.configureTestingModule({
    imports: [HttpClientEasyNetworkStubModule.forRoot({ urlMatch, stubFactory })]
  });

  expect(stubFactory).toHaveBeenCalledWith<[HttpClientEasyNetworkStub]>(expect.anything());
});

it('multiple imports of stub module', () => {
  const urlMatch1 = /\/api\/v1\//;
  const urlMatch2 = /\/api\/v2\//;
  const injectionToken1 = new InjectionToken<HttpClientEasyNetworkStub>('v1');
  const injectionToken2 = new InjectionToken<HttpClientEasyNetworkStub>('v2');
  const stubFactory1 = jest.fn<void, [HttpClientEasyNetworkStub]>();
  const stubFactory2 = jest.fn<void, [HttpClientEasyNetworkStub]>();

  TestBed.configureTestingModule({
    imports: [
      HttpClientEasyNetworkStubModule.forRoot({
        urlMatch: urlMatch1,
        stubFactory: stubFactory1,
        stubInjectionToken: injectionToken1
      }),
      HttpClientEasyNetworkStubModule.forRoot({
        urlMatch: urlMatch2,
        stubFactory: stubFactory2,
        stubInjectionToken: injectionToken2
      })
    ]
  });

  const stubs = TestBed.inject(HTTP_CLIENT_EASY_NETWORK_STUBS);
  const interceptors = TestBed.inject(HTTP_INTERCEPTORS);
  const stub1 = TestBed.inject(injectionToken1);
  const stub2 = TestBed.inject(injectionToken2);

  assertStubs(stubs, [
    [stub1, urlMatch1],
    [stub2, urlMatch2]
  ]);

  assertInterceptors(interceptors, [
    [
      {
        baseUrl: urlMatch1,
        handler: expect.anything()
      }
    ],
    [
      {
        baseUrl: urlMatch2,
        handler: expect.anything()
      }
    ]
  ]);

  expect(stubFactory1).toHaveBeenCalledWith(stub1);
  expect(stubFactory2).toHaveBeenCalledWith(stub2);
});

it('multiple stub configs', () => {
  const urlMatch1 = /\/api\/v1\//;
  const urlMatch2 = /\/api\/v2\//;
  const injectionToken1 = new InjectionToken<HttpClientEasyNetworkStub>('v1');
  const injectionToken2 = new InjectionToken<HttpClientEasyNetworkStub>('v2');
  const stubFactory1 = jest.fn<void, [HttpClientEasyNetworkStub]>();
  const stubFactory2 = jest.fn<void, [HttpClientEasyNetworkStub]>();

  TestBed.configureTestingModule({
    imports: [
      HttpClientEasyNetworkStubModule.forRoot([
        {
          urlMatch: urlMatch1,
          stubFactory: stubFactory1,
          stubInjectionToken: injectionToken1
        },
        {
          urlMatch: urlMatch2,
          stubFactory: stubFactory2,
          stubInjectionToken: injectionToken2
        }
      ])
    ]
  });

  const stubs = TestBed.inject(HTTP_CLIENT_EASY_NETWORK_STUBS);
  const interceptors = TestBed.inject(HTTP_INTERCEPTORS);
  const stub1 = TestBed.inject(injectionToken1);
  const stub2 = TestBed.inject(injectionToken2);

  assertStubs(stubs, [
    [stub1, urlMatch1],
    [stub2, urlMatch2]
  ]);

  assertInterceptors(interceptors, [
    [
      {
        baseUrl: urlMatch1,
        handler: expect.anything()
      },
      {
        baseUrl: urlMatch2,
        handler: expect.anything()
      }
    ]
  ]);

  expect(stubFactory1).toHaveBeenCalledWith(stub1);
  expect(stubFactory2).toHaveBeenCalledWith(stub2);
});

function assertStubs(actualStubs: HttpClientEasyNetworkStub[], expectedStubs: [HttpClientEasyNetworkStub, string | RegExp][]) {
  expect(actualStubs).toHaveLength(expectedStubs.length);

  expectedStubs.forEach(([stub, urlMatch]) => {
    expect((stub as any)._urlMatch).toBe(urlMatch);
    expect(actualStubs).toContain(stub);
  });
}

function assertInterceptors(
  actualInterceptors: HttpInterceptor[],
  expectedInterceptorHandlers: { baseUrl: string | RegExp; handler: (req: Request) => Promise<void> }[][]
) {
  expect(actualInterceptors).toHaveLength(expectedInterceptorHandlers.length);

  expectedInterceptorHandlers.forEach((handlers, index) => {
    const interceptor = actualInterceptors[index];
    expect(interceptor).toBeInstanceOf(HttpClientEasyNetworkStubInterceptor);
    expect((interceptor as any)._interceptionHandlers).toEqual(handlers);
  });
}
