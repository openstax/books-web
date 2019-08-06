const fs = require('fs')
const path = require('path')
const pify = require('pify')
const glob = require('glob')

const jsGlobPattern = '../build/static/**/*.js'
const sourcemapString = '//# sourceMappingURL='

const toRelPath = (file) => path.relative(process.cwd(), file)

async function run() {
    const files = await pify(glob)(path.join(__dirname, jsGlobPattern))

    for (const filename of files) {
        const contents = fs.readFileSync(filename, 'utf-8')
        const index = contents.search(sourcemapString)
        if (index < 0) {
            throw new Error(`BUG: Sourcemap not found! file='${toRelPath(filename)}'`)
        }
        const mapFilename = contents.substring(index + sourcemapString.length).split('\n')[0]
        const mapPath = path.join(path.dirname(filename), mapFilename)
        const mapSource = JSON.parse(fs.readFileSync(mapPath))

        mapSource.sources.forEach((sourceFilename, index) => {
            const sourcePath = path.join(path.dirname(mapPath), sourceFilename)
            if (!fs.existsSync(sourcePath)) {
                if (!mapSource.sourcesContent[index]) {
                    console.error(`Unable to find source='${toRelPath(sourcePath)}' from '${toRelPath(mapPath)}' from '${toRelPath(filename)}`)
                    console.error(`Here are the relative paths: '${sourceFilenameRel}' from '${mapFilename}' from '${filename}'`)
                    throw new Error(`BUG: Could not find source file`)
                }
            }
        })
    }

    if (files.length === 0) {
        throw new Error(`BUG: Could not find js files to verify .map files exist. Check that '${jsGlobPattern}' still matches the JS files`)
    }
}


run().then(null, (err) => { console.error(err); process.exit(112); })