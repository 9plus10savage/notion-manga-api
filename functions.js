const getExactMatch = mangaObject => {
    mangaID = mangaObject.data.data.find((query) => query = title).id;
    return mangaMatch = mangaObject.data.data.filter(manga => manga.id == mangaID)
}

const getTitles = mangaObject => {
    return mangaObject.data.data.map(manga => manga.attributes.title.en); 
}

const addReturnToTitles = mangaTitles => {
    mangaTitles.push('Back to search'), mangaTitles.push('Exit')
    return mangaTitles
}

const getCurrentTime = () => {
    return String(new Date()).split(" ").splice(1, 4).join(" ")
}

module.exports = { getCurrentTime, getTitles, addReturnToTitles }