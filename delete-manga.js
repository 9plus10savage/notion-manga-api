#!/usr/bin/env node

const path = require('path');
const inquirer = require('inquirer');
const { writeFileSync, readFileSync } = require("fs");

const jsonPath = path.join(path.dirname(require.main.filename), 'reading_list.json')


const loadJSONFile = async (path) => {
    const readingListInitialLoad = readFileSync(path, 'utf8')
    return JSON.parse(readingListInitialLoad) 
}

const updateList = async (readingList) => {
    writeFileSync(jsonPath, JSON.stringify(readingList, null, 2))
    console.log('Manga has been deleted!')
}

const removeMangaFromList = (mangaToDelete, readingList) => {
    const mangaIndex = readingList.mangas.findIndex((manga) => manga.title == mangaToDelete) 
    if (mangaIndex !== -1) {
        readingList.mangas.splice(mangaIndex, 1) 
        updateList(readingList)
    }
}

const deleteManga = async () => {
    const readingList = await loadJSONFile(jsonPath);
    const mangaTitles = readingList.mangas.map((manga) => manga.title);
    
    const mangaToDelete = await inquirer
        .prompt([
            {
            name: 'manga',
            message: 'Please select which manga to delete from your reading list:',
            type: 'list',
            choices: [...mangaTitles, 'Exit']
            }
        ])
        .then((answers) => {
            const selectedMangaUnlessExit = answers.manga !== 'Exit' ? answers.manga: process.exit()
            return selectedMangaUnlessExit
        });
        
    const mangaDeletionConfirmed = await inquirer
        .prompt([
            {
            name: 'confirmation',
            message: `Are you sure you want to delete manga '${mangaToDelete}' from your reading list?`,
            type: 'confirm',
            }
        ])
        .then((answers) => {
            return answers.confirmation
        })

        mangaDeletionConfirmed ? removeMangaFromList(mangaToDelete, readingList) : await deleteManga() 
}

if (typeof require !== 'undefined' && require.main === module) {
    deleteManga()
}

module.exports = { deleteManga }