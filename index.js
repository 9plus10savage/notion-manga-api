require('dotenv').config();
const axios = require('axios')

const title = 'Kimetsu no Yaiba';

const baseUrl = 'https://api.mangadex.org';

const getData = async () => {
    const resp = await axios({
        method: 'GET',
        url: `${baseUrl}/manga`,
        params: {
            title: title
        }
        
    });
    console.log(resp.data.data[2].attributes.lastChapter)
    /* console.log(resp.data.data[0]) */
    /* console.log(resp.data.data.map(manga => manga.attributes.title)); */
}

if (typeof require !== 'undefined' && require.main === module) {
    getData();
}