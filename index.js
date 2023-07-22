require('dotenv').config();
const axios = require('axios')
const fs = require('fs')
const Manga = require('./class.js')
const mangaList = require('./reading-list.json')

const title = 'Blue Lock';
const baseUrl = 'https://api.mangadex.org';

const order = {
    relevance: 'desc',
    followedCount: 'desc'
}

// define how query results are ordered
const finalOrderQuery = {};
for (const [key, value] of Object.entries(order)) {
    finalOrderQuery[`order[${key}]`] = value;
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
    mangaTitle = resp.data.data[0].attributes.title.en
    mangaID = resp.data.data[0].id
    latestChapter = await chapterQuery(resp.data.data[0].attributes.latestUploadedChapter)
    const manga = new Manga(mangaTitle, mangaID, latestChapter)
    console.log(JSON.stringify(manga))
}


if (typeof require !== 'undefined' && require.main === module) {
    mangaQuery();
}