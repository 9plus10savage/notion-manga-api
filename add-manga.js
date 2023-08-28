#!/usr/bin/env node

const axios = require('axios');
const path = require('path');
const Manga = require('./class.js');
const inquirer = require('inquirer');
const { writeFile, readFile } = require("fs");
const { getCurrentTime, getTitles, addReturnToTitles } = require('./functions.js');


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

const formatLatestChapterID = async (mangaVolumes) => {
    const latestVolume = Object.keys(mangaVolumes).reverse()[0];
    const latestChapter = Object.keys(mangaVolumes[latestVolume].chapters).reverse()[0];
    return mangaVolumes[latestVolume]['chapters'][latestChapter].id
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

const mangaQuery = async (inputTitle, update = false) => {
    const resp = await axios({
        method: 'GET',
        url: `${baseUrl}/manga`,
        params: {
            title: inputTitle,
            ...getOrder({followedCount: 'desc'})
        }  
    });
    if (update) {
        const manga = await getMangaStats(resp)
        updateList(jsonPath, manga)
    } else {
        return getTitles(resp)
    }
}

const addManga = async () => {
    const mangaTitles = await inquirer
        .prompt([
            {
            name: 'query',
            message: 'Please enter a search query:',
            type: 'input'
            }
        ])
        .then(async function (answers) {
            return await mangaQuery(answers.query)
        })
    const selectedManga = await inquirer   
        .prompt([
            {
            name: 'manga',
            message: 'Please select which manga to add!',
            type: 'list',
            choices: addReturnToTitles(mangaTitles)
            }
        ])
        .then(async function (answers) {
            return answers.manga
        });
        
        switch(selectedManga) {
            case 'Back to search':
                addManga();
                break;
            case 'Exit':
                process.exitCode = 1;
                break;
           default:
                mangaQuery(selectedManga, true)
        }
}

if (typeof require !== 'undefined' && require.main === module) {
    addManga()
}

module.exports = { addManga }