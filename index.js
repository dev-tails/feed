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

      for (feed of feeds) {
        const res = await fetch(feed.url);
        const body = await res.text();

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(body, "text/xml");
        const feedNode = xmlDoc.getElementsByTagName("feed")[0];
        const entryNodes = feedNode.getElementsByTagName("entry");

        for (const entry of entryNodes) {
          const link = entry
            .getElementsByTagName("link")[0]
            .getAttribute("href");
          const title = entry.getElementsByTagName("title")[0].innerHTML;
          const published =
            entry.getElementsByTagName("published")[0].innerHTML;
          const publishedDate = new Date(published);

          entries.push({
            link,
            title,
            publishedDate,
          });
        }
      }

      const entriesToDisplay = entries.sort((a, b) => {
        return a.publishedDate < b.publishedDate ? 1 : -1;
      }).slice(0, 20)

      for (const entry of entriesToDisplay) {
        const div = document.createElement("div");
        const link = document.createElement("a");
        const date = document.createElement("div")
        date.innerText = entry.publishedDate.toLocaleDateString()

        link.setAttribute("href", entry.url);

        link.innerText = entry.title;
        div.appendChild(link);
        div.appendChild(date)
        ArticleList.appendChild(div);
      }
    }

    const FeedList = document.getElementById("feed-list");
    if (FeedList) {
      for (feed of feeds) {
        const node = document.createTextNode(feed.url);
        FeedList.appendChild(node);
      }
    }
  }

  init();
});
