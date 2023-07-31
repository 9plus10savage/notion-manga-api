#!/usr/bin/env node

const path = require('path');
const inquirer = require('inquirer');
const { writeFile, readFileSync } = require("fs");

const jsonPath = path.join(path.dirname(require.main.filename), 'reading_list.json')


 const fortnite = readFileSync(jsonPath, 'utf8', (error, jsonString) => {
        if (error) {
            console.log(error);
            return;
        }
        try {
            const readingList = JSON.parse(jsonString);
            return readingList;
        }
        catch (err) {
            console.log("Error parsing JSON string:", err);
        }

    })


console.log(fortnite)


//how tf do i get out of readFile
//