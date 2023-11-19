import { HttpHeaders } from '@angular/common/http';
import { transformHttpHeaders } from './transform-http-headers';

it('transforms the headers correctly', () => {
  const expectedHeaders = {
    'content-type': 'application/json',
    'X-Custom-Header': ['Test1', 'Test2'],
  };

  const headers = new HttpHeaders(expectedHeaders);
  const actualHeaders = transformHttpHeaders(headers);

  expect(actualHeaders).toEqual(expectedHeaders);
});
