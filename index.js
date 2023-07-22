require('dotenv').config();
const axios = require('axios')
const mangaList = require('./reading-list.json')
const fs = require('fs')

const title = 'Blue Lock';
const chapter = 'd4635e4b-fc97-4560-a3af-58c31aaae071'
const baseUrl = 'https://api.mangadex.org';

const order = {
    relevance: 'desc',
    followedCount: 'desc'
}

const finalOrderQuery = {};
for (const [key, value] of Object.entries(order)) {
    finalOrderQuery[`order[${key}]`] = value;
};
// try make function in branch

const mangaQuery = async () => {
    const resp = await axios({
        method: 'GET',
        url: `${baseUrl}/manga`,
        params: {
            title: title,
            ...finalOrderQuery
        }
        
    });
   /* console.log(resp.data.data[0].id)
    console.log(resp.data.data[0].attributes.latestUploadedChapter)
    console.log(resp.data.data[0].attributes.title)
     console.log(resp.data.data.find((query) => query = 'b7ec82e5-6dfa-4e93-be33-ae1b1e137a5d'))
      console.log(resp.data.data.map(manga => manga.attributes.title)); */
}

const chapterQuery = async () => {
    const resp = await axios({
        method: 'GET',
        url: `${baseUrl}/chapter/${chapter}`,
    });
    console.log(resp.data.data.attributes.chapter)
} 

if (typeof require !== 'undefined' && require.main === module) {
    mangaQuery();
    chapterQuery();
}