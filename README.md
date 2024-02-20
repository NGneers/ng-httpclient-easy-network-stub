[![npm](https://img.shields.io/npm/v/@ngneers/ng-httpclient-easy-network-stub?color=%2300d26a&style=for-the-badge)](https://www.npmjs.com/package/@ngneers/ng-httpclient-easy-network-stub)
[![CI](https://img.shields.io/github/actions/workflow/status/NGneers/ng-httpclient-easy-network-stub/build.yml?branch=main&style=for-the-badge)](https://github.com/NGneers/ng-httpclient-easy-network-stub/actions/workflows/build.yml)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@ngneers/ng-httpclient-easy-network-stub?color=%23FF006F&label=Bundle%20Size&style=for-the-badge)](https://bundlephobia.com/package/@ngneers/ng-httpclient-easy-network-stub)

# ng-httpclient-easy-network-stub

An easy class to mock a lot of network requests from the Angular HttpClient.

## See also 🔬

The base class of this package is:
[https://github.com/LoaderB0T/easy-network-stub](https://github.com/LoaderB0T/easy-network-stub)

## Motivation 💥

When developing a new feature based on an OpenAPI specification, where the backend is not implemented yet. In this case it can be easier to first mock all network requests to implement the feature, so teams can work simultaneously on backend and frontend. This package provides an easy and type safe way to mock network requests for a whole API.

## Features 🔥

✅ Easy to setup and use

✅ Type safe url and query parameters

✅ Add your own parameter matchers

✅ Works asynchronously (Promise based)

✅ Supports failing of stubbed requests

The primary use case for this package is to create a mock server for your application so that they do not need real network requests.

## Built With 🔧

- [TypeScript](https://www.typescriptlang.org/)

## Usage Example 🚀

### Provide the stubs

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClientEasyNetworkStub } from '@ngneers/ng-httpclient-easy-network-stub';
import { configureStub } from './configure-stub';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClientEasyNetworkStub({
      urlMatch: /MyServer\/api\/Blog/,
      stubFactory: configureStub,
    }),
  ],
};
```

### Stub configuration

```typescript
import { HttpClientEasyNetworkStub } from '@ngneers/ng-httpclient-easy-network-stub';

export const configureStub = (blogStub: HttpClientEasyNetworkStub) => {
  const posts = [0, 1, 2, 3, 4, 5].map(x => ({ postId: x, text: `test${x}` }));

  blogStub.stub('GET', 'posts', () => {
    return posts;
  });

  // Match Example: GET: /MyServer/api/Blog/posts/123
  blogStub.stub('GET', 'posts/{id:number}', ({ params }) => {
    return posts.find(x => x.postId === params.id);
  });

  // Match Example: POST: /MyServer/api/post
  blogStub.stub('POST', 'posts', ({ body, params }) => {
    posts.push({ postId: body.postId, text: body.text });
  });

  // Match Example: POST: /MyServer/api/Blog/test/true?query=myValue&secondQuery=myOtherValue
  // Note: The order of the query parameters is not important
  blogStub.stub(
    'POST',
    'test/{something:boolean}?{query:string}&{secondQuery:number}',
    ({ body, params }) => {
      console.log(params.something);
      console.log(params.query);
      console.log(params.secondQuery);
      console.log(body);
    }
  );

  // Here we use the stub2<>() method to create a stub with a typed body
  blogStub.stub2<MyRequest>()('POST', 'test', ({ body }) => {
    console.log(body.myValue);
  });

  // You can mark query params as optional with a '?'
  // Match Example: GET: /MyServer/api/Blog/test
  // Match Example: GET: /MyServer/api/Blog/test?refresh=true
  blogStub.stub('GET', 'test?{refresh?:boolean}', ({ body, params }) => {
    if (params.refresh) {
      console.log('Refreshing');
    }
    console.log(body.myValue);
  });

  // You can mark query params as arrays with a '[]'
  // Match Example: GET: /MyServer/api/Blog/test?props=1
  // Match Example: GET: /MyServer/api/Blog/test?props=1&props=2
  blogStub.stub('GET', 'test?{props:number[]}', ({ params }) => {
    params.props.forEach(x => console.log(x));
  });
};
```

### Configure multiple stubs

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClientEasyNetworkStub } from '@ngneers/ng-httpclient-easy-network-stub';
import { configureStub } from './configure-stub';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClientEasyNetworkStub([
      {
        urlMatch: /MyServer\/api\/Blog/,
        stubFactory: configureBlogStub,
      },
      {
        urlMatch: /MyServer\/api\/Users/,
        stubFactory: configureUsersStub,
      },
    ]),
  ],
};
```

### Stub injection token

You can also specify an injection token for each stub, so it can be injected into services or factory methods:

```typescript
import { ApplicationConfig, Inject, Injectable, InjectionToken } from '@angular/core';
import { provideHttpClientEasyNetworkStub } from '@ngneers/ng-httpclient-easy-network-stub';
import { configureStub } from './configure-stub';

export const BLOG_STUB = new InjectionToken<HttpClientEasyNetworkStub>('BLOG_STUB');

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClientEasyNetworkStub({
      urlMatch: /MyServer\/api\/Blog/,
      stubFactory: configureStub,
      stubInjectionToken: BLOG_STUB,
    }),
  ],
};

@Injectable({ providedIn: 'root' })
export class MyService {
  constructor(@Inject(BLOG_STUB) blogStub: HttpClientEasyNetworkStub) {
    // [...]
  }
}
```

## Strongly typed api parameters:

You can add types to parameters and they will be parsed. Out of box 'string', 'number' and 'boolean' are supported. You can add your own types and parsers though.

<p align="center">
<img src="https://user-images.githubusercontent.com/37637338/162327029-994ce009-d1ab-45cc-ab86-d1e21a0d1a6e.png">
<img src="https://user-images.githubusercontent.com/37637338/162327040-a45381a1-652d-4838-91ae-7dc405bd9ff4.png">
</p>

## Contributing 🧑🏻‍💻

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License 🔑

Distributed under the MIT License. See `LICENSE.txt` for more information.

## Contact 📧

Project Link: [https://github.com/NGneers/ng-httpclient-easy-network-stub](https://github.com/NGneers/ng-httpclient-easy-network-stub)

## Special Thanks 🙌

Janik Schumacher ([LoaderB0T](https://github.com/LoaderB0T)) for providing the `easy-network-stub` library, this repo is using. Also, this repo has been heavily inspired by [playwright-easy-network-stub](https://github.com/LoaderB0T/playwright-easy-network-stub).
