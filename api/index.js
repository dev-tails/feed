const cors = require("cors")
const express = require('express')
const Parser = require('rss-parser');
const app = express()
const port = 3000

app.use(express.json())

if (process.env.NODE_ENV !== "production") {
  const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 
  }
  app.use(cors(corsOptions))
}

app.post('/api/feeds/fetch', async (req, res) => {
  const { urls } = req.body

  const allItems = [];
  let parser = new Parser();
  
  for (const url of urls ) {
    const feed = await parser.parseURL(url);
    for (const item of feed.items) {
      allItems.push(item)
    }
  }

  const itemsToReturn = allItems.map((item) => {
    return {
      title: item.title,
      link: item.link,
      pubDate: new Date(item.pubDate)
    }
  })
  .sort((a, b) => {
    return a.pubDate < b.pubDate ? 1 : -1;
  })
  .slice(0, 30);

  res.json({ data: itemsToReturn })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})