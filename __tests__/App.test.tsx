/**
 * @format
 */

import React from 'react';

// Simple smoke test - full app rendering requires extensive navigation mocking
// Integration tests for the full app should be done via E2E testing (Detox)
describe('App', () => {
  it('exports a valid React component', () => {
    const App = require('../App').default;
    expect(typeof App).toBe('function');
  });
});
