const fs = require('fs')
const path = require('path')
const os = require('os');
const archiver = require('archiver');
const unzipper = require('unzipper')
// async function createProject(pathproject, name)
// {
//     await fs.mkdir(path.join(pathproject, name), console.log)
//     await fs.writeFile(path.join(pathproject, name, 'config.json'), JSON.stringify({'name': name, 'version': '1'}), console.log)
// }
// createProject('C:\\Users\\Carp\\WebstormProjects\\lib_block_meneger', '2testproject')

function log(...data) {
    if (data) {
        console.log('[log]', ...data)
    }
}
class Project {
    constructor(config = {name: 'project', version: 1}, basepath = os.tmpdir()) {
        this.config = config
        this.basepath = basepath;


        this.pathproject = path.join(basepath, this.config.name + crypto.randomUUID().replaceAll('-', '').slice(0, 10));
        log(`create project ${this.config.name} into ${this.pathproject}`)
    }

    async init() {
        await fs.mkdir(this.pathproject, log);
        await fs.mkdir(path.join(this.pathproject, 'data'), log)
        this.path = path.join(this.pathproject, 'data')
        await fs.writeFile(path.join(this.pathproject, 'config.json'), JSON.stringify({
            'name': this.config.name,
            'version': this.config.version
        }), log);
    }

    async save(pathend, del = false, name = this.config.name) {
        return new Promise(async (resolve) => {
            let stream = fs.createWriteStream(path.join(pathend, name + '.epkg'))
            let archive = archiver('zip', {
                zlib: {level: 6}
            });
            stream.once('close', async () => {
                resolve();
                if (del) {
                    await this.delete();
                }
            })
            archive.pipe(stream);
            await archive.directory(this.pathproject, false);
            await archive.finalize();

        })
    }

    async delete() {
        await fs.rm(this.pathproject, {recursive: true, force: true}, log);
    }

    static async open(pathend, basepath = os.tmpdir()) {
        const directory = await unzipper.Open.file(pathend);
        const configfile = await directory.files.find(f => f.path === 'config.json')
        if (configfile) {
            const configJson = (await configfile.buffer()).toString();
            const config = JSON.parse(configJson);
            const project = new this({name: config.name, version: config.version}, basepath);
            await directory.extract({path: project.pathproject});
            return project
        } else {
            log('config not found')
            return null
        }

    }
}
module.exports = {Project: Project}
// let pr = new Project({name: 'проектик'});
// (async () => {
//     await pr.init();
//     log(pr.pathproject);
//     await pr.save(path.join('C:\\Users\\Carp\\Desktop'), true);
//     const pr2 = await Project.open(path.join('C:\\Users\\Carp\\Desktop\\проектик.epkg'), path.join('C:\\Users\\Carp\\Desktop'))
// })();