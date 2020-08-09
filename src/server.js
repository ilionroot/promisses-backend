import express from 'express';
import cors from 'cors';
import cheerio from 'cheerio';
import request from 'request';
import fs from 'fs';
import path from 'path';

const port = process.env.PORT || 3333;

const app = express();

async function getBible() {
  const data = fs.readFileSync(path.resolve('.', 'src', 'bible.json'));
  return JSON.parse(data);
}

app.use(cors());

app.get('/', async (req, res) => {
  await getBible().then(async data => {
    let random = Math.round(Math.random() * 65); // Multiplica pelo maximo e subtrai o minimo -> Math.random() * max - min
    let chapterRandom = 0;

    const search = await (() => {
      chapterRandom = Math.round(Math.random() * data.books[random].chapters.length);
      return data.books[random].passage;
    })();

    request.get(`https://api.biblia.com/v1/bible/content/LEB.html?passage=${search + (chapterRandom + 1)}&key=a3a3a16dc7fcb2da1369ec11e5fb0a05`, (err, response, html) => {
      if (err) { throw new Error(err) }

      const $ = cheerio.load(html);

      res.json({
        local: {
          book: search,
          chapter_number: (chapterRandom + 1),
        },
        vers: (() => {
          let text = ($('p').text().substr(7, ($('p').text().length - 9))).split('.')[0] + '.';
          return text;
        })()
      });
    });
  }).catch(err => {
    return res.send(err);
  });
});

app.listen(port, () => {
  console.log(`Server rodando na porta: ${port}`);
});