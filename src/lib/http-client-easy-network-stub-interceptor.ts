import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { HttpMethod, Request } from 'easy-network-stub';
import { Observable } from 'rxjs';

import { transformHttpHeaders } from './helper/transform-http-headers';

export type InterceptorHandler = {
  baseUrl: string | RegExp;
  handler: (req: Request) => Promise<void>;
  getIsEnabled?: () => boolean;
};

export class HttpClientEasyNetworkStubInterceptor implements HttpInterceptor {
  private readonly _interceptionHandlers: InterceptorHandler[] = [];

  public intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const handler = this._interceptionHandlers.find(x => {
      return req.url.match(x.baseUrl) && x.getIsEnabled?.() !== false;
    });

    if (handler) {
      return new Observable<HttpEvent<unknown>>(subscriber => {
        handler.handler({
          destroy: () => subscriber.complete(),
          method: req.method as HttpMethod,
          body: req.body,
          headers: transformHttpHeaders(req.headers),
          url: req.urlWithParams,
          reply: r => {
            if (r.statusCode >= 200 && r.statusCode < 300) {
              subscriber.next(
                new HttpResponse<unknown>({
                  status: r.statusCode,
                  headers: r.headers,
                  body: r.body,
                })
              );
            } else {
              subscriber.error(
                new HttpErrorResponse({ status: r.statusCode, headers: r.headers, error: r.body })
              );
            }
            subscriber.complete();
          },
        });
      });
    }

    return next.handle(req);
  }

  public addHandler(handler: InterceptorHandler) {
    this._interceptionHandlers.push(handler);
  }
}
