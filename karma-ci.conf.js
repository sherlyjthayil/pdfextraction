module.exports = function(config) {
    "use strict";
    require("./karma.conf")(config);
    config.set({
        preprocessors: {
            "{webapp,webapp/!(test)}/!(mock*).js": ["coverage"]
        },
        coverageReporter: {
            includeAllSources: true,
            reporters: [
                {
                    type: "html",
                    dir: "coverage"
                },
                {
                    type: "text"
                }
            ],
            check: {
                each: {
                    statements: 20,
                    branches: 20,
                    functions: 20,
                    lines: 20
                }
            }
        },
        reporters: ["progress", "coverage"],
        browsers: ["ChromeHeadless"],
        singleRun: true
    });
};