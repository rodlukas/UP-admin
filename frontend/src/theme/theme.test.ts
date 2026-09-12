import { theme } from "./theme"

/**
 * Pravidlo „žádný text pod 1 rem" drží `theme.ts` dvěma nezávislými způsoby a ani jeden
 * z nich dosud nic nehlídalo: component testy mountují `MantineProvider` a na téhle
 * konfiguraci jim nezáleží, takže její smazání prošlo celou sadou bez jediného selhání.
 *
 * Testuje se konfigurace přímo, ne vyrenderovaná velikost písma — ta by v jsdom stejně
 * závisela na tom, jestli se načetl Mantine CSS, což se v testech neděje.
 */

/** Komponenty, u kterých je `size` velikost PÍSMA, takže musí být `md` (= 1 rem). */
const TEXT_SIZED_COMPONENTS = [
    "Button",
    "TextInput",
    "Textarea",
    "Checkbox",
    "Pagination",
    "Select",
    "NumberInput",
]

test("the xs/sm font sizes are remapped up to 1rem", () => {
    // xs/sm jsou Mantine defaulty pod 1rem - remap je jediné, co drží text v celé aplikaci
    // (včetně komponent bez `size` defaultu, např. Alert) na čitelné velikosti
    expect(theme.fontSizes?.xs).toBe("1rem")
    expect(theme.fontSizes?.sm).toBe("1rem")
})

test.each(TEXT_SIZED_COMPONENTS)("%s defaults to size md so its text stays at 1rem", (name) => {
    const component = theme.components?.[name]
    // `undefined` by znamenalo Mantine default `sm`, který je po remapu sice 1rem, ale jen
    // shodou okolností - záměr je explicitní `md`
    expect(component?.defaultProps).toMatchObject({ size: "md" })
})

// `ActionIcon` je záměrná výjimka: `size` je tam rozměr ikonové plochy, ne velikost písma
// (viz komentář v theme.ts). Kdyby mu někdo `md` doplnil "pro konzistenci", rozbil by tím
// výšku řádků v tabulkách.
test("ActionIcon deliberately has no size default", () => {
    expect(theme.components?.ActionIcon?.defaultProps ?? {}).not.toHaveProperty("size")
})
