const searchQuery = (query, fieldName) => {
    let QStringList = query.split(" ").map(s => {
        var o = {};
        o[fieldName] = {
            $regex: s,
            $options: "i"
        }
        return o;
    });

    return QStringList;
}

module.exports = {
    searchQuery
}