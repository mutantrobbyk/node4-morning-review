const bcrypt = require('bcryptjs')

module.exports = {
    register: async (req, res) => {
        console.log(req)
        const {username, password} = req.body
        //check the database to see if the user passed back aleady exists
        const db = req.app.get('db')
        let user = await db.check_user(username)
        if(user[0]){
            return res.status(400).send('Email already in use')
        }
        let salt = bcrypt.genSaltSync(10)
        let hash = bcrypt.hashSync(password, salt)
        let newUser = await db.register_user([username, hash])
        console.log(req.session)
        req.session.user = newUser[0]
        delete req.session.user.password
        res.status(201).send(req.session.user)
    },
    login: async (req, res) => {
        console.log(req.body)
        const {username, password} = req.body
        const db = req.app.get('db')
        let user = await db.check_user(username)
        if (!user[0]){
            return res.status(400).send('Email not found')
        }
        const authenticate = bcrypt.compareSync(password, user[0].password)
        if(!authenticate) {
            return res.status(400).send('Password is incorrect')
        }
        delete user[0].password
        req.session.user = user[0]
        res.status(202).send(req.session.user)
    },
    logout: (req, res) => {
        req.session.destroy()
        res.sendStatus(200)
    },
    getUser: (req, res) => {
        if(req.session.user){
            res.status(200).send(req.session.user)
        } else {
            res.status(204).send('Please log in.')
        }
    }
}