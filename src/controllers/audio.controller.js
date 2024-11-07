const catchAsync = require('../utils/catchAsync');
const fs = require('fs');
const path = require('path');


const getAudioFile = catchAsync(async (req, res) => {
    const { filename } = req.params;
    console.log(`Asked to return raw audio data from file ${filename}`);
    const filePath = path.join(__dirname, 'audio', filename);

    try {
        if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'audio/wav'); // or the appropriate MIME type for your audio file
            return res.sendFile(filePath);
        } else {
            return res.status(404).send("File not found");
        }
    } catch (error) {
        console.error(`Error reading file: ${error.message}`);
        return res.status(500).send(`Error reading file: ${error.message}`);
    }
})

module.exports = {
    getAudioFile
};
