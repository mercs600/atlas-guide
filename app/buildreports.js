'use strict';

const path = require('path');
const fs = require('fs');
const writePage = require(path.join(__dirname, 'utils/writepage.js'));

module.exports = function(atlasConfig, projectTree, importsGraph) {
    // Config
    const atlasBase = atlasConfig.getBase();
    const projectName = atlasConfig.getProjectInfo().name;
    const guideSrc = atlasBase.guideSrc;
    const guideDest = atlasBase.guideDest;
    const cssSrc = atlasBase.cssSrc;
    const templates = atlasBase.templates;
    const excludedCssFiles = atlasBase.excludedCssFiles;
    const excludedSassFiles = atlasBase.excludedSassFiles;

    // Models
    const projectStat = require(path.resolve(__dirname, '../models/projectcssstat.js'))(
        projectName, cssSrc, excludedCssFiles);
    const projectFileSizes = require(path.resolve(__dirname, '../models/projectfilesize.js'))(guideSrc);
    const bundle = require(path.resolve(__dirname, '../models/projectbundle.js'))(
        importsGraph, projectName, cssSrc, excludedSassFiles);

    // View Models
    const statFileWeight = require(path.resolve(__dirname, '../viewmodels/statfileweight.js'));
    const statProject = require(path.resolve(__dirname, '../viewmodels/statproject.js'));
    const statCrossDeps = require(path.resolve(__dirname, '../viewmodels/statcrossdeps.js'));
    const statImports = require(path.resolve(__dirname, '../viewmodels/statimports.js'));

    // Page configs
    const reportsPages = [{
        'id': 'bundle',
        'title': 'bundle',
        'target': path.join(guideDest, '/bundle.html'),
        'templateString': fs.readFileSync(templates.bundle, 'utf8'),
        'type': 'insights',
        'content': {
            weight: statFileWeight(projectFileSizes),
            crossDeps: statCrossDeps(importsGraph, excludedSassFiles),
            tree: bundle,
            bundleImports: statImports(importsGraph, excludedSassFiles)
        },
        'subPages': projectTree.subPages
    }, {
        'id': 'insights',
        'title': 'insights',
        'target': path.join(guideDest, '/insights.html'),
        'templateString': fs.readFileSync(templates.insights, 'utf8'),
        'type': 'insights',
        'content': statProject(projectStat, projectName),
        'subPages': projectTree.subPages
    }];

    return Promise.all(reportsPages.map(writePage));
};
