import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { HttpMethod, Request } from 'easy-network-stub';
import { Observable } from 'rxjs';
import { transformHttpHeaders } from './helper/transform-http-headers';

export class HttpClientEasyNetworkStubInterceptor implements HttpInterceptor {
  private readonly interceptionHandlers: { baseUrl: string | RegExp; handler: (req: Request) => Promise<void> }[] = [];

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const handler = this.interceptionHandlers.find(x => {
      return req.url.match(x.baseUrl);
    });

    if (handler) {
      return new Observable<HttpEvent<any>>(subscriber => {
        handler.handler({
          destroy: () => subscriber.complete(),
          method: req.method as HttpMethod,
          body: req.body,
          headers: transformHttpHeaders(req.headers),
          url: req.url,
          reply: r => {
            if (r.statusCode >= 200 && r.statusCode < 300) {
              subscriber.next(new HttpResponse<any>({ status: r.statusCode, headers: r.headers, body: r.body }));
            } else {
              subscriber.error(new HttpErrorResponse({ status: r.statusCode, headers: r.headers, error: r.body }));
            }
            subscriber.complete();
          }
        });
      });
    }

    return next.handle(req);
  }

  public addHandler(baseUrl: string | RegExp, handler: (req: Request) => Promise<void>) {
    this.interceptionHandlers.push({ baseUrl, handler });
  }
}
