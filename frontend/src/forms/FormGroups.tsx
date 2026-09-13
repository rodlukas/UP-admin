import { Checkbox, Group, Modal, MultiSelect, Pill, TextInput, Title } from "@mantine/core"
import { useForm } from "@mantine/form"
import * as React from "react"

import { type AnalyticsSource, trackEvent } from "../analytics"
import { useClients, useCreateGroup, useDeleteGroup, useUpdateGroup } from "../api/hooks"
import CancelButton from "../components/buttons/CancelButton"
import DeleteButton from "../components/buttons/DeleteButton"
import SubmitButton from "../components/buttons/SubmitButton"
import GroupName from "../components/GroupName"
import InfoTooltip from "../components/InfoTooltip"
import { FormSkeleton } from "../components/Skeletons"
import { useCoursesVisibleContext } from "../contexts/CoursesVisibleContext"
import { TEXTS } from "../global/constants"
import { clientName, courseSelectError, withSelectedOptions } from "../global/utils"
import { type ModalGroupsData } from "../types/components"
import {
    type ClientType,
    type GroupPostApi,
    type GroupPostApiDummy,
    type GroupPutApi,
    type GroupType,
    type MembershipType,
} from "../types/models"
import { type fEmptyVoid } from "../types/types"

import * as styles from "./FormBase.css"
import Or from "./helpers/Or"
import { gdprInput } from "./helpers/SelectClient.css"
import SelectCourse from "./helpers/SelectCourse"
import ModalClients from "./ModalClients"

type Props = {
    /** Skupina. */
    group: GroupType | GroupPostApiDummy
    /** Funkce, která zavře modální okno s formulářem (když uživatel chce explicitně formulář zavřít). */
    funcClose: () => boolean
    /** Funkce, která zavře modální okno s formulářem (po úspěšně provedeném požadavku v rámci formuláře). */
    funcForceClose: (modalSubmitted?: boolean, data?: ModalGroupsData) => boolean
    /** Funkce, která se volá při změně údajů ve formuláři. */
    setFormDirty: fEmptyVoid
    /** Funkce, která se zavolá po úspěšném přidání skupiny (spolu s daty o skupině). */
    funcProcessAdditionOfGroup?: (newGroup: GroupType) => void
    /** Identifikace místa, odkud byl formulář otevřen (pro analytiku). */
    source: AnalyticsSource
}

/** Formulář pro skupiny. */
const FormGroups: React.FC<Props> = (props) => {
    const coursesVisibleContext = useCoursesVisibleContext()
    const isGroup = (group: Props["group"]): group is GroupType => "id" in group

    const { data: clientsData, isLoading: clientsLoading } = useClients()
    // `data === undefined`, ne `!isSuccess`: selhaný REFETCH nechá data z cache (nabídka je
    // pořád plná a použitelná), zatímco úspěšně načtený prázdný seznam chyba není
    const clientsUnavailable = clientsData === undefined
    const createGroup = useCreateGroup()
    const updateGroup = useUpdateGroup()
    const deleteGroup = useDeleteGroup()

    const getMembersOfGroup = React.useCallback((members: MembershipType[]): ClientType[] => {
        return members.map((member) => member.client)
    }, [])

    // pripravi pole se cleny ve spravnem formatu, aby slo poslat do API
    const prepareMembersForSubmit = React.useCallback(
        (members: ClientType[]): GroupPutApi["memberships"] => {
            return members.map((memberOfGroup) => ({ client_id: memberOfGroup.id }))
        },
        [],
    )

    const form = useForm({
        initialValues: {
            name: props.group.name,
            active: props.group.active,
            course: props.group.course,
            members: getMembersOfGroup(isGroup(props.group) ? props.group.memberships : []),
        },
        onValuesChange: () => props.setFormDirty(),
    })

    // stejný důvod jako u FormApplications: skrytý input Selectu neumí constraint
    // validaci, chybu proto řešíme přes `error` prop SelectCourse.
    const [triedSubmit, setTriedSubmit] = React.useState(false)

    const onSubmit = React.useCallback(
        (e: React.SyntheticEvent<HTMLFormElement>): void => {
            e.preventDefault()
            const { name, active, course, members } = form.getValues()
            if (!course) {
                setTriedSubmit(true)
                return
            }
            const courseId = course.id
            const dataPost: GroupPostApi = {
                name,
                memberships: prepareMembersForSubmit(members),
                course_id: courseId,
                active,
            }

            if (isGroup(props.group)) {
                const dataPut: GroupPutApi = { ...dataPost, id: props.group.id }
                updateGroup.mutate(dataPut, {
                    onSuccess: (response) => {
                        trackEvent("group_updated", { source: props.source })
                        if (props.funcProcessAdditionOfGroup) {
                            props.funcProcessAdditionOfGroup(response)
                        }
                        props.funcForceClose(true, { active: response.active, isDeleted: false })
                    },
                })
            } else {
                createGroup.mutate(dataPost, {
                    onSuccess: (response) => {
                        trackEvent("group_created", { source: props.source })
                        if (props.funcProcessAdditionOfGroup) {
                            props.funcProcessAdditionOfGroup(response)
                        }
                        props.funcForceClose(true, { active: response.active, isDeleted: false })
                    },
                })
            }
        },
        [form, props, createGroup, updateGroup, prepareMembersForSubmit],
    )

    const close = React.useCallback((): void => {
        props.funcClose()
    }, [props])

    const handleDelete = React.useCallback(
        (id: GroupType["id"]): void => {
            deleteGroup.mutate(id, {
                onSuccess: () => {
                    trackEvent("group_deleted", { source: props.source })
                    props.funcForceClose(true, {
                        active: form.getValues().active,
                        isDeleted: true,
                    })
                },
            })
        },
        [deleteGroup, props, form],
    )

    const processAdditionOfClient = React.useCallback(
        (newClient: ClientType): void => {
            form.setFieldValue("members", [...form.values.members, newClient])
        },
        [form],
    )

    // Sjednocení existujících klientů s aktuálními členy: čerstvě přidaný klient
    // (přes "přidat nového", viz processAdditionOfClient) ještě není v `clientsData`
    // kvůli asynchronnímu refetchi. Bez něj by MultiSelect vykreslil pill nad neznámým
    // id (Mantine pošle do renderPill option: undefined → pád) a onChange by člena tiše
    // zahodil. Sjednocením má každé vybrané id vždy odpovídající položku.
    const mergedClients = React.useMemo(
        () => withSelectedOptions(clientsData ?? [], form.values.members),
        [clientsData, form.values.members],
    )
    const mergedClientsData = React.useMemo(
        () => mergedClients.map((c) => ({ value: c.id.toString(), label: clientName(c) })),
        [mergedClients],
    )
    // lookup podle id pro `onChange` níž — s ~stovkami klientů by lineární `find()` pro každý
    // vybraný pill znamenal k×n porovnání při každé změně výběru
    const mergedClientsById = React.useMemo(
        () => new Map(mergedClients.map((c) => [c.id.toString(), c])),
        [mergedClients],
    )

    const isLoading = clientsLoading || coursesVisibleContext.isLoading
    const isSubmit = createGroup.isPending || updateGroup.isPending

    return (
        <form onSubmit={onSubmit} data-qa="form_group">
            <Modal.Header>
                <Modal.Title>
                    {isGroup(props.group) ? "Úprava" : "Přidání"} skupiny
                    {/* dvojtečka až s názvem — u prázdného formuláře by za nadpisem visela */}
                    {form.values.name.trim() !== "" && (
                        <>
                            {": "}
                            <GroupName group={{ name: form.values.name }} bold />
                        </>
                    )}
                </Modal.Title>
                <Modal.CloseButton data-qa="modal_close" />
            </Modal.Header>
            <Modal.Body>
                {isLoading ? (
                    <FormSkeleton count={4} />
                ) : (
                    <div className={styles.formContent}>
                        <div className={styles.formSection}>
                            <Title order={6} className={styles.formSectionTitle}>
                                Základní údaje
                            </Title>
                            <div className={styles.fieldStack}>
                                <div className={styles.fieldBlock}>
                                    <TextInput
                                        id="name"
                                        {...form.getInputProps("name")}
                                        label="Název skupiny"
                                        data-autofocus
                                        data-qa="group_field_name"
                                        required
                                        withAsterisk
                                        spellCheck
                                    />
                                </div>
                                <div className={styles.fieldBlock}>
                                    <SelectCourse
                                        required
                                        label="Kurz"
                                        value={form.values.course}
                                        onChangeCallback={(_name, val) => {
                                            form.setFieldValue("course", val ?? null)
                                            // zruš chybu po výběru kurzu (stejný důvod jako u FormApplications)
                                            if (val) {
                                                setTriedSubmit(false)
                                            }
                                        }}
                                        options={coursesVisibleContext.courses}
                                        error={courseSelectError(
                                            triedSubmit,
                                            Boolean(form.values.course),
                                            coursesVisibleContext,
                                        )}
                                    />
                                </div>
                                <div className={styles.fieldBlock}>
                                    <label htmlFor="members" className={styles.fieldLabel}>
                                        Členové
                                    </label>
                                    <MultiSelect
                                        id="members"
                                        data={mergedClientsData}
                                        value={form.values.members.map((m) => m.id.toString())}
                                        onChange={(vals) => {
                                            const found = vals
                                                .map((v) => mergedClientsById.get(v))
                                                .filter((c): c is ClientType => c !== undefined)
                                            form.setFieldValue("members", found)
                                        }}
                                        placeholder="Vyberte členy z existujících klientů…"
                                        searchable
                                        // Prázdný seznam po selhaném načtení není totéž jako
                                        // „žádní klienti nejsou" — bez rozlišení by admin založil
                                        // skupinu bez členů v domnění, že žádní klienti neexistují.
                                        // Samotná hláška v dropdownu na to nestačí: při ÚPRAVĚ
                                        // skupiny drží nabídku neprázdnou stávající členové
                                        // (viz `mergedClientsData`), takže by se nikdy neukázala —
                                        // proto i trvalá chyba pod polem.
                                        nothingFoundMessage={
                                            clientsUnavailable
                                                ? "Klienty se nepodařilo načíst"
                                                : TEXTS.NO_RESULTS
                                        }
                                        error={
                                            clientsUnavailable
                                                ? TEXTS.ERROR_CLIENTS_LOAD
                                                : undefined
                                        }
                                        // Mantine MultiSelect ma `input` (PillsInput wrapper s pills)
                                        // a `inputField` (vnitrni <input> kam uzivatel pise) jako 2 sloty.
                                        // V GDPR rezimu musime maskovat oba – pily uz mask maji pres renderPill,
                                        // ale vlastni search field by jinak prosvitl naepsane casti jmen klientu.
                                        classNames={{ input: gdprInput, inputField: gdprInput }}
                                        renderOption={({ option }) => (
                                            <span data-gdpr>{option.label}</span>
                                        )}
                                        renderPill={({ option, onRemove }) => (
                                            <Pill
                                                withRemoveButton
                                                onRemove={onRemove}
                                                data-qa="multiselect_pill">
                                                <span data-gdpr>{option.label}</span>
                                            </Pill>
                                        )}
                                    />
                                    <Or
                                        content={
                                            <ModalClients
                                                processAdditionOfClient={processAdditionOfClient}
                                                withOr
                                                source="groups_form"
                                            />
                                        }
                                    />
                                </div>
                                <div className={styles.fieldBlock}>
                                    <label
                                        htmlFor="active"
                                        data-qa="group_label_active"
                                        className={styles.fieldLabel}>
                                        Stav skupiny
                                    </label>
                                    <div className={styles.inlineCheckboxRow}>
                                        <Checkbox
                                            id="active"
                                            checked={form.values.active}
                                            onChange={(e) =>
                                                form.setFieldValue(
                                                    "active",
                                                    e.currentTarget.checked,
                                                )
                                            }
                                            data-qa="group_checkbox_active"
                                            label="Je aktivní"
                                        />
                                        {!form.values.active && (
                                            <InfoTooltip text="Neaktivním skupinám nelze vytvořit lekci." />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {isGroup(props.group) && (
                            <div className={`${styles.formSection} ${styles.formSectionDanger}`}>
                                <Title order={6} className={styles.formSectionTitle}>
                                    Smazání
                                </Title>
                                <div className={styles.deleteAlertText}>
                                    <p>Nenávratně smaže skupinu i s jejími lekcemi.</p>
                                    <DeleteButton
                                        content="skupinu"
                                        onClick={(): void => {
                                            if (
                                                isGroup(props.group) &&
                                                globalThis.confirm(
                                                    `Opravdu chcete smazat skupinu ${form.values.name}?`,
                                                )
                                            ) {
                                                handleDelete(props.group.id)
                                            }
                                        }}
                                        data-qa="button_delete_group"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal.Body>
            <Group justify="flex-end" px="md" pb="md" className={styles.modalActions}>
                <CancelButton onClick={close} />
                <SubmitButton
                    disabled={isLoading}
                    loading={isSubmit}
                    data-qa="button_submit_group"
                    content={isGroup(props.group) ? "Uložit" : "Přidat"}
                />
            </Group>
        </form>
    )
}

export default FormGroups
