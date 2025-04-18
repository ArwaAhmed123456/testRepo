
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

const app = express();
app.use(bodyParser.json());
app.use(express.json());

const SECRET_KEY = 'abc_123';

const users = [{ id: 1, username: 'user1', password: bcrypt.hashSync('password1', 8) }];

const port = 3000;


app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).send('Invalid credentials');
    }
  });
  
  const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization;
    if (token) {
      jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
          return res.sendStatus(403);
        }
        req.user = user;
        next();
      });
    } else {
      res.sendStatus(401);
    }
  };
  
  app.get('/protected', authenticateJWT, (req, res) => {
    res.send(`Hello ${req.user.username}, you have accessed a protected route!`);
  });

let events = [];

// event creation
app.post('/events', (req, res) => {
    const { name, description, date, time } = req.body;

    if (!name || !description || !date || !time) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const newEvent = {
        id: events.length + 1,
        name,
        description,
        date,
        time
    };

    events.push(newEvent);
    res.status(201).json(newEvent);
});

app.get('/events', (req, res) => {
    res.status(200).json(events);
});

 // GET a specific event by ID
 app.get('/events/:id', (req, res) => {
    const eventId = parseInt(req.params.id);
    const event = events.find(e => e.id === eventId);
    if (event) {
        res.json(event);
    } else {
        res.status(404).json({ message: 'Event not found' });
    }
});



// PUT (update) an existing event
app.put('/events/:id', (req, res) => {
     const eventId = parseInt(req.params.id);
     const updatedEventIndex = events.findIndex(e => e.id === eventId);
     if (updatedEventIndex !== -1) {
        events[updatedEventIndex] = { id: eventId, ...req.body };
        res.json(events[updatedEventIndex]);
     } else {
        res.status(404).json({ message: 'Event not found' });
    }
});

// DELETE an event
app.delete('/events/:id', (req, res) => {
    const eventId = parseInt(req.params.id);
    events = events.filter(e => e.id !== eventId);
    res.status(204).send(); 
});

// Event categorization
// Search events by category
// Filter by Category
app.get('/events/category/:cat', authenticateJWT, (req, res) => {
    const cat = req.params.cat.toLowerCase();
    const filtered = events.filter(e => e.category.toLowerCase() === cat && e.userId === req.user.id);
    res.json(filtered);
});


// Sort by Date
app.get('/events/sort/date', authenticateJWT, (req, res) => {
    const sorted = events
      .filter(e => e.userId === req.user.id)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    res.json(sorted);
});


// reminder system
// Endpoint for creating reminders

app.post('/create-reminder', authenticateJWT, async (req, res) => {
    const { eventId, email, message } = req.body;
    const event = events.find(e => e.id === eventId && e.userId === req.user.id);
  
    if (!event) return res.status(404).json({ message: 'Event not found' });
  
    const eventTime = new Date(`${event.date}T${event.time}`);
    const delay = eventTime - new Date() - 5 * 60 * 1000; // 5 minutes before event
  
    if (delay <= 0) return res.status(400).json({ message: 'Reminder time already passed' });
  
    await remindersQueue.add('reminder', { email, message }, { delay });
    event.reminderSet = true;
  
    res.status(200).json({ message: 'Reminder scheduled!' });
  });
  
//   new Worker('reminders', async job => {
//     const { email, message } = job.data;
//     await sendEmail(email, 'Event Reminder', message);
//   }, { connection });
  
//   // --- Email Sender (Replace with real credentials) ---
//   async function sendEmail(to, subject, text) {
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: 'your-email@gmail.com',
//         pass: 'your-app-password', // Use App Password for Gmail
//       },
//     });
  
//     const mailOptions = {
//       from: 'your-email@gmail.com',
//       to,
//       subject,
//       text,
//     };
  
//     return transporter.sendMail(mailOptions);
//   }

// user authentication
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});