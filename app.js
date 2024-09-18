const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage').GridFsStorage;
const mongoose = require('./db');
const User = require('../AI Final Project/models/User').default;
const UploadedFile = require('../AI Final Project/models/File');
const { PythonShell } = require('python-shell');
const path = require('path');
const { spawn } = require('child_process');
require('dotenv').config();

const app = express();
const cors = require('cors');
app.use(cors());


app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.use(session({
    secret: process.env.SECRET_KEY || 'default_session_secret',
    resave: false,
    saveUninitialized: true,
}));


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/'); // Make sure this folder exists
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });

app.post('/upload', upload.single('submission'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        const newUploadedFile = new UploadedFile({
            filename: req.file.originalname,
            filepath: req.file.path,
            uploadDate: new Date()
        });

        await newUploadedFile.save();
        res.redirect('/');
    } catch (err) {
        console.error('Error while saving file information:', err);
        res.status(500).send('Error saving file information: ' + err.message);
    }
});


  app.use(express.json());


  
  app.use(bodyParser.json());
  function predictTags(question, callback) {
    // Prepare the command
    const command = `echo "${question}" | 'C:\\Users\\User\\AppData\\Local\\Programs\\Python\\Python312\\python.exe' "E:\\AI Final Project\\ml_models\\predict_tags.py"`;
    
    // Execute the command in a shell
    const child = spawn(command, {
        shell: true, // This is important to interpret the shell command
        //cwd: path.join(__dirname, 'ml_models'), // Set the working directory to where your Python script is
    });

    // Collect data from script
    let scriptOutput = "";
    child.stdout.on('data', function(data) {
        scriptOutput += data.toString();
    });

    // Handle script completion
    child.on('close', function(code) {
        if (code !== 0) {
            console.error("Failed to run script with exit code " + code);
            callback(new Error("Script execution failed"), null);
        } else {
            console.log("Script output:", scriptOutput);
            callback(null, scriptOutput);
        }
    });

    // Handle script errors
    child.stderr.on('data', function(data) {
        console.error("Script error output:", data.toString());
    });
} 


// app.post('/predict-tags', (req, res) => {
//     const { question } = req.body;

//     // Escape the question to prevent command injection
//     const escapedQuestion = question.replace(/"/g, '\\"');

//     // Construct the command to run the Python script with the question as an argument
//     const pythonPath = 'C:\\Users\\User\\AppData\\Local\\Programs\\Python\\Python312\\python.exe';
//     const scriptPath = 'E:\\AI Final Project\\ml_models\\answer_time_predictor.py';
//     const command = `"${pythonPath}" "${scriptPath}" "${escapedQuestion}"`;

//     // Spawn a child process to run the Python script
//     const { spawn } = require('child_process');
//     const child = spawn(command, {
//         shell: true, // Use the shell to interpret the command
//         maxBuffer: 1024 * 1024
//     });

//     let scriptOutput = "";

//     child.stdout.on('data', (data) => {
//         scriptOutput += data.toString();
//     });

//     child.stderr.on('data', (data) => {
//         console.error(`stderr: ${data}`);
//     });

//     child.on('close', (code) => {
//         if (code !== 0) {
//             console.error(`Child process exited with code ${code}`);
//             return res.status(500).json({ error: 'Error during tag prediction' });
//         } else {
//             try {
//                 const parsedOutput = JSON.parse(scriptOutput);
//                 res.json(parsedOutput); // Send the parsed output
//             } catch (e) {
//                 console.error('Failed to parse script output:', e);
//                 return res.status(500).json({ error: 'Failed to parse script output' });
//             }
//         }
//     });
// });
app.post('/predict-tags', (req, res) => {
    const { question } = req.body;

    // Prepare the Python script execution
    const pythonPath = 'C:\\Users\\User\\AppData\\Local\\Programs\\Python\\Python312\\python.exe';
    const scriptPath = 'E:\\AI Final Project\\ml_models\\answer_time_predictor.py';
    const args = [question];

    // Execute the Python script
    const child = spawn(pythonPath, [scriptPath, ...args]);

    let scriptOutput = '';
    child.stdout.on('data', (data) => {
        scriptOutput += data.toString();
    });

    child.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    child.on('close', (code) => {
        console.log(`Child process exited with code ${code}`);
        if (code !== 0) {
            return res.status(500).json({ error: 'Error during script execution' });
        } else {
            try {
                const parsedOutput = JSON.parse(scriptOutput);
                return res.json(parsedOutput);
            } catch (e) {
                return res.status(500).json({ error: 'Failed to parse script output' });
            }
        }
    });
});

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

app.get('/', (req, res) => {
    res.render('index', { 
      title: 'Data Science Challenge Library',
      user: req.session.user || null
    });
});

app.get('/competitions', (req, res) => {
    res.render('competitions', {
        title: 'Competitions',
        user: req.session.user
    });
});

app.get('/submission', (req, res) => {
    console.log("Competition Submission route accessed");
    res.render('submission', {
        title: 'Competition Submission',
        user: req.session.user
    });
});

app.get('/leaderboard', (req, res) => {
    res.render('leaderboard', {
        title: 'leaderboard',
        user: req.session.user
    });
});

app.get('/login', (req, res) => {
    res.render('login', {
        title: 'login',
        user: req.session.user
    });
});

app.get('/registration', (req, res) => {
    res.render('registration', {
        title: 'registration',
        user: req.session.user
    });
});
app.get('/predictive_analysis', (req, res) => {
    res.render('predictive_analysis', {
         title: 'Stack Overflow Predictive Analysis',
         user: req.session.user });
});

app.get('/predict-tags-results', (req, res) => {
    if(req.session.predictedTags) {
        res.render('/predict_tags', { tags: req.session.predictedTags }); // Render predict_tags.ejs with tags
    } else {
        res.redirect('/'); // Redirect to home if no predicted tags are available
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user by username
        const user = await User.findOne({ username });

        if (user && password === user.password) {
            req.session.user = { 
                username: user.username,
                // any other user details you want to store in the session
            };
            console.log("Session after login:", req.session);
            // If login is successful, redirect to the home page
            res.redirect('/');
        } else {
            // If login fails, send an error message
            res.status(401).send('Invalid credentials');
        }
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).send('Error logging in');
    }
});

app.post('/register', async (req, res) => {
    const { username, email, password, 'confirm-password': confirmPassword } = req.body;

    // Basic validation
    if (password !== confirmPassword) {
        return res.status(400).send('Passwords do not match');
    }

    // Create a new user and save to the database
    try {
        const newUser = new User({ username, email, password });
        await newUser.save();
        res.redirect('/login');
    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).send('Error registering new user');
    }
});


app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Could not log out');
        } else {
            res.redirect('/');
        }
    });
});
app.get('/check-file', (req, res) => {
    const filename = req.query.filename; // Assuming you pass the filename as a query parameter

    checkFile(filename, (err, file) => {
        if (err) {
            return res.status(500).send("Error occurred");
        }
        if (!file) {
            return res.status(404).send("File not found");
        }
        res.send(file);
    });
});
app.listen(3000, '0.0.0.0', () => {
    console.log('Server started on port 3000');
});
