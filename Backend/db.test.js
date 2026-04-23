const mongoose = require('mongoose');

describe('Database Connection', () => {
  it('should connect to test database', async () => {
    expect(mongoose.connection.readyState).toBe(1); 
  });
});