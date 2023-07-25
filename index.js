const axios = require('axios')
const Manga = require('./class.js')
const { writeFile, readFileSync } = require("fs");

const title = 'Blue Lock';
const baseUrl = 'https://api.mangadex.org';
const jsonPath = './reading_list.json'

const order = {
    relevance: 'desc',
    followedCount: 'desc'
}

const finalOrderQuery = {};
for (const [key, value] of Object.entries(order)) {
    finalOrderQuery[`order[${key}]`] = value;
};

async function getMangaStats(resp)  {
    mangaTitle = resp.data.data[0].attributes.title.en
    mangaID = resp.data.data[0].id
    latestChapter = await chapterQuery(resp.data.data[0].attributes.latestUploadedChapter)
    return new Manga(mangaTitle, mangaID, latestChapter)
}

 const updateList = (manga) => {
    const reading_list = JSON.parse(readFileSync(jsonPath))
    reading_list['mangas'].push(manga)
    writeFile(jsonPath, JSON.stringify(reading_list, null, 2), (err) => {
        if (err) {
            console.log("Failed to write updated data to file");
            return;
        }
        console.log("Updated file successfully");
    });
 };

const chapterQuery = async (chapterID) => {
    const resp = await axios({
        method: 'GET',
        url: `${baseUrl}/chapter/${chapterID}`
    });
    return resp.data.data.attributes.chapter
} 

const mangaQuery = async () => {
    const resp = await axios({
        method: 'GET',
        url: `${baseUrl}/manga`,
        params: {
            title: title,
            ...finalOrderQuery
        }  
    });
 
    const manga = await getMangaStats(resp)
    updateList(manga)
}

if (typeof require !== 'undefined' && require.main === module) {
    mangaQuery();
}