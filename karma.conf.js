module.exports = function(config) {
    config.set({
        basePath: '../..',
        frameworks: ['jasmine'],
        //...
        logLevel: config.LOG_INFO,
        //logLevel: config.LOG_DEBUG,
        //browsers: ["Chrome"],
        browsers: ["PhantomJS2"],
        basePath: ".",
        files: [
            "node_modules/angular/angular.js",
            "node_modules/angular-mocks/angular-mocks.js",
            "ds-angular-nested-json-to-table.js",
            "tests/*.js"
        ],
        autoWatch: true,
        autoWatchBatchDelay: 250, //default
        singleRun: true //Continuous Integration mode with an exit code of 0 or 1

    });
};