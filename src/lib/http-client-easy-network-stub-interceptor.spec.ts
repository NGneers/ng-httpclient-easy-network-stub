import { HttpErrorResponse, HttpEvent, HttpHandler, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { Request } from 'easy-network-stub';
import { lastValueFrom, Observable, of } from 'rxjs';
import { HttpClientEasyNetworkStubInterceptor } from './http-client-easy-network-stub-interceptor';

let interceptor: HttpClientEasyNetworkStubInterceptor;
let nextHandlerMock: HttpHandler;
let nextHandlerResponse: HttpEvent<any>;

beforeEach(() => {
  interceptor = new HttpClientEasyNetworkStubInterceptor();
  nextHandlerResponse = new HttpResponse<any>({ status: 200, body: {} });
  nextHandlerMock = {
    handle: jest.fn<Observable<HttpEvent<any>>, [HttpRequest<any>]>(() => of(nextHandlerResponse))
  } as unknown as HttpHandler;
});

describe('intercept', () => {
  it('calls next if no handler is registered', async () => {
    const request = new HttpRequest<any>('GET', '/api/contacts');

    const response = await lastValueFrom(interceptor.intercept(request, nextHandlerMock));

    expect(nextHandlerMock.handle).toHaveBeenCalledWith(request);
    expect(response).toEqual(nextHandlerResponse);
  });

  it('calls handler if registered handler matches the url', async () => {
    const reqBody = { test: 'Test123' };
    const headers = { 'content-type': 'application/json', 'X-Custom-Header': ['Test1', 'Test2'] };
    const handler = jest.fn<Promise<void>, [Request]>(async r => {
      expect(r.method).toBe('POST');
      expect(r.body).toEqual(reqBody);
      expect(r.url).toBe('/api/contacts');
      r.reply({ statusCode: 200 });
    });
    interceptor.addHandler(/\/api\//, handler);
    const request = new HttpRequest<any>('POST', '/api/contacts', reqBody, { headers: new HttpHeaders(headers) });

    await lastValueFrom(interceptor.intercept(request, nextHandlerMock));

    expect(nextHandlerMock.handle).not.toHaveBeenCalled();
    expect(handler).toHaveBeenCalled();
  });

  it('calls next if no registered handler matches the url', async () => {
    const handler = jest.fn<Promise<void>, [Request]>(async r => r.reply({ statusCode: 200 }));
    interceptor.addHandler(/\/testing\//, handler);
    const request = new HttpRequest<any>('GET', '/api/contacts');

    await lastValueFrom(interceptor.intercept(request, nextHandlerMock));

    expect(nextHandlerMock.handle).toHaveBeenCalledWith(request);
  });

  it('calls only one handler if multiple registered handlers match the url', async () => {
    const handler1 = jest.fn<Promise<void>, [Request]>(async r => r.reply({ statusCode: 200 }));
    const handler2 = jest.fn<Promise<void>, [Request]>(async r => r.reply({ statusCode: 200 }));
    interceptor.addHandler(/\/api\//, handler1);
    interceptor.addHandler(/\/api\//, handler2);
    const request = new HttpRequest<any>('GET', '/api/contacts');

    await lastValueFrom(interceptor.intercept(request, nextHandlerMock));

    expect(nextHandlerMock.handle).not.toHaveBeenCalled();
    expect(handler1).toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
  });

  it('calls first handler of registered handlers that matches the url', async () => {
    const handler1 = jest.fn<Promise<void>, [Request]>(async r => r.reply({ statusCode: 200 }));
    const handler2 = jest.fn<Promise<void>, [Request]>(async r => r.reply({ statusCode: 200 }));
    interceptor.addHandler(/\/testing\//, handler1);
    interceptor.addHandler(/\/api\//, handler2);
    const request = new HttpRequest<any>('GET', '/api/contacts');

    await lastValueFrom(interceptor.intercept(request, nextHandlerMock));

    expect(nextHandlerMock.handle).not.toHaveBeenCalled();
    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalled();
  });
});

describe('handler call', () => {
  it('destory completes observable without value', async () => {
    const handler = jest.fn<Promise<void>, [Request]>(async r => r.destroy());
    interceptor.addHandler(/\/api\//, handler);
    const request = new HttpRequest<any>('GET', '/api/contacts');

    await lastValueFrom(interceptor.intercept(request, nextHandlerMock))
      .then(() => fail())
      .catch(error => expect(error.name).toBe('EmptyError'));
  });

  it.each([200, 201, 299])(
    'reply provides http response and completes observable on success status code (%s)',
    async statusCode => {
      const respBody = { test: 'Test123' };
      const headers = { 'content-type': 'application/json', 'X-Custom-Header': ['Test1', 'Test2'] };
      const handler = jest.fn<Promise<void>, [Request]>(async r => r.reply({ statusCode, body: respBody, headers }));
      interceptor.addHandler(/\/api\//, handler);
      const request = new HttpRequest<any>('GET', '/api/contacts');

      const response = await lastValueFrom(interceptor.intercept(request, nextHandlerMock));

      expect(handler).toHaveBeenCalled();
      expect(response).toBeInstanceOf(HttpResponse<any>);

      const r = response as unknown as HttpResponse<any>;
      expect({ status: r.status, headers: r.headers, body: r.body }).toEqual({
        status: statusCode,
        headers,
        body: respBody
      });
    }
  );

  it.each([199, 300, 400, 500])(
    'reply throws http error response and completes observable on non-success status code (%s)',
    async statusCode => {
      const respBody = { test: 'Test123' };
      const headers = { 'content-type': 'application/json', 'X-Custom-Header': ['Test1', 'Test2'] };
      const handler = jest.fn<Promise<void>, [Request]>(async r => r.reply({ statusCode, body: respBody, headers }));
      interceptor.addHandler(/\/api\//, handler);
      const request = new HttpRequest<any>('GET', '/api/contacts');

      await lastValueFrom(interceptor.intercept(request, nextHandlerMock))
        .then(() => fail())
        .catch(response => {
          expect(handler).toHaveBeenCalled();
          expect(response).toBeInstanceOf(HttpErrorResponse);

          const r = response as unknown as HttpErrorResponse;
          expect({ status: r.status, headers: r.headers, error: r.error }).toEqual({
            status: statusCode,
            headers,
            error: respBody
          });
        });
    }
  );
});
