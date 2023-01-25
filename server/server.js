'use strict';

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const readline = require("readline");
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json({}));
app.use(bodyParser.text({}));

const PORT = process.env.PORT || 8000;

const router = express.Router();

router.get('/products', (req, res, next) => {
    const stream = fs.createReadStream("./data.csv");
    const rl = readline.createInterface({ input: stream });
    let data = [];

    rl.on("line", (row) => {
        data.push(row.split("|"));
    });

    rl.on("close", () => {
        const items = [];
        let headers = data[0];
        for (let index = 1; index < data.length; index++) {
            const row = data[index];
            const obj = headers.reduce((x, y, i) => {
                if (y === 'price_per_unit') {
                    x[y] = Number.parseFloat(row[i]);
                } else if (y === 'to_order_qty') {
                    x[y] = Number.parseInt(row[i] | 0, 10);
                } else {
                    x[y] = row[i];
                }
                return x;
            }, {});
            items.push(obj)
        }
        res.status(200).send({items: items});
    });
});

router.post('/products', (req, res, next) => {
    const data = req.body;
    const header = Object.keys(data[0]);
    const csv = data.map((row) =>
      header
        .map((fieldName) => row[fieldName] || '')
        .join('|')
    );
    csv.unshift(header.join('|'));
    const csvArray = csv.join('\r\n');
    fs.writeFileSync('./data1.csv', csvArray);
    res.status(200).send({data: {message: 'Success'}});
});

app.use(router);
app.use('**', (req, res) => {
    res.send('API not found');
});

app.listen(PORT, async () => {
    console.log('Server is running ' + PORT);
});