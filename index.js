const axios = require('axios')
const Manga = require('./class.js')
const { writeFile, readFile } = require("fs");

const title = 'Berserk';
const baseUrl = 'https://api.mangadex.org';
const jsonPath = './reading_list.json'


const getOrder = () => {
    const order = {
        relevance: 'desc',
        followedCount: 'desc'
    }
    
    const finalOrderQuery = {};
    for (const [key, value] of Object.entries(order)) {
        finalOrderQuery[`order[${key}]`] = value;
    };
    return finalOrderQuery
}

async function getMangaStats(resp)  {
    [mangaTitle, mangaID, chapterID] = [resp.data.data[0].attributes.title.en, resp.data.data[0].id, resp.data.data[0].attributes.latestUploadedChapter]
    latestChapter = await chapterQuery(chapterID)
    console.log(resp.data.data[0].attributes)
    return new Manga(mangaTitle, mangaID, latestChapter)
    
}

 const updateList = (path, manga) => {
    let reading_list;
    readFile(path, (error, jsonString) => {
        if (error) {
            console.log(error);
            return;
        }
        try {
            reading_list = JSON.parse(jsonString)
            console.log(reading_list['mangas'].map(a => a.title))
            reading_list['mangas'].push(manga)
        } catch (err) {
            console.log("Error parsing JSON string:", err);
        }

    writeFile(jsonPath, JSON.stringify(reading_list, null, 2), (err) => {
        if (err) {
            console.log("Failed to write updated data to file");
            return;
        }
        console.log("Updated file successfully");
        });
    });
 };

const chapterQuery = async (chapterID_to_query) => {
    const resp = await axios({
        method: 'GET',
        url: `${baseUrl}/chapter/${chapterID_to_query}`
    });
    return resp.data.data.attributes.chapter
} 

const mangaQuery = async () => {
    const resp = await axios({
        method: 'GET',
        url: `${baseUrl}/manga`,
        params: {
            title: title,
            ...getOrder()
        }  
    });
    const manga = await getMangaStats(resp)
    updateList(jsonPath, manga)
}

if (typeof require !== 'undefined' && require.main === module) {
    mangaQuery();
}