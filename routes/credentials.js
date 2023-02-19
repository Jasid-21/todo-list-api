const express = require('express');
const router = express.Router();

const cors = require('cors');
const bcrypt = require('bcrypt');
const connection = require('../connection/database');
const auxiliar = require('../auxiliar');
const { verify_username, verify_session, create_token } = auxiliar;

router.use(cors({
    origin: '*'
}));

router.post('/register', function(req, resp) {
    console.log("Hello");
    const username = req.query.username;
    const pass = req.query.password;

    verify_username(username).then(function(resl) {
        if (resl) {
            resp.status(409).send({msg: 'This username is alredy in use...'});
            return;
        }

        const new_pass = bcrypt.hashSync(pass, 10);
        connection.query(`INSERT INTO users (username, password)
        VALUES ('${username}', '${new_pass}')`, function(err, ret) {
            if (err) {
                console.error(err);
                resp.status(500).send({msg: 'Error creating user. Please, try later...'});
                return;
            }

            const id = ret.insertId;
            const token = create_token();
            connection.query(`INSERT INTO sessions (user_id, session_key) 
            VALUES (${id}, '${token}')`, function(err) {
                if (err) {
                    console.error(err);
                    resp.status(500).send({msg: 'Error creating session token...'});
                } else {
                    resp.status(200).send({token, user_id: id});
                }
            });
        });
    }, function(rej) {
        console.error(rej);
    });
});

router.post('/login', function(req, resp) {
    const user = req.query.username;
    const pass = req.query.password;

    try {
        connection.query(`SELECT Id, password FROM users 
        WHERE username = '${user}'`, function(err, data) {
            if (err) {
                console.error(err);
                resp.status(500).send({msg: 'Error getting data from database. Please try later...'});
                return;
            }

            if (data.length == 0) {
                resp.status(404).send({msg: "Username or password don't match..."});
                return;
            }


            const row = data[0];
            const comp = bcrypt.compareSync(pass, row.password);
            if (!comp) {
                resp.status(404).send({msg: "Username  or password don't match..."});
                return;
            }

            const id = row.Id;
            const token = create_token();
            connection.query(`INSERT INTO sessions (user_id, session_key) 
            VALUES (${id}, '${token}')`, function(err) {
                if (err) {
                    console.error(err);
                    resp.status(500).send({msg: 'Error creating session token...'});
                } else {
                    resp.status(200).send({token, user_id: id});
                }
            });
        });
    } catch(err) {
        console.error(err);
        resp.status(500).send({msg: 'Server error...'});
    }
});

router.post('/logout', verify_session, function(req, resp) {
    const token = req.query.token;

    connection.query(`DELETE FROM sessions WHERE session_key = '${token}'`, function(error) {
        if (error) {
            console.log(error);
            resp.status(500).send({msg: "Error closing session..."});
            return;
        }

        resp.status(200).send();
    });
});

module.exports = router;
