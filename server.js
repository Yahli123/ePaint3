const express = require('express');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('mydb.db');
const app = express();
const path = require('path');

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('views'));
app.use(express.static('scripts'));
app.use(express.static('assets'));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/login', (req, res) => {
  res.render('Login_Page');
});

app.get('/logout', (req, res) => { 
  res.render('index');
});

app.get('/signup', (req, res) => {
  res.render('Sign_Up_Page');
});

app.get('/Painter_page_Guest_Version', (req, res) => {
  res.render('Painter_page_Guest_Version');
});

app.get('/feed/:username', (req, res) => {
  const username = req.params.username;
  res.render('feed', { username: username } );
});

app.get('/My-Photos/:username', (req, res) => {
  const username = req.params.username;
  res.render('My_Photos_Page', {username: username});
});

app.get('/paint/:username', (req, res) => {
  const username = req.params.username;
  res.render('Painter_page_User_Version', { username: username});
});


app.get('/Photo_page', (req, res) => {
  res.render('Photo_page');
});

app.post('/create-user', async (req, res) => {
  const { email, username, password, profileCode } = req.body;
  console.log(email, username, password);
  try {
    const existingUser = await checkUser(email, username);
    if (existingUser.email !== null || existingUser.username !== null) {
      console.log('Email or username is already in use');

      return res
        .status(400)
        .json({ success: false, message: 'email or username are taken.' });
    }
    const query =
      'INSERT INTO users (username, email, password, profileCode) VALUES (? , ? , ?, ?)';
    db.run(query, [username, email, password, profileCode]);

    res.status(200).json({
      success: true,
      message: 'user created successfully.',
      redirect: `/feed/${username}`,
    });
  } catch (error) {
    console.log(error.message);

    res.status(400).json({ success: false, message: 'error creating user.' });
  }
});

async function checkUser(identifier) {
  return new Promise((resolve, reject) => {
    const query =
      'SELECT email, username, password FROM users WHERE email = ? OR username = ?';
    db.get(query, [identifier, identifier], (err, row) => {
      if (err) {
        reject(err);
      } else {
        // Ensure the user object has 'email', 'username', and 'password' properties
        const user = {
          email: row ? row.email : null,
          username: row ? row.username : null,
          password: row ? row.password : null,
        };

        resolve(user);
      }
    });
  });
}

// POST to login user, check password for authentication and whether the user is found, matching the password.#sign

app.post('/login-user', async (req, res) => {
  const { username_email, password } = req.body;
  console.log(username_email, password);
  try {
    const user = await checkUser(username_email);
    if (user.password !== null) {
      if (user.password === password) {
        res.status(200).json({
          success: true,
          message: 'user logged in successfully.',
          redirect: `/feed/${user.username}`,
        });
      } else {
        res
          .status(400)
          .json({ success: false, message: 'incorrect password.' });
      }
    } else {
      res.status(400).json({ success: false, message: 'user not found.' });
    }
  } catch (error) {
    console.log(error.message);
  }
});


// Save canvas endpoint
app.post("/save-canvas", (req, res) => {
  const { img_id, username, img_data, profileCode } = req.body;

  if (!img_id || !username || !img_data) {
    return res.status(400).json({ error: "Missing required data." });
  }

  // Convert dataURI to buffer
  const dataURItoBuffer = (dataURI) => {
    const splitIndex = dataURI.indexOf(",");
    const base64String = dataURI.substr(splitIndex + 1);
    return Buffer.from(base64String, "base64");
  };

  // Decode dataURI to buffer
  const imgBuffer = dataURItoBuffer(img_data);

  // Insert the data into the SQLite3 table
  const sql = "INSERT INTO imgs (img_id, username, img_data, profileCode) VALUES (?, ?, ?, ?)";
  db.run(sql, [img_id, username, imgBuffer, profileCode], function (err) {
    if (err) {
      console.error("Error inserting data:", err.message);
      return res.status(500).json({ error: "Internal server error." });
    }

    res.status(200).json({ message: "Canvas image saved successfully!" });
  });
});



app.post('/check-id', (req, res) => {

  const img_id = req.body;

  const query = 'SELECT img_id from imgs where img_id = ?';

  db.run(query, [img_id], (err, row) => {
    if (row) return res.json({available: false});
    if (err) return res.status(500).json(err);

    return res.json({available: true});

  })

})



// Create a GET route to get a list of all the posts and show them in random order.
app.get('/posts', (req, res) => {
  const query = 'SELECT * FROM imgs ORDER BY RANDOM()';
  db.all(query, (err, rows) => {
    if (err) {
      console.log(err.message);
      return res.status(500).json({ error: 'Internal server error.' });
    }

    return res.status(200).json(rows);
  });
});



// /photos/${username}

app.get('/photos/:username', (req , res) => {
  const username = req.params.username;
  const query = 'SELECT * FROM imgs WHERE username = ?';

  db.all(query, [username], (err, rows) => {
    if (err) {
      console.log(err.message);
      return res.status(500).json({ error: 'Internal server error.' });
    }

    return res.status(200).json(rows);
  })
})


app.get('/api/code/:username', (req, res) => {
  const username = req.params.username;
  const query = 'SELECT profileCode FROM users WHERE username = ?';

  db.get(query, [username], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Internal server error.' });
    }

    if (!row) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.status(200).json(row);
  });
});




// Route to get like count for a post
app.get('/api/imgs/:img_id/like-count', (req, res) => {
  const { img_id } = req.params;

  const queryCount = `SELECT COUNT(*) AS like_count FROM likes WHERE img_id = ?`;

  db.get(queryCount, [img_id], (err, row) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }
      return res.status(200).json({ like_count: row.like_count });
  });
});

// Route to check if user has liked a post
app.post('/api/imgs/:img_id/is-liked', (req, res) => {
  const { img_id } = req.params;
  const { username } = req.body;

  const queryCheck = `SELECT * FROM likes WHERE username = ? AND img_id = ?`;

  db.get(queryCheck, [username, img_id], (err, row) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }
      return res.status(200).json({ is_liked: !!row });
  });
});

// Route to like a post
app.post('/api/imgs/:img_id/like', (req, res) => {
  const { username, user_id } = req.body;
  const { img_id } = req.params;

  const queryCheck = `SELECT * FROM likes WHERE username = ? AND img_id = ?`;
  const queryInsert = `INSERT INTO likes (username, img_id, user_id) VALUES (?, ?, ?)`;

  db.get(queryCheck, [username, img_id], (err, row) => {
      if (err) {
          console.error('Error in queryCheck:', err);
          return res.status(500).json({ error: err.message });
      }
      if (!row) {
          db.run(queryInsert, [username, img_id, user_id], function (err) {
              if (err) {
                  console.error('Error in queryInsert:', err);
                  return res.status(500).json({ error: err.message });
              }
              return res.status(200).json({ message: 'Post liked successfully' });
          });
      } else {
          return res.status(400).json({ message: 'Already liked' });
      }
  });
});


// Route to unlike a post
app.post('/api/imgs/:img_id/unlike', (req, res) => {
  const { username } = req.body;
  const { img_id } = req.params;

  const queryDelete = `DELETE FROM likes WHERE username = ? AND img_id = ?`;

  db.run(queryDelete, [username, img_id], function (err) {
      if (err) {
          return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
          return res.status(400).json({ message: 'No like found' });
      }
      return res.status(200).json({ message: 'Post unliked successfully' });
  });
});



app.get('/api/users/:username', (req, res) => {
  const { username } = req.params;
  const query = 'SELECT * FROM users WHERE username = ?';
  db.get(query, [username], (err, row) => { 
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Internal server error.' });
    }

    if (!row) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.status(200).json(row.user_id);
  })
})





app.listen(3000, () => {
  console.log('server is running on http://localhost:3000');
});
