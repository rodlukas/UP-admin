import { Checkbox, Group, Modal, MultiSelect, SimpleGrid, TextInput, Title } from "@mantine/core"
import * as React from "react"

import { AnalyticsSource, trackEvent } from "../analytics"
import { useClients, useCreateGroup, useDeleteGroup, useUpdateGroup } from "../api/hooks"
import CancelButton from "../components/buttons/CancelButton"
import DeleteButton from "../components/buttons/DeleteButton"
import SubmitButton from "../components/buttons/SubmitButton"
import GroupName from "../components/GroupName"
import Loading from "../components/Loading"
import Tooltip from "../components/Tooltip"
import { useCoursesVisibleContext } from "../contexts/CoursesVisibleContext"
import { clientName } from "../global/utils"
import { ModalGroupsData } from "../types/components"
import {
    ClientType,
    CourseType,
    GroupPostApi,
    GroupPostApiDummy,
    GroupPutApi,
    GroupType,
    MembershipType,
} from "../types/models"
import { fEmptyVoid } from "../types/types"

import * as styles from "./FormBase.css"
import Or from "./helpers/Or"
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

    const getMembersOfGroup = React.useCallback((members: MembershipType[]): ClientType[] => {
        return members.map((member) => member.client)
    }, [])

    const prepareMembersForSubmit = React.useCallback(
        (members: ClientType[]): GroupPutApi["memberships"] => {
            return members.map((memberOfGroup) => ({ client_id: memberOfGroup.id }))
        },
        [],
    )

    const [name, setName] = React.useState(props.group.name)
    const [active, setActive] = React.useState(props.group.active)
    const [course, setCourse] = React.useState<GroupPostApiDummy["course"]>(props.group.course)
    const [members, setMembers] = React.useState<ClientType[]>(
        getMembersOfGroup(isGroup(props.group) ? props.group.memberships : []),
    )

    const onSelectChange = (
        fieldName: "members" | "course",
        obj?: CourseType | readonly ClientType[] | ClientType | null,
    ): void => {
        props.setFormDirty()
        if (fieldName === "members") {
            if (Array.isArray(obj)) {
                setMembers([...obj])
            } else {
                setMembers([])
            }
        } else if (fieldName === "course") {
            if (obj) {
                setCourse(obj as CourseType)
            } else {
                setCourse(null)
            }
        }
    }

    const onNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        props.setFormDirty()
        setName(e.currentTarget.value)
    }

    const onActiveChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        props.setFormDirty()
        setActive(e.currentTarget.checked)
    }

    const onSubmit = React.useCallback(
        (e: React.SyntheticEvent<HTMLFormElement>): void => {
            e.preventDefault()
            const courseId = course!.id
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
        [name, members, course, active, props, createGroup, updateGroup, prepareMembersForSubmit],
    )

    const close = React.useCallback((): void => {
        props.funcClose()
    }, [props])

    const handleDelete = React.useCallback(
        (id: GroupType["id"]): void => {
            deleteGroup.mutate(id, {
                onSuccess: () => {
                    trackEvent("group_deleted", { source: props.source })
                    props.funcForceClose(true, { active, isDeleted: true })
                },
            })
        },
        [deleteGroup, props, active],
    )

    const processAdditionOfClient = React.useCallback(
        (newClient: ClientType): void => {
            props.setFormDirty()
            setMembers((prev) => [...prev, newClient])
        },
        [props],
    )

    const isLoading = clientsLoading || coursesVisibleContext.isLoading
    const isSubmit = createGroup.isPending || updateGroup.isPending

    return (
        <form onSubmit={onSubmit} data-qa="form_group">
            <Modal.Header>
                <Modal.Title>
                    {isGroup(props.group) ? "Úprava" : "Přidání"} skupiny:{" "}
                    <GroupName group={{ name }} bold />
                </Modal.Title>
                <Modal.CloseButton />
            </Modal.Header>
            <Modal.Body>
                {isLoading ? (
                    <Loading />
                ) : (
                    <div className={styles.formContent}>
                        <div className={styles.formSection}>
                            <Title order={6} className={styles.formSectionTitle}>Základní údaje</Title>
                            <div className={styles.fieldStack}>
                                <div className={styles.fieldBlock}>
                                    <TextInput
                                        id="name"
                                        value={name}
                                        onChange={onNameChange}
                                        label="Název skupiny"
                                        data-autofocus
                                        data-qa="group_field_name"
                                        required
                                        
                                        spellCheck
                                    />
                                </div>
                                <div className={styles.fieldBlock}>
                                    <label htmlFor="course" className={styles.fieldLabel}>
                                        Kurz
                                    </label>
                                    <SelectCourse
                                        required
                                        value={course}
                                        onChangeCallback={onSelectChange}
                                        options={coursesVisibleContext.courses}
                                    />
                                </div>
                                <div className={styles.fieldBlock}>
                                    <label htmlFor="members" className={styles.fieldLabel}>
                                        Členové
                                    </label>
                                    <MultiSelect
                                        id="members"
                                        data={clientsData.map((c) => ({ value: c.id.toString(), label: clientName(c) }))}
                                        value={members.map((m) => m.id.toString())}
                                        onChange={(vals) => {
                                            const found = vals
                                                .map((v) => clientsData.find((c) => c.id.toString() === v))
                                                .filter((c): c is ClientType => c !== undefined)
                                            onSelectChange("members", found)
                                        }}
                                        placeholder="Vyberte členy z existujících klientů..."
                                        searchable
                                        comboboxProps={{ withinPortal: true }}
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
                                                checked={active}
                                                onChange={onActiveChange}
                                                data-qa="group_checkbox_active"
                                                label="Je aktivní"
                                            />
                                            {!active && (
                                                <Tooltip
                                                    text="Neaktivním skupinám nelze vytvořit lekci."
                                                />
                                            )}
                                        </div>
                                    </div>
                                </SimpleGrid>
                            </div>
                        </div>
                        {isGroup(props.group) && (
                            <div className={`${styles.formSection} ${styles.formSectionDanger}`}>
                                <Title order={6} className={styles.formSectionTitle}>Smazání</Title>
                                <div className={styles.deleteAlertText}>
                                    <p>Nenávratně smaže skupinu i s jejími lekcemi.</p>
                                    <DeleteButton
                                        size="sm"
                                        content="skupinu"
                                        onClick={(): void => {
                                            if (
                                                isGroup(props.group) &&
                                                globalThis.confirm(
                                                    `Opravdu chcete smazat skupinu ${name}?`,
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
