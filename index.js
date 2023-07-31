#!/usr/bin/env node

const axios = require('axios');
const path = require('path')
const inquirer = require('inquirer');
const Manga = require('./class.js');
const { writeFile, readFile } = require("fs");
const { getCurrentTime } = require('./functions.js');


const baseUrl = 'https://api.mangadex.org';
const jsonPath = path.join(path.dirname(require.main.filename), 'reading_list.json')


const getOrder = (order = {}) => {
    const finalOrderQuery = {};
    for (const [key, value] of Object.entries(order)) {
        finalOrderQuery[`order[${key}]`] = value;
    };
    return finalOrderQuery
}

async function getMangaStats(resp)  {
    [mangaTitle, mangaID] = [resp.data.data[0].attributes.title.en, resp.data.data[0].id]
    chapterID = await getLatestChapterID(mangaID)
    latestChapter = await chapterQuery(chapterID)
    return new Manga(mangaTitle, mangaID, latestChapter)
}

 const updateList = (path, manga) => {
    let reading_list = [];
    let update_flag = false;
    readFile(path, (error, jsonString) => {
        if (error) {
            console.log(error);
            return;
        }
        try {
            reading_list = JSON.parse(jsonString)
            reading_list_titles = reading_list['mangas'].map(a => a.title)

            if (!reading_list_titles.includes(manga.title)) {
                reading_list['lastUpdated'] = getCurrentTime()
                reading_list['mangas'].push(manga)
                update_flag = !update_flag;
            } else {
                console.log("Error. Manga already exists")
            }
        } catch (err) {
            console.log("Error parsing JSON string:", err);
        }

    if (update_flag) {
        writeFile(path, JSON.stringify(reading_list, null, 2), (err) => {
        if (err) {
            console.log("Failed to write updated data to file");
            return;
        }
        console.log(`The manga ${manga.title} has been added to your reading list`);
            });
        };
    });
 };

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
    updateList(jsonPath, manga)
}

const formatLatestChapterID = async (mangaVolumes) => {
    const latestVolume = Object.keys(mangaVolumes).reverse()[0];
    const latestChapter = Object.keys(mangaVolumes[latestVolume].chapters).reverse()[0];
    return mangaVolumes[latestVolume]['chapters'][latestChapter].id
}

if (typeof require !== 'undefined' && require.main === module) {
     inquirer
     .prompt([
        {
        name: 'title',
        message: 'Please enter a search query',
        type: 'input'
        }
     ])
     .then((answers) => {
        mangaQuery(answers.title)
     })
}