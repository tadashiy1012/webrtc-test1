const express = require('express');
const app = express();
app.use(express.static('./public'));
require('express-ws')(app);
const static = require('node-static');

const port = process.env.PORT || 8080;
const file = new static.Server('./public');

app.use((req, res, next) => {
    console.log(new Date() + ':' + req.url);
    return next();
});

app.get('/', (req, res) => {
    req.addListener('end', () => {
        file.serveFile('/index.html', 200, {}, req, res);
    }).resume();
});

app.get('/produce', (req, res) => {
    req.addListener('end', () => {
        file.serveFile('/produce.html', 200, {}, req, res);
    }).resume();
});

app.get('/consume', (req, res) => {
    req.addListener('end', () => {
        file.serveFile('/consume.html', 200, {}, req, res);
    }).resume();
});

let clients = []

app.ws('/signal', (ws, req) => {
    clients.push(ws);
    ws.on('message', (msg) => {
        console.log(msg);
        clients.forEach((e) => {
            if (e !== ws) {
                e.send(msg);
            }
        });
    });
    ws.on('close', () => {
        clients = clients.filter((e) => e !== ws);
        console.log('close');
    });
});

app.listen(port);