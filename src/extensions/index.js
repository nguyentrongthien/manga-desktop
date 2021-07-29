const fs = require('fs');
let extensions = new Map();

export default {
    async initExtensions() {
        let directories = fs.readdirSync('./src/extensions', { withFileTypes: true });
        for (const dir of directories) {
            if(dir.isDirectory()) {
                let tmp = await import('./' + dir.name);
                extensions.set(dir.name, tmp.default);
            }
        }
        return extensions.size;
    },
    listSources() {
        let arr = [];
        extensions.forEach((value) => {
            arr.push(value.name);
        });
        return arr;
    },
    search() {

    },
    browse() {

    },
}