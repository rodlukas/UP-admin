import {
    Checkbox,
    Group,
    Modal,
    MultiSelect,
    Pill,
    SimpleGrid,
    TextInput,
    Title,
} from "@mantine/core"
import { useForm } from "@mantine/form"
import * as React from "react"

import { AnalyticsSource, trackEvent } from "../analytics"
import { useClients, useCreateGroup, useDeleteGroup, useUpdateGroup } from "../api/hooks"
import CancelButton from "../components/buttons/CancelButton"
import DeleteButton from "../components/buttons/DeleteButton"
import SubmitButton from "../components/buttons/SubmitButton"
import GroupName from "../components/GroupName"
import InfoTooltip from "../components/InfoTooltip"
import Loading from "../components/Loading"
import { useCoursesVisibleContext } from "../contexts/CoursesVisibleContext"
import { clientName } from "../global/utils"
import { ModalGroupsData } from "../types/components"
import {
    ClientType,
    GroupPostApi,
    GroupPostApiDummy,
    GroupPutApi,
    GroupType,
    MembershipType,
} from "../types/models"
import { fEmptyVoid } from "../types/types"

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

    const { data: clientsData = [], isLoading: clientsLoading } = useClients()
    const createGroup = useCreateGroup()
    const updateGroup = useUpdateGroup()
    const deleteGroup = useDeleteGroup()

    // přepraví pole se členy ve správném formátu
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

    // Po pokusu o odeslání s prázdným povinným kurzem (skrytý input Selectu neumí constraint
    // validaci, reportValidity je no-op) zobrazíme chybu přes `error` prop SelectCourse.
    const [triedSubmit, setTriedSubmit] = React.useState(false)

    const onSubmit = React.useCallback(
        (e: React.SyntheticEvent<HTMLFormElement>): void => {
            e.preventDefault()
            const { name, active, course, members } = form.getValues()
            // pojistka: bez vybraneho kurzu neodesilame a zobrazime chybu u SelectCourse
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
    const clientsById = React.useMemo(() => {
        const byId = new Map<string, ClientType>()
        clientsData.forEach((c) => byId.set(c.id.toString(), c))
        form.values.members.forEach((m) => {
            const id = m.id.toString()
            if (!byId.has(id)) {
                byId.set(id, m)
            }
        })
        return byId
    }, [clientsData, form.values.members])

    const isLoading = clientsLoading || coursesVisibleContext.isLoading
    const isSubmit = createGroup.isPending || updateGroup.isPending

    return (
        <form onSubmit={onSubmit} data-qa="form_group">
            <Modal.Header>
                <Modal.Title>
                    {isGroup(props.group) ? "Úprava" : "Přidání"} skupiny:{" "}
                    <GroupName group={{ name: form.values.name }} bold />
                </Modal.Title>
                <Modal.CloseButton />
            </Modal.Header>
            <Modal.Body>
                {isLoading ? (
                    <Loading />
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
                                        value={form.values.name}
                                        onChange={(e) =>
                                            form.setFieldValue("name", e.currentTarget.value)
                                        }
                                        label="Název skupiny"
                                        data-autofocus
                                        data-qa="group_field_name"
                                        required
                                        withAsterisk
                                        spellCheck
                                    />
                                </div>
                                <div className={styles.fieldBlock}>
                                    <label htmlFor="course" className={styles.fieldLabel}>
                                        Kurz
                                    </label>
                                    <SelectCourse
                                        required
                                        value={form.values.course}
                                        onChangeCallback={(_name, val) =>
                                            form.setFieldValue("course", val ?? null)
                                        }
                                        options={coursesVisibleContext.courses}
                                        error={
                                            triedSubmit && !form.values.course
                                                ? "Vyberte kurz"
                                                : undefined
                                        }
                                    />
                                </div>
                                <div className={styles.fieldBlock}>
                                    <label htmlFor="members" className={styles.fieldLabel}>
                                        Členové
                                    </label>
                                    <MultiSelect
                                        id="members"
                                        data={[...clientsById.values()].map((c) => ({
                                            value: c.id.toString(),
                                            label: clientName(c),
                                        }))}
                                        value={form.values.members.map((m) => m.id.toString())}
                                        onChange={(vals) => {
                                            const found = vals
                                                .map((v) => clientsById.get(v))
                                                .filter((c): c is ClientType => c !== undefined)
                                            form.setFieldValue("members", found)
                                        }}
                                        placeholder="Vyberte členy z existujících klientů…"
                                        searchable
                                        // Mantine MultiSelect ma `input` (PillsInput wrapper s pills)
                                        // a `inputField` (vnitrni <input> kam uzivatel pise) jako 2 sloty.
                                        // V GDPR rezimu musime maskovat oba – pily uz mask maji pres renderPill,
                                        // ale vlastni search field by jinak prosvitl naepsane casti jmen klientu.
                                        classNames={{ input: gdprInput, inputField: gdprInput }}
                                        comboboxProps={{ withinPortal: true }}
                                        renderOption={({ option }) => (
                                            <span data-gdpr>{option.label}</span>
                                        )}
                                        renderPill={({ option, onRemove }) => (
                                            <Pill withRemoveButton onRemove={onRemove}>
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
                                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
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
                                </SimpleGrid>
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
                                        size="sm"
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
