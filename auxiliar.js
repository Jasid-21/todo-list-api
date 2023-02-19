const connection = require('./connection/database');
const functions = {
    verify_session,
    verify_username,
    create_token
}

function verify_session(req, resp, next) {
    const session = req.query.token;
    console.log(session);
    
    connection.query(`SELECT * FROM sessions WHERE session_key = '${session}'`, function(err, data) {
        if (err) {
            console.error(err);
            resp.status(500).send({msg: 'Error consulting session...'});
            return;
        }

        if (data.length == 0) {
            resp.status(404).send({msg: 'Session not found...'});
            return;
        }
        
        const user_id = data[0].user_id;
        req.id = user_id;
        next();
    });
}

async function verify_username(username) {
    return (
        new Promise(function(resl, rej) {
            connection.query(`SELECT * FROM users WHERE username = '${username}'`, function(err, data) {
                if (err) {
                    rej(err);
                }

                if (data.length > 0) {
                    resl(true);
                } else {
                    resl(false);
                }
            });
        })
    );
}

function create_token(num = 30) {
    const lower = 'abcdefghijklmnopqrst';
    const upper = lower.toUpperCase();
    const numbers = '0123456789';
    const total = lower + upper + numbers;

    const tam = total.length;
    var token = '';
    for (var i=0; i<num; i++) {
        const ran = Math.floor(Math.random()*(tam - 1));
        token += total[ran];
    }

    return token;
}

module.exports = functions;
