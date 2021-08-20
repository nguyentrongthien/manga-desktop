const fs = require('fs');
const { dialog, app } = require('electron');
import extensions from './../extensions';

export default {
    ...extensions,
    readData : (filePath) => {
        return JSON.parse(fs.readFileSync(filePath));
    },
    writeData : (args) => {
        if(!fs.existsSync(args.path)) fs.mkdirSync(args.path, {recursive: true});
        fs.writeFileSync(args.path + '/' + args.file, JSON.stringify(args.data));
    },
    getAppPath : () => app.getPath('appData'),
    getDir : async (multiple = false) => {
        return await dialog.showOpenDialog({
            properties: multiple === true ? ['openDirectory', 'multiSelections'] : ['openDirectory']
        });
    },
    scanDir : (args) => {
        let data = [];
        let directories = fs.readdirSync(args.path, { withFileTypes: true });
        for (const dir of directories) {
            if(dir.isDirectory()) {
                try {
                    data.push(JSON.parse(fs.readFileSync(args.path + '/' + dir.name + '/' + args.fileName)));
                } catch (e) { console.log(e); }
            }
        }
        return data;
    }
}