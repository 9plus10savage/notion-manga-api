const fs = require('fs')
const { Client } = require("@notionhq/client")
require('dotenv').config({path: 'notion.env'})

const readingList = JSON.parse(fs.readFileSync('../reading_list.json', 'utf-8'))

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});


const getPageIDbyTitle = async (title) => {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DB_ID,
      filter: {
        "property": "Title",
        "rich_text": {
          "equals": title
        }
      }
    });
    return response.results.map(manga => manga.id)
  };


  const updateSingleManga = async (manga) => {
    try {
      const [pageID] = await getPageIDbyTitle(manga.title);
      const response = await notion.pages.update({
        page_id: pageID,
        properties: {
          "Chapters (T)": {
            "number": Number(manga.latestChapter)
          }
        }
      });

      if (require.main === module) {      
          console.log('[Operation successful] Updated ' + manga.title + ' to chapter ' + manga.latestChapter);
}     } catch (error) {
          console.error(`Failed to update ${manga.title}: ${error}`);
    }
  }
  
  const delay = ms => new Promise(res => setTimeout(res, ms));

  const updateMangaChapterNotion = async (mangaListToUpdate) => {
    console.log("Now updating reading list to Notion...")
    for (const manga of mangaListToUpdate) {
      await updateSingleManga(manga);
      await delay(1000 / 3); // Delay to respect the rate limit of 3 requests per second
    }
    console.log("Reading list has been synced to Notion!")
  }
  
  
if (require.main === module) {
    updateMangaChapterNotion(readingList.mangas)
}

module.exports = { updateMangaChapterNotion }