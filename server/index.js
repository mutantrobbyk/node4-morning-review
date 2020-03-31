require('dotenv').config()
const express = require('express')
const massive = require('massive')
const session = require('express-session')
const {SERVER_PORT, CONNECTION_STRING, SESSION_SECRET} = process.env
const middleware = require('./controllers/middleware')
const authCtrl = require('./controllers/authController')
const port = SERVER_PORT
const app = express()

app.use(express.json())

app.use(
    session({
        resave: false,
        saveUninitialized: true,
        secret: SESSION_SECRET,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24
        }
    })
)
massive({
    connectionString: CONNECTION_STRING,
    ssl: {rejectUnauthorized: false}
}).then(db => {
    app.set('db', db)
    console.log('DB connected')
    app.listen(port, () => console.log(`Yep here we go on ${port}`))
})

app.post('/auth/register', middleware.checkUsername, authCtrl.register)
app.post('/auth/login', middleware.checkUsername, authCtrl.login)
app.post('/auth/logout', authCtrl.logout)
app.get('/api/user', authCtrl.getUser) 