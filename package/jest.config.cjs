module.exports = {
    preset: "ts-jest",
    testEnvironment: "jsdom",
    transform: {
        "^.+\\.ts?$": "ts-jest",
    },
    setupFiles: ['./jest.polyfills.js'],
    testEnvironmentOptions: {
        customExportConditions: [''],
    },    
    transformIgnorePatterns: ["<rootDir>/node_modules/"],
    reporters: [
        "default",
        ["./node_modules/jest-html-reporter", {
            "pageTitle": "Test Report"
        }]
    ]
};
