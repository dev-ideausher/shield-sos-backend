const userRoles = ["superadmin", "admin", "super_distributor", "distributor", "retailer"];
const incidentUpdateFileTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/svg", "application/pdf", "video/quicktime", "audio/mpeg", "audio/mp3", "audio/wave", "audio/wav", "video/mp4", "video/webm"];

const dbOptions = {
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "asc"
};

module.exports = {
    userRoles,
    dbOptions,
    incidentUpdateFileTypes
}