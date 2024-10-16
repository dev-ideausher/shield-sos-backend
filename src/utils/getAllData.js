const APIFeatures = require("./apiFeatures");
const { filteredResults } = require("./advanceFilter");


async function getAllData(model, query, populateConfig) {
    const page = query.page && parseInt(query.page, 10) > 0 ? parseInt(query.page, 10) : 1;
    const limit = query.limit && parseInt(query.limit, 10) > 0 ? parseInt(query.limit, 10) : 10;

    let dataQuery = model.find({});

    // Apply population dynamically based on the provided configuration
    if (populateConfig) {
        populateConfig.forEach(({ path, select, subPopulate }) => {
            const populateOptions = { path, select };
            if (subPopulate) {
                populateOptions.populate = subPopulate;
            }
            dataQuery = dataQuery.populate(populateOptions);
        });
    }

    let data = new APIFeatures(dataQuery, query).filter().sort().paginate();
    data = await data.query.lean(); // Fix: use the result of the chained methods

    const totalResults = await filteredResults(model, query)
    const totalPages = Math.ceil(totalResults / limit);

    return {
        page,
        limit,
        results: data,
        totalPages,
        totalResults,
    };
}

module.exports = {
    getAllData
}