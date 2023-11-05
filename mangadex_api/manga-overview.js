#!/usr/bin/env node

const { addManga } = require('./add-manga');
const { deleteManga } = require('./delete-manga');
const { updateManga, loadJSONFile } = require('./update-manga');
const inquirer = require('inquirer')
const path = require('path')
const jsonPath = path.join(path.normalize(path.join(path.dirname(require.main.filename), '..')), 'reading_list.json')


const mangaCli = async () => {
    const choices = {
        addManga: 'Add manga',
        deleteManga: 'Delete manga',
        updateManga: 'Check for release updates',
        showMangaList: 'Display reading list',
        exit: 'Exit'
    }

    const { choice } = await inquirer.prompt([
        {
            name: 'choice',
            message: 'Welcome to the manga reading list database, sourced from mangadex.org! Please select which functionality you wish to access:',
            type: 'list',
            choices: [choices.addManga, choices.deleteManga, choices.updateManga, choices.showMangaList, choices.exit]
        }
    ]);

    switch (choice) {
        case choices.addManga:
            await addManga();
            break;
        case choices.deleteManga:
            await deleteManga();
            break;
        case choices.updateManga:
            await updateManga();
            break;
        case choices.showMangaList:
            try {
                const { mangas } = await loadJSONFile(jsonPath);
                console.log('last fire mbyy')
                console.log(mangas);
            } catch (error) {
                console.error('Error loading the reading list:', error.message);
            }
            break;
        case choices.exit:
            process.exitcode = 0
    }
};

if (require.main === module) {
    mangaCli();
}