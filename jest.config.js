import { getAngularJestConfig } from '@ngneers/jest-config-angular';

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
export default {
  ...getAngularJestConfig(/* Optionally provide options */),
};
