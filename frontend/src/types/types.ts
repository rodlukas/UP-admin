import { Location } from "history"
import * as React from "react"
import { RouteProps, StaticContext } from "react-router"
import { RouteComponentProps } from "react-router-dom"

export type Model = {
    id: number
}

export type ErrMsg = React.ReactElement | string

export type CustomRouteProps = RouteProps & {
    title: string
}

export type QA = {
    "data-qa"?: string
}

export type TimeoutType = number | undefined

// viz https://stackoverflow.com/a/59857898/10045971
export type CustomRouteComponentProps<Params = {}> = RouteComponentProps<
    Params,
    StaticContext,
    LocationState
>
type LocationState = {
    from: Location
}

export declare type fEmptyVoid = () => void
export declare type fEmptyReturn = () => any
export declare type fArgVoid = (...args: any[]) => void
export declare type fArgReturn = (...args: any[]) => any
export declare type fFunction = fEmptyVoid | fEmptyReturn | fArgVoid | fArgReturn

/**
 * Všechny atributy kromě zadaných K nastaví jako volitelné.
 *
 * Příklad: AtLeast<{model: string, rel: string, title: string}, "model" | "rel">
 * Viz: https://stackoverflow.com/a/57390160/10045971
 */
type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>

/** Připraví Model pro PATCH operace - zafixuje pomocí AtLeast atribut id. */
export type PatchType<T extends Model> = AtLeast<T, "id">
