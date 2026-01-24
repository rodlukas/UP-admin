import * as React from "react"

/** Obecný model, ze kterého vychází všechny entity/modely (mají ID). */
export type Model = {
    id: number
}

/** Chybová zpráva zobrazená uživateli. */
export type ErrMsg = React.ReactElement | string

/** React prop pro QA (využívá Selenium). */
export type QA = {
    "data-qa"?: string
}

/** Typ reprezentující timeoutID při použití setTimeout. */
export type TimeoutType = number | undefined

/* *************************************************************************************************
Utility.
************************************************************************************************* */

/**
 * Všechny atributy kromě zadaných K nastaví jako volitelné.
 *
 * Příklad: AtLeast<{model: string, rel: string, title: string}, "model" | "rel">
 * Viz: https://stackoverflow.com/a/57390160/10045971
 */
type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>

/** Připraví Model pro PATCH operace - zafixuje pomocí AtLeast atribut id. */
export type PatchType<T extends Model> = AtLeast<T, "id">

/* *************************************************************************************************
Typy funkcí.
************************************************************************************************* */

/** Funkce bez parametrů a návratové hodnoty. */
export declare type fEmptyVoid = () => void

/** Funkce bez parametrů s jakoukoliv návratovou hodnotou. */
export declare type fEmptyReturn = () => any

/** Funkce s různým počtem parametrů bez návratové hodnoty. */
export declare type fArgVoid = (...args: any[]) => void

/** Funkce s různým počtem parametrů s jakoukoliv návratovou hodnotou. */
export declare type fArgReturn = (...args: any[]) => any

/** Funkce bez bližšího určení parametrů a návratové hodnoty. */
export declare type fFunction = fEmptyVoid | fEmptyReturn | fArgVoid | fArgReturn
