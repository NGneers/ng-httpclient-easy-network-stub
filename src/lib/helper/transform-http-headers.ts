import { HttpHeaders } from '@angular/common/http';

export const transformHttpHeaders = (headers: HttpHeaders) => {
  const transformed: { [key: string]: string | string[] } = {};

  headers.keys().forEach(key => {
    const values = headers.getAll(key);
    if (values) {
      transformed[key] = values.length > 1 ? values : values[0];
    }
  });

  return transformed;
};
