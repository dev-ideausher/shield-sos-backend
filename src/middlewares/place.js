const httpStatus = require('http-status');

const { placeService } = require('../services');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const checkOwnership = catchAsync(async (req, res, next) => {
    const { placeId } = req.params;
    const place = await placeService.getPlaceById(placeId, true);
    if (!place.createdBy.equals(req.user._id))
        throw new ApiError(httpStatus.FORBIDDEN, 'You are not allowed to perform this action');
    res.locals.place = place;
    next();
});

module.exports = { checkOwnership };
