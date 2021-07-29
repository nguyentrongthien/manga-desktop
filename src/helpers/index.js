const fs = require('fs');
const { dialog } = require('electron');
import extensions from './../extensions';

export default {
    ...extensions,
    readData : (filePath) => {
        try {
            return JSON.parse(fs.readFileSync(filePath));
        } catch(e) { console.log(e); }
    },
    writeData : (args) => {
        try {
            fs.writeFileSync(args.path, JSON.stringify(args.data));
        } catch(e) { console.log(e); }
    },
    getDir : async (multiple = false) => {
        return await dialog.showOpenDialog({
            properties: multiple === true ? ['openDirectory', 'multiSelections'] : ['openDirectory']
        });
    },
}