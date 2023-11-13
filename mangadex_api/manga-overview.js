#!/usr/bin/env node

const { addManga } = require('./add-manga');
const { deleteManga } = require('./delete-manga');
const { updateManga, loadJSONFile } = require('./update-manga');
const {updateMangaChapterNotion} = require('../notion_api/notion-update')
const inquirer = require('inquirer')
const path = require('path')
const jsonPath = path.join(path.normalize(path.join(path.dirname(require.main.filename), '..')), 'reading_list.json')


const mangaCli = async () => {
    const choices = {
        addManga: 'Add manga',
        deleteManga: 'Delete manga',
        updateManga: 'Check for release updates',
        showMangaList: 'Display reading list',
        postToNotion: 'Sync reading list to Notion',
        exit: 'Exit'
    }

    const { choice } = await inquirer.prompt([
        {
            name: 'choice',
            message: 'Welcome to the manga reading list database, sourced from mangadex.org! Please select which functionality you wish to access:',
            type: 'list',
            choices: [choices.addManga, choices.deleteManga, choices.updateManga, choices.showMangaList, choices.postToNotion, choices.exit]
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
            case choices.updateManga:
                updateManga().then(() => {
                    return new Promise(resolve => {
                        setTimeout(() => {
                            resolve(
                                inquirer.prompt([
                                    {
                                        name: 'postToNotion',
                                        message: 'Would you like to sync the reading list to Notion?',
                                        type: 'confirm',
                                        default: false
                                    }
                                ])
                            );
                        }, 300);
                    });
                }).then(async (answers) => {
                    if (answers.postToNotion) {
                        const data = await loadJSONFile(jsonPath);
                        await updateMangaChapterNotion(data.mangas);
                    }
                });
                break;
        case choices.showMangaList:
            try {
                const { mangas } = await loadJSONFile(jsonPath);
                console.log(mangas);
            } catch (error) {
                console.error('Error loading the reading list:', error.message);
            }
            break;
        case choices.postToNotion:
            const data = await loadJSONFile(jsonPath);
            await updateMangaChapterNotion(data.mangas);
            break;
        case choices.exit:
            process.exitcode = 0
    }
};

if (require.main === module) {
    mangaCli();
}