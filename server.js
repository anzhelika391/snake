const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;
const resultsFile = path.join(__dirname, 'gameResults.json');

app.use(express.static(__dirname));
app.use(express.json());

// Завантаження сторінки
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Збереження результатів у JSON-файл
app.post('/save-score', (req, res) => {
    let newScore = req.body;

    fs.readFile(resultsFile, 'utf8', (err, data) => {
        let results = [];
        if (!err && data) {
            results = JSON.parse(data);
        }

        results.push(newScore);

        fs.writeFile(resultsFile, JSON.stringify(results, null, 4), 'utf8', (err) => {
            if (err) {
                res.status(500).send("Помилка збереження!");
            } else {
                res.send("Результат збережено!");
            }
        });
    });
});

app.listen(port, () => {
    console.log(`Сервер працює на http://localhost:${port}`);
});
