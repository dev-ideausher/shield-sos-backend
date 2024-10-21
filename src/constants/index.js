const userRoles = ["admin", "user"];
const incidentUpdateFileTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/svg", "application/pdf", "video/quicktime", "audio/mpeg", "audio/mp3", "audio/wave", "audio/wav", "video/mp4", "video/webm"];

const dbOptions = {
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "asc"
};

const imgTypeToExtension = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
    'image/svg': 'svg',
    'image/svg+xml': 'svg+xml',
};

const docTypeToExtension = {
    'text/plain': 'txt',
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
};


const imageTypes = Object.keys(imgTypeToExtension);
const docTypes = Object.keys(docTypeToExtension);
const fileTypes = [...imageTypes, ...docTypes];

const events = {
    placeDeleted: 'placeDeleted',
};

module.exports = {
    userRoles,
    dbOptions,
    incidentUpdateFileTypes,
    fileTypes,
    events
}