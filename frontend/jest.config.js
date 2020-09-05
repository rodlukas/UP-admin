// pro kompletni podporu jazyku v node (napr. date.toLocaleString)
process.env.NODE_ICU_DATA = "node_modules/full-icu"

module.exports = {
    setupFilesAfterEnv: ["./jest.setup.ts"],
}
