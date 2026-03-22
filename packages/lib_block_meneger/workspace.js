const os = require("os");
const fs = require("fs");
const path = require("path");

const Project = require('./main').Project
const Block = require('./block')

class Workspace extends Project {
    constructor(config = {name: 'project', version: 1}, basepath = os.tmpdir()) {
        super(config, basepath);
        this.blocks = []
        this.blockpath = path.join(this.pathproject, 'data', 'blocks')
    }

    async init() {
        await super.init();
        await fs.promises.mkdir(this.blockpath)
    }

    /**
     *
     * @param {Block} block
     * @returns {Promise<void>}
     */
    async add_block(block) {
        this.blocks.push(block)
        await block.save(this.blockpath, false, block.config.name)

    }
    set_web_config(data) {
        this.config.web_config = data;
    }

    get_web_config() {
        return this.config.web_config;
    }

    static async open(pathend, basepath = os.tmpdir()) {
        var res = await super.open(pathend, basepath);
        const list = await fs.promises.readdir(this.blockpath)
        for (let i of list)
        {
            const block = await Block.open(path.join(this.blockpath, i))
            this.blocks.push(block);
        }

    }
}
module.exports = Workspace;