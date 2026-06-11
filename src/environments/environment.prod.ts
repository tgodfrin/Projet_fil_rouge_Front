// Production environment — swapped in at build time via `fileReplacements` (angular.json).
// apiUrl is empty: every HTTP call becomes a relative path (e.g. `/loan/list`),
// served on the same domain and proxied to the back-end by nginx. No CORS, no internal URL leak.
export const environment = {
  production: true,
  apiUrl: '',
};
