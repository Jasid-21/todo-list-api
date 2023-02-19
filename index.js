const express = require('express');
const app = express();
const moment = require('moment');
const dotenv = require('dotenv');
const { verify_session } = require('./auxiliar');
const connection = require('./connection/database');

dotenv.config();
app.set('port', process.env.PORT || 3000);
app.use('/', require('./routes/credentials'));

app.listen(app.get('port'), () => {
    console.log('Server listening on port: ', app.get('port'));
});

app.get('/home_info', verify_session, function(req, resp) {
    const user_id = req.query.user_id;

    connection.query(`SELECT * FROM tasks WHERE user_id = ${user_id}`, function(err, data) {
        if (err) {
            console.error(err);
            resp.status(500).send({msg: "Error in database..."});
            return;
        }

        data = data.map(item => {
            item.Max_date = item.Max_date.toISOString().slice(0, 10);
            return item;
        });

        resp.status(200).send(data);
    });
});

app.post('/new_task', verify_session, function(req, resp) {
    const name = req.query.name;
    const desc = req.query.desc;
    const date = req.query.date;
    const user_id = req.query.user_id;

    connection.query(`INSERT INTO tasks (Task_name, task_desc, Max_date, User_id, Done) 
    VALUES ('${name}', '${desc}', '${date}', ${user_id}, 0)`, function(error, ret) {
        if (error) {
            console.error(error);
            resp.status(500).send({msg: "Error creating task..."});
            return;
        }

        const task_id = ret.insertId;
        resp.status(200).send({task_id});
    });
});

app.post('/delete_task', verify_session, function(req, resp) {
    const task_id = req.query.task_id;
    connection.query(`DELETE FROM tasks WHERE Id = ${task_id};`, function(error) {
        if (error) {
            console.error(error);
            resp.status(500).send({msg: "Error removing task entry..."});
            return;
        }

        resp.status(200).send();
    });
});

app.post('/update_task_state', verify_session, function(req, resp) {
    const task_id = req.query.task_id;

    connection.query(`UPDATE tasks SET Done = true WHERE Id = ${task_id};`, function(error) {
        if (error) {
            console.error(error);
            resp.status(500).send({msg: "Error updating task entry state..."});
            return;
        }

        resp.status(200).send();
    });
});
