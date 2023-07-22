require('dotenv').config();
const axios = require('axios')
const mangaList = require('./reading-list.json')
const fs = require('fs')

const title = 'Blue Lock';
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


const chapterQuery = async (chapter) => {
    const resp = await axios({
        method: 'GET',
        url: `${baseUrl}/chapter/${chapter}`
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
    latestChapter = await chapterQuery(resp.data.data[0].attributes.latestUploadedChapter)
    console.log(latestChapter)
   /* console.log(resp.data.data[0].id)
    console.log(resp.data.data[0].attributes.latestUploadedChapter)
    console.log(resp.data.data[0].attributes.title) */
      console.log(resp.data.data.map(manga => manga.attributes.title)); 
}



if (typeof require !== 'undefined' && require.main === module) {
    mangaQuery();
}