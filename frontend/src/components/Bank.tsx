import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Box, Table, Text, Title, Tooltip } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import {
    faExclamationCircle,
    faExternalLink,
    faInfoCircle,
    faSyncAlt,
} from "@rodlukas/fontawesome-pro-solid-svg-icons"
import classNames from "classnames"
import * as React from "react"

import { useBank } from "../api/hooks"
import { BANKING_URL } from "../global/constants"
import { isToday, prettyDateWithDayYearIfDiff } from "../global/funcDateTime"
import { tableFlat } from "../global/surfaces.css"
import { bold, iconDanger, inlineBlockNowrap, nowrap } from "../global/utility.css"
import { prettyAmount } from "../global/utils"
import { BankType, BankSuccessType, BankErrorType } from "../types/models"

import * as styles from "./Bank.css"
import CustomButton from "./buttons/CustomButton"
import NoInfo from "./NoInfo"

/** Type guard pro úspěšná bankovní data. */
function isBankSuccess(data: BankType | undefined): data is BankSuccessType {
    return !!data && "accountStatement" in data
}

/** Type guard pro chybovou odpověď banky (akceptuje i undefined). */
function isBankError(data: BankType | undefined): data is BankErrorType {
    return !!data && typeof data === "object" && "error_info" in data
}

/** Doba, po kterou nelze ručně provést opakované načtení dat z API. */
const REFRESH_TIMEOUT = 60 // sekundy

type TableInfoProps = {
    /**  Text k zobrazení. */
    text?: string
    /** Počet sloupců tabulky (na úzkých displejích je sloupec „Zpráva pro příjemce" skrytý). */
    colSpan: number
}

/** Pomocná komponenta pro výpis hlášky místo transakcí v tabulce. */
const TableInfo: React.FC<TableInfoProps> = ({ text, colSpan }) => (
    <Table.Tr>
        <Table.Td colSpan={colSpan} ta="center" c="dimmed">
            {text}
        </Table.Td>
    </Table.Tr>
)

/** Komponenta zobrazující přehled transakcí z banky. */
const Bank: React.FC = () => {
    const { data: bankData, isLoading, refetch, isFetching } = useBank()
    // Na úzkých displejích (telefon) se skryje sloupec „Zpráva pro příjemce", aby zbyla
    // šířka na „Suma" — tu je bez horizontálního scrollu jinak vidět jen zpola. Stejný
    // princip jako skrývání vedlejších sloupců v tabulce klientů.
    // `getInitialValueInEffect: false` — aplikace běží jen CSR, sloupce potřebujeme
    // rozhodnout už při prvním renderu, jinak by tabulka problikla v plné šířce.
    const isNarrow = useMediaQuery("(max-width: 36em)", false, { getInitialValueInEffect: false })
    const columnCount = isNarrow ? 3 : 4
    /** Manuální obnovení dat je zakázané (true). */
    const [isRefreshDisabled, setIsRefreshDisabled] = React.useState(true)
    const timeoutIdRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

    React.useEffect(() => {
        // po zadanem poctu sekund povol tlacitko refresh
        timeoutIdRef.current = globalThis.setTimeout(
            () => setIsRefreshDisabled(false),
            REFRESH_TIMEOUT * 1000,
        )
        return () => {
            if (timeoutIdRef.current !== undefined) {
                globalThis.clearTimeout(timeoutIdRef.current)
            }
        }
    }, [bankData])

    const onClick = React.useCallback((): void => {
        setIsRefreshDisabled(true)
        void refetch()
    }, [refetch])

    const isSuccess = isBankSuccess(bankData)
    const isLackOfMoney =
        isSuccess && bankData.accountStatement.info.closingBalance < bankData.rent_price
    const isEnoughMoney = isSuccess && !isLackOfMoney
    const isLoadingState = isLoading || isFetching

    const getBalanceText = (): React.ReactNode => {
        if (!isSuccess) {
            return isLoadingState ? "načítání" : "neznámý"
        }
        return (
            <span className={`${nowrap} ${bold}`}>
                {prettyAmount(bankData.accountStatement.info.closingBalance)}
            </span>
        )
    }

    const renderTableBody = (data: BankSuccessType): React.ReactNode => {
        if (data.accountStatement.transactionList.transaction.length === 0 && !isLoadingState) {
            return <TableInfo text="Žádné nedávné transakce" colSpan={columnCount} />
        }

        return data.accountStatement.transactionList.transaction.map((transaction) => {
            const date = new Date(transaction.column0.value.split("+")[0])
            const amount = transaction.column1.value
            const messageObj = transaction.column16
            const id = transaction.column22.value
            const commentObj = transaction.column25
            const duplicates = messageObj && messageObj.value === commentObj?.value
            // Na úzkém displeji sloupec zprávy neexistuje, takže se ani nespojuje buňka
            // poznámky (colSpan) a zpráva se nevykresluje jako vlastní sloupec.
            const showMessageColumn = !duplicates && !isNarrow
            // Náhrada za chybějící sloupec: bez podřádku by transakce, jejíž jediný
            // identifikující text nese právě zpráva (poznámka i vlastník protiúčtu chybí),
            // skončila jako řádek bez jakéhokoli textu. Podřádek přes celou šířku zprávu
            // ukáže vždycky, ne jen v tomhle nejhorším případě.
            const showMessageRow = isNarrow && !duplicates && !!messageObj
            const targetAccountOwnerObj = transaction.column10
            const rowClassName = isToday(date) ? styles.bankRowToday : undefined
            return (
                <React.Fragment key={id}>
                    <Table.Tr className={rowClassName}>
                        <Table.Td
                            colSpan={duplicates && !isNarrow ? 2 : undefined}
                            data-gdpr
                            data-qa="bank_account_owner">
                            {commentObj?.value ??
                                (targetAccountOwnerObj?.value ? (
                                    `Vlastník protiúčtu: ${targetAccountOwnerObj.value}`
                                ) : (
                                    <NoInfo />
                                ))}
                        </Table.Td>
                        {showMessageColumn && (
                            <Table.Td data-gdpr data-qa="bank_transaction_message">
                                {messageObj ? messageObj.value : <NoInfo />}
                            </Table.Td>
                        )}
                        <Table.Td ta="right" className={`${styles.bankDateColumn} ${nowrap}`}>
                            {prettyDateWithDayYearIfDiff(date, true)}
                        </Table.Td>
                        <Table.Td
                            ta="right"
                            className={classNames(styles.bankAmountColumn, nowrap, bold, {
                                [styles.bankDangerText]: amount < 0,
                            })}>
                            {prettyAmount(amount)}
                        </Table.Td>
                    </Table.Tr>
                    {showMessageRow && (
                        <Table.Tr className={rowClassName}>
                            <Table.Td
                                colSpan={columnCount}
                                data-gdpr
                                data-qa="bank_transaction_message"
                                className={styles.bankMessageRow}>
                                {messageObj?.value}
                            </Table.Td>
                        </Table.Tr>
                    )}
                </React.Fragment>
            )
        })
    }

    const renderMainContent = (): React.ReactNode => {
        if (isBankSuccess(bankData)) {
            return (
                <Table.ScrollContainer minWidth={isNarrow ? 280 : 400}>
                    <Table className={tableFlat}>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Poznámka</Table.Th>
                                {!isNarrow && <Table.Th>Zpráva pro příjemce</Table.Th>}
                                <Table.Th ta="right">Datum</Table.Th>
                                <Table.Th ta="right">Suma</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>{renderTableBody(bankData)}</Table.Tbody>
                    </Table>
                </Table.ScrollContainer>
            )
        }
        if (isBankError(bankData)) {
            return (
                <Text className={styles.bankDangerText} ta="center">
                    {bankData.error_info}
                </Text>
            )
        }
        return null
    }

    return (
        <div className={styles.bankWrapper}>
            <Box
                className={classNames(styles.bankTitle, {
                    [styles.bankTitleSuccess]: isEnoughMoney,
                    [styles.bankTitleWarning]: isLackOfMoney,
                })}>
                <div className={styles.bankTitleInner}>
                    <div>
                        <div className={styles.bankBalanceLabel}>Stav účtu</div>
                        <Title
                            order={3}
                            size="h4"
                            className={classNames(styles.bankBalance, inlineBlockNowrap)}>
                            {getBalanceText()}{" "}
                            {isLackOfMoney && (
                                <Tooltip
                                    label={`Na účtu není dostatek peněz (alespoň ${prettyAmount(bankData.rent_price)}) pro zaplacení nájmu!`}
                                    // focus + tabIndex: obsah tooltipu musí být dosažitelný
                                    // i z klávesnice (WCAG 1.4.13)
                                    events={{ hover: true, focus: true, touch: true }}>
                                    {/* eslint-disable jsx-a11y/no-noninteractive-tabindex --
                                    trigger tooltipu musí být fokusovatelný, jinak je obsah
                                    jen pro myš (WAI-ARIA tooltip pattern); bloková forma,
                                    protože -next-line nedosáhne na atribut o 2 řádky níž */}
                                    <span
                                        tabIndex={0}
                                        role="img"
                                        aria-label="Varování: nedostatek peněz na zaplacení nájmu">
                                        {/* eslint-enable jsx-a11y/no-noninteractive-tabindex */}
                                        <FontAwesomeIcon
                                            icon={faExclamationCircle}
                                            className={iconDanger}
                                            size="lg"
                                            aria-hidden
                                        />
                                    </span>
                                </Tooltip>
                            )}
                        </Title>
                    </div>
                    <div className={styles.bankActions}>
                        <Tooltip
                            label={
                                isRefreshDisabled
                                    ? `Výpis lze obnovit jednou za minutu`
                                    : "Obnovit výpis"
                            }>
                            <span>
                                <CustomButton
                                    onClick={onClick}
                                    disabled={isRefreshDisabled}
                                    aria-label="Obnovit výpis"
                                    content={
                                        <FontAwesomeIcon
                                            icon={faSyncAlt}
                                            size="lg"
                                            spin={isLoadingState}
                                            aria-hidden
                                        />
                                    }
                                />
                            </span>
                        </Tooltip>
                    </div>
                </div>
            </Box>
            <div className={styles.bankContent}>
                {renderMainContent()}
                <Text c="dimmed" ta="center" mt="sm">
                    <FontAwesomeIcon icon={faInfoCircle} />{" "}
                    <span>
                        Transakce starší než <strong>30 dnů</strong> lze zobrazit pouze{" "}
                    </span>
                    <a href={BANKING_URL} target="_blank" rel="noopener noreferrer">
                        v bankovnictví <FontAwesomeIcon icon={faExternalLink} size="xs" />
                    </a>
                    <span>.</span>
                </Text>
            </div>
        </div>
    )
}

export default Bank
