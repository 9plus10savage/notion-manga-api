#!/usr/bin/env node

const axios = require('axios');
const path = require('path');
const { readFileSync, writeFile } = require("fs");
const { getCurrentTime } = require('./functions.js')

const baseUrl = 'https://api.mangadex.org';
const jsonPath = path.join(path.dirname(require.main.filename), 'reading_list.json');

const loadJSONFile = async (path = jsonPath) => {
    const readingListInitialLoad = readFileSync(path, 'utf8')
    return JSON.parse(readingListInitialLoad) 
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

const getMangaStats = async (id) =>  {
    const mangaID = id;
    chapterID = await getLatestChapterID(mangaID)
    return await chapterQuery(chapterID) 
}

const formatLatestChapterID = async (mangaVolumes) => {
    const latestVolume = Object.keys(mangaVolumes).reverse()[0];
    const latestChapter = Object.keys(mangaVolumes[latestVolume].chapters).reverse()[0];
    return mangaVolumes[latestVolume]['chapters'][latestChapter].id
}

const updateList = async (path, readingList, originalReadingList) => {
    readingList['lastUpdated'] = getCurrentTime()
    writeFile(path, JSON.stringify(readingList, null, 2), (err) => {
        if (err) {
            console.log("Failed to write updated data to file");
            return;
        }
        console.log(`Reading list has been updated! - ${getCurrentTime()}`);
        printUpdatedMangaList(originalReadingList.mangas, readingList.mangas) 
            });
}

  const printUpdatedMangaList = async (originalList, updatedList) => {
    updatedList.map((updatedManga, index) => {
        if (updatedManga.latestChapter !== originalList[index].latestChapter) {
            console.log('[x] ' + updatedManga.title + ' - Ch. ' + updatedManga.latestChapter)
        }
        else {
            console.log( updatedManga.title + ' - Ch. ' + updatedManga.latestChapter)
        }
    })
}  

const updateManga = async () => {
    const fullReadingList = await loadJSONFile();
    const orignalList = { ...fullReadingList};

    const updatedMangas = await Promise.all(
        fullReadingList.mangas.map(async (item) => {
            const latestChapter = await getMangaStats(item.id);
            return { id: item.id, latestChapter };
        })
    );
    
    const updatedMangasMap = new Map(updatedMangas.map(updated => [updated.id, updated]));

    fullReadingList.mangas = fullReadingList.mangas.map((mangaObject) => ({
        ...mangaObject,
        latestChapter: updatedMangasMap.get(mangaObject.id).latestChapter
    }));
    updateList(jsonPath, fullReadingList, orignalList)
};

if (typeof require !== 'undefined' && require.main === module) {
    updateManga()
}

module.exports = { updateManga, loadJSONFile }