const fs = require('fs');
let extensions = new Map();

export default {
    async initExtensions() {
        let directories = fs.readdirSync('./src/extensions', { withFileTypes: true });
        for (const dir of directories) {
            if(dir.isDirectory()) {
                try {
                    let tmp = await import('./' + dir.name);
                    extensions.set(dir.name, tmp.default);
                } catch (e) { console.log(e); }
            }
        }
        return this.listSources();
    },
    listSources() {
        let arr = [];
        extensions.forEach((value) => {
            arr.push(value.info);
        });
        return arr;
    },
    search() {

    },
    browse() {

    },
}