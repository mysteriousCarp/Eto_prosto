const fs = require('fs'); // Оставляем для стримов (createWriteStream)
const path = require('path');
const os = require('os');
const archiver = require('archiver');
const unzipper = require('unzipper');
// crypto доступен глобально в новых версиях Node.js

function log(...data) {
    if (data) {
        console.log('[log]', ...data);
    }
}

class Project {
    constructor(config = {name: 'project', version: 1}, basepath = os.tmpdir()) {
        this.config = config;
        this.basepath = basepath;

        this.pathproject = path.join(basepath, this.config.name + crypto.randomUUID().replaceAll('-', '').slice(0, 10));
        log(`create project ${this.config.name} into ${this.pathproject}`);
    }

    async init() {

        await fs.promises.mkdir(this.pathproject);
        await fs.promises.mkdir(path.join(this.pathproject, 'data'));

        this.path = path.join(this.pathproject, 'data');
        await fs.promises.writeFile(path.join(this.pathproject, 'config.json'), JSON.stringify(this.config));
        log(null);
    }

    async save(pathend, del = false, name = this.config.name) {
        return new Promise(async (resolve) => {
            let stream = fs.createWriteStream(path.join(pathend, name + '.epkg'));
            let archive = archiver('zip', {
                zlib: {level: 6}
            });
            stream.once('close', async () => {
                resolve();
                if (del) {
                    await this.delete();
                }
            });
            archive.pipe(stream);
            await archive.directory(this.pathproject, false);
            await archive.finalize();
        });
    }

    async delete() {
        await fs.promises.rm(this.pathproject, {recursive: true, force: true});
        log(null);
    }

    static async open(pathend, basepath = os.tmpdir()) {
        const directory = await unzipper.Open.file(pathend);
        const configfile = await directory.files.find(f => f.path === 'config.json');
        if (configfile) {
            const configJson = (await configfile.buffer()).toString();
            const config = JSON.parse(configJson);
            const project = new this(config, basepath);
            await directory.extract({path: project.pathproject});
            return project;
        } else {
            log('config not found');
            return null;
        }
    }
}

module.exports = {Project: Project};