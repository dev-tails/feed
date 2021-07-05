document.addEventListener("DOMContentLoaded", function () {
  let db;

  async function init() {
    db = await idb.openDB("feed", 1, {
      upgrade(db, oldVersion, newVersion) {
        if (newVersion == 1) {
          const store = db.createObjectStore("feeds", {
            keyPath: "id",
            autoIncrement: true,
          });
        }
      },
    });

    const AddFeed = document.getElementById("add-feed");
    if (AddFeed) {
      const [urlInput, submitBtn] = AddFeed.getElementsByTagName("input");

      submitBtn.addEventListener("click", function () {
        const url = urlInput.value;
        db.add("feeds", {
          url,
        });
      });
    }

    const feeds = await db.getAll("feeds");

    const ArticleList = document.getElementById("article-list");
    if (ArticleList) {
      const entries = [];
      const urls = feeds.map(function (feed) {
        return feed.url
      });

      const baseUrl = "http://localhost:3000";
      const res = await fetch(baseUrl + "/api/feeds/fetch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ urls })
      })
      const data = await res.json();      

      for (const entry of data.data) {
        const div = document.createElement("div");
        const link = document.createElement("a");
        const date = document.createElement("div");
        date.innerText = new Date(entry.pubDate).toLocaleDateString();

        link.setAttribute("href", entry.url);

        link.innerText = entry.title;
        div.appendChild(link);
        div.appendChild(date);
        ArticleList.appendChild(div);
      }
    }

    const FeedList = document.getElementById("feed-list");
    if (FeedList) {
      for (feed of feeds) {
        const div = document.createElement("div");
        const link = document.createElement("a");
        link.setAttribute("href", feed.url);
        link.innerText = feed.url;
        div.appendChild(link);

        const removeBtn = document.createElement("button");
        removeBtn.addEventListener("click", function () {
          db.delete("feeds", feed.id);
          FeedList.removeChild(div);
        });
        removeBtn.innerText = "x";
        div.appendChild(removeBtn);

        FeedList.appendChild(div);
      }
    }
  }

  init();
});

function feedXmlToEntries(xmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
  if (!xmlDoc) {
    return [];
  }

  let entries = getEntriesByFeed(xmlDoc);
  if (!entries.length) {
    entries = getEntriesByRss(xmlDoc);
  }

  return entries;
}

function getEntriesByRss(xmlDoc) {
  const rssNode = xmlDoc.getElementsByTagName("rss")[0];
  if (!rssNode) {
    return [];
  }

  const itemNodes = rssNode.getElementsByTagName("item");

  const entries = [];

  for (const item of itemNodes) {
    const link = item.getElementsByTagName("link")[0].getAttribute("href");
    const title = item.getElementsByTagName("title")[0].innerHTML;
    const published = item.getElementsByTagName("pubDate")[0].innerHTML;
    const publishedDate = new Date(published);

    entries.push({
      link,
      title,
      publishedDate,
    });
  }

  return entries;
}

function getEntriesByFeed(xmlDoc) {
  const feedNode = xmlDoc.getElementsByTagName("feed")[0];
  if (!feedNode) {
    return [];
  }

  const entryNodes = feedNode.getElementsByTagName("entry");

  const entries = [];

  for (const entry of entryNodes) {
    const link = entry.getElementsByTagName("link")[0].getAttribute("href");
    const title = entry.getElementsByTagName("title")[0].innerHTML;
    const published = entry.getElementsByTagName("published")[0].innerHTML;
    const publishedDate = new Date(published);

    entries.push({
      link,
      title,
      publishedDate,
    });
  }

  return entries;
}
