import { Skeleton } from "@mantine/core"
import * as React from "react"

import * as loginStyles from "../pages/Login.css"

import { SkeletonShell } from "./Skeletons"

/**
 * Kostra přihlašovací stránky — než se donačte kód route (`React.lazy(() => import("./Login"))`,
 * viz router.tsx), ukazuje se tahle kostra, ne obecná `PageSkeleton` (`Container` + nadpis +
 * řádky tabulky). Přihlašovací stránka nemá s tímhle tvarem nic společného: nemá navigaci
 * ani `Container`, je to jediná plovoucí karta vycentrovaná přes celou výšku okna (viz
 * `Login.css.ts` a komentář u `!authContext.isAuth` v Main.tsx) — kostra tabulky by se
 * mihla nalepená na levý okraj a obsah by pak naskočil doprostřed obrazovky.
 *
 * Sdílí přímo třídy z `Login.css.ts` (kontejner, karta, logo, pole), aby rozměry
 * neodjely od reálné stránky, kdyby se tam něco změnilo — žádná vlastní kopie čísel.
 * `Login.css.ts` neimportuje nic ze samotné (líně načítané) `Login.tsx`, takže tenhle
 * import nestrhne celou stránku do hlavního balíčku.
 */
const LoginSkeleton: React.FC = () => (
    <div className={loginStyles.loginContainer}>
        <div className={loginStyles.loginCard}>
            <SkeletonShell>
                <div className={loginStyles.logoContainer}>
                    <Skeleton circle h={90} w={90} />
                </div>
                {/* nadpis a popisek jsou v reálné stránce centrované — `mx="auto"` u užší
                    kostry drží stejný vzhled */}
                <Skeleton h={34} mb="sm" mx="auto" radius="sm" w="60%" />
                <Skeleton h={20} mb="xl" mx="auto" radius="sm" w="85%" />
                <div className={loginStyles.fieldWrapper}>
                    <Skeleton h={16} mb="xs" radius="sm" w="40%" />
                    {/* 42 px = `--input-height-md` (TextInput jede na `size="md"`, viz theme.ts) */}
                    <Skeleton h={42} radius="sm" />
                </div>
                <div className={loginStyles.fieldWrapper}>
                    <Skeleton h={16} mb="xs" radius="sm" w="25%" />
                    <Skeleton h={42} radius="sm" />
                </div>
                {/* stejná třída jako skutečné tlačítko (`width: 100%`), 42 px = `size="md"` */}
                <Skeleton className={loginStyles.submitButton} h={42} radius="sm" />
            </SkeletonShell>
        </div>
    </div>
)

export default LoginSkeleton
