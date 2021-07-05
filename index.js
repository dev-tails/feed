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
      for (feed of feeds) {
        const res = await fetch(feed.url);
        const body = await res.text()

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(body,"text/xml");
        const feedNode = xmlDoc.getElementsByTagName("feed")[0]
        const entries = feedNode.getElementsByTagName("entry")
        for (const entry of entries) {
          const div = document.createElement('div');
          const link = document.createElement('a')
          const entryUrl = entry.getElementsByTagName("link")[0].getAttribute("href");
          link.setAttribute("href", entryUrl);

          const entryTitleNode = entry.getElementsByTagName("title")[0];
          link.innerText = entryTitleNode.innerHTML
          div.appendChild(link)
          ArticleList.appendChild(div);
        }
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
