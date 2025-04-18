
describe('Basic Tests', () => {
    test('Simple math check', () => {
      expect(2 + 2).toBe(4);
    });
  
    test('Environment works', () => {
      expect(process.env.NODE_ENV).not.toBe('production');
    });
  });
  