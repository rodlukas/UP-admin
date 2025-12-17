module.exports = {
    setupFilesAfterEnv: ["./jest.setup.ts"],
    moduleNameMapper: {
        "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
            "<rootDir>/__mocks__/fileMock.js",
        "\\.(css|less)$": "<rootDir>/__mocks__/styleMock.js",
    },
    testEnvironment: "jsdom",
    // axios je psan v ES modules, takze musime ignorovat transformaci
    transformIgnorePatterns: ["node_modules/(?!(axios)/)"],
}
