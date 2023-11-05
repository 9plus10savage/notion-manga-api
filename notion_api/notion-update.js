require('dotenv').config({path: 'notion.env'})
const baseURL = "https://api.notion.com"

const { Client } = require("@notionhq/client")

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

const getUsers = async () => {
	const listUsersResponse = await notion.users.list({})
    console.log(listUsersResponse)
}

(async () => {
    const response = await notion.databases.query({ database_id: process.env.NOTION_DB_ID, filter: { 
        "property": "Favorites",
        "checkbox": {
            "equals": true
       } } }
       );
    console.log(response.results.map((manga => manga.properties.Title.title[0].plain_text)))
    console.log(response.results[0].properties.Title.title[0].plain_text);
  })();
