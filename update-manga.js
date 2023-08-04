#!/usr/bin/env node

const axios = require('axios');
const path = require('path');
const Manga = require('./class.js');
const { writeFileSync, readFileSync } = require("fs");
const { getCurrentTime, getTitles, addReturnToTitles } = require('./functions.js')

const baseUrl = 'https://api.mangadex.org';
const jsonPath = path.join(path.dirname(require.main.filename), 'reading_list.json');

const loadJSONFile = async (path = jsonPath) => {
    const readingListInitialLoad = readFileSync(path, 'utf8')
    return JSON.parse(readingListInitialLoad) 
}

const getMangaTitles = async (path = jsonPath) => {
    const readingList = await loadJSONFile(path);
    return readingList.mangas.map((manga) => manga.title);
}

const getOrder = (order = {}) => {
    const finalOrderQuery = {};
    for (const [key, value] of Object.entries(order)) {
        finalOrderQuery[`order[${key}]`] = value;
    };
    return finalOrderQuery
}
const chapterQuery = async (chapterID_to_query) => {
    const resp = await axios({
        method: 'GET',
        url: `${baseUrl}/chapter/${chapterID_to_query}`
    });
    return resp.data.data.attributes.chapter
} 
const getLatestChapterID = async (mangaID_to_query) => {
    const resp = await axios({
        method: 'GET',
        url: `${baseUrl}/manga/${mangaID_to_query}/aggregate`
    });
    return formatLatestChapterID(resp.data.volumes)
}
async function getMangaStats(resp)  {
    [mangaTitle, mangaID] = [resp.data.data[0].attributes.title.en, resp.data.data[0].id]
/*     console.log('initial ' + mangaTitle) */
    chapterID = await getLatestChapterID(mangaID)
/*     console.log(chapterID)
    console.log('second ' + mangaTitle) */
    latestChapter = await chapterQuery(chapterID)
    console.log(mangaTitle, mangaID, latestChapter)
    return new Manga(mangaTitle, mangaID, latestChapter)
}
const formatLatestChapterID = async (mangaVolumes) => {
    const latestVolume = Object.keys(mangaVolumes).reverse()[0];
    const latestChapter = Object.keys(mangaVolumes[latestVolume].chapters).reverse()[0];
    return mangaVolumes[latestVolume]['chapters'][latestChapter].id
}

const mangaQuery = async (inputTitle) => {
    const resp = await axios({
        method: 'GET',
        url: `${baseUrl}/manga`,
        params: {
            title: inputTitle,
            ...getOrder({relevance: 'desc', followedCount: 'desc'})
        }  
    });
    const manga = await getMangaStats(resp)
    return manga
}

const newTest = async () => {
    const titles = await loadJSONFile()
    const chapArr = []
    console.log(titles.mangas)

    for (item of titles.mangas) {
        chapArr.push(await mangaQuery(item.title))
    }
    for (manga of chapArr) {
        const index = titles.mangas.findIndex((indexItem) => indexItem.title == manga.title)
        titles.mangas[index].latestChapter = manga.latestChapter  
    }
    console.log(titles.mangas)
    
}

const newTest2 = async () => {
    const titles = await loadJSONFile();

    const mangaPromises = titles.mangas.map(async (item) => {
        const manga = await mangaQuery(item.title);
        console.log({ title: manga.title, latestChapter: manga.latestChapter }) 
        return { title: manga.title, latestChapter: manga.latestChapter };
    });

    const updatedMangas = await Promise.all(mangaPromises);
    /* console.log(updatedMangas) */
    titles.mangas = titles.mangas.map((manga) => {
        const updatedManga = updatedMangas.find((updated) => updated.title === manga.title);
/*         return { ...manga, latestChapter: updatedManga.latestChapter };
 */    });
};

newTest2()