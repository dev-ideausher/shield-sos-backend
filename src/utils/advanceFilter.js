const convertCommaSeparatedToArrays = (query) => {
    const convertedQuery = {};

    for (const key in query) {
        if (query.hasOwnProperty(key)) {
            const value = query[key];

            if (typeof value === 'object' && value.in && typeof value.in === 'string' && value.in.includes(',')) {
                convertedQuery[key] = { in: value.in.split(',') };
            } else if (typeof value === 'object' && value.nin && typeof value.nin === 'string' && value.nin.includes(',')) {
                convertedQuery[key] = { nin: value.nin.split(',') };
            } else {
                convertedQuery[key] = value;
            }
        }
    }

    return convertedQuery;
}

const filteredResults = async (model, query) => {
    const queryObj = { ...query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    const convertedQuery = convertCommaSeparatedToArrays(queryObj);
    // 1B) Advanced Filtering
    let queryStr = JSON.stringify(convertedQuery);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|nin|in|ne)\b/g, match => `$${match}`);
    const totalResults = await model.countDocuments(JSON.parse(queryStr));
    return totalResults;
}

module.exports = {
    convertCommaSeparatedToArrays,
    filteredResults
}