import ngneers from '@ngneers/eslint-config-angular';

export default [
  {
    ignores: ['test/**/*', 'eslint.config.mjs'],
  },
  ...ngneers.configs.angular,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
