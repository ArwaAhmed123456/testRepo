
// describe('Basic Tests', () => {
//     test('Simple math check', () => {
//       expect(2 + 2).toBe(4);
//     });
  
//     test('Environment works', () => {
//       expect(process.env.NODE_ENV).not.toBe('production');
//     });
//   });

const request = require('supertest');
const express = require('express');
const app = require('../server'); 

let token = '';

describe('Node.js Event Reminder App', () => {

  // Login first and get JWT token
  it('should login with correct credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'user1', password: 'password1' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  // Test unauthorized access
  it('should block access to protected route without token', async () => {
    const res = await request(app).get('/protected');
    expect(res.statusCode).toBe(401);
  });

  it('should allow access to protected route with token', async () => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', token);
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Hello user1');
  });

  let eventId;

  // Create Event
  it('should create a new event', async () => {
    const res = await request(app)
      .post('/events')
      .send({
        name: 'Test Event',
        description: 'Testing event creation',
        date: '2025-05-01',
        time: '10:00'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    eventId = res.body.id;
  });

  // Get All Events
  it('should get all events', async () => {
    const res = await request(app).get('/events');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Get Event by ID
  it('should get a specific event by ID', async () => {
    const res = await request(app).get(`/events/${eventId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Test Event');
  });

  // Update Event
  it('should update an event', async () => {
    const res = await request(app)
      .put(`/events/${eventId}`)
      .send({
        name: 'Updated Event',
        description: 'Updated description',
        date: '2025-05-01',
        time: '11:00'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Event');
  });

  // Delete Event
  it('should delete an event', async () => {
    const res = await request(app).delete(`/events/${eventId}`);
    expect(res.statusCode).toBe(204);
  });

});

  