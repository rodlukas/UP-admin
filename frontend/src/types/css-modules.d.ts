// TypeScript deklarace pro CSS Modules
// Tento soubor umožní TypeScriptu rozpoznat importy CSS Modules
// a poskytne autocomplete a type checking pro CSS třídy

declare module "*.module.css" {
    const classes: Readonly<Record<string, string>>
    export default classes
}
