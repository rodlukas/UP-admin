import * as React from "react"
import {
    Alert,
    Col,
    Form,
    FormGroup,
    Input,
    Label,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from "reactstrap"

import { trackEvent } from "../analytics"
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

import { reactSelectIds } from "./helpers/func"
import Or from "./helpers/Or"
import ReactSelectWrapper from "./helpers/ReactSelectWrapper"
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
    source: string
}

/** Formulář pro skupiny. */
const FormGroups: React.FC<Props> = (props) => {
    const coursesVisibleContext = useCoursesVisibleContext()
    const isGroup = (group: Props["group"]): group is GroupType => "id" in group

    const { data: clientsData = [], isLoading: clientsLoading } = useClients()
    const createGroup = useCreateGroup()
    const updateGroup = useUpdateGroup()
    const deleteGroup = useDeleteGroup()

    // pripravi pole se cleny ve spravnem formatu, aby fungoval react-select
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

    /** Název skupiny. */
    const [name, setName] = React.useState(props.group.name)
    /** Skupina je aktivní (true). */
    const [active, setActive] = React.useState(props.group.active)
    /** Kurz skupiny. */
    const [course, setCourse] = React.useState<GroupPostApiDummy["course"]>(props.group.course)
    /** Členové skupiny. */
    const [members, setMembers] = React.useState<ClientType[]>(
        getMembersOfGroup(isGroup(props.group) ? props.group.memberships : []),
    )

    const onSelectChange = (
        fieldName: "members" | "course",
        obj?: CourseType | readonly ClientType[] | ClientType | null,
    ): void => {
        props.setFormDirty()
        // react-select muze vratit null (napr. pri smazani vsech) nebo undefined, udrzujme tedy stav konzistentni
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

    const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        props.setFormDirty()
        const target = e.currentTarget
        const value = target.type === "checkbox" ? target.checked : target.value
        if (target.id === "name") {
            setName(value as string)
        } else if (target.id === "active") {
            setActive(value as boolean)
        }
    }

    const onSubmit = React.useCallback(
        (e: React.FormEvent<HTMLFormElement>): void => {
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
            trackEvent("group_deleted", { source: props.source })
            deleteGroup.mutate(id, {
                onSuccess: () => {
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
        <Form onSubmit={onSubmit} data-qa="form_group">
            <ModalHeader toggle={close}>
                {isGroup(props.group) ? "Úprava" : "Přidání"} skupiny:{" "}
                <GroupName group={{ name }} bold />
            </ModalHeader>
            <ModalBody>
                {isLoading ? (
                    <Loading />
                ) : (
                    <>
                        <FormGroup row className="form-group-required">
                            <Label for="name" sm={2}>
                                Název
                            </Label>
                            <Col sm={10}>
                                <Input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={onChange}
                                    autoFocus
                                    data-qa="group_field_name"
                                    required
                                    spellCheck
                                />
                            </Col>
                        </FormGroup>
                        <FormGroup row className="form-group-required">
                            <Label for="course" sm={2}>
                                Kurz
                            </Label>
                            <Col sm={10}>
                                <SelectCourse
                                    required
                                    value={course}
                                    onChangeCallback={onSelectChange}
                                    options={coursesVisibleContext.courses}
                                />
                            </Col>
                        </FormGroup>
                        <FormGroup row>
                            <Label for="members" sm={2}>
                                Členové
                            </Label>
                            <Col sm={10}>
                                <ReactSelectWrapper<ClientType, true>
                                    {...reactSelectIds<ClientType>("members")}
                                    value={members}
                                    getOptionLabel={(option): string => clientName(option)}
                                    getOptionValue={(option): string => option.id.toString()}
                                    isMulti
                                    closeMenuOnSelect={false}
                                    onChange={(newValue): void =>
                                        onSelectChange("members", newValue)
                                    }
                                    options={clientsData}
                                    placeholder={"Vyberte členy z existujících klientů..."}
                                    isClearable={false}
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
                            </Col>
                        </FormGroup>
                        <FormGroup row className="align-items-center">
                            <Label for="active" sm={2} data-qa="group_label_active">
                                Aktivní
                            </Label>
                            <Col sm={10}>
                                <Input
                                    type="checkbox"
                                    id="active"
                                    checked={active}
                                    onChange={onChange}
                                    data-qa="group_checkbox_active"
                                />
                                <Label for="active" check>
                                    Je aktivní
                                </Label>{" "}
                                {!active && (
                                    <Tooltip
                                        postfix="active"
                                        text="Neaktivním skupinám nelze vytvořit lekci."
                                    />
                                )}
                            </Col>
                        </FormGroup>
                        {isGroup(props.group) && (
                            <>
                                <hr />
                                <FormGroup row>
                                    <Label sm={2} className="text-muted">
                                        Smazání
                                    </Label>
                                    <Col sm={10}>
                                        <Alert color="warning">
                                            <p>Nenávratně smaže skupinu i s jejími lekcemi</p>
                                            <DeleteButton
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
                                        </Alert>
                                    </Col>
                                </FormGroup>
                            </>
                        )}
                    </>
                )}
            </ModalBody>
            <ModalFooter>
                <CancelButton onClick={close} />{" "}
                <SubmitButton
                    disabled={isLoading}
                    loading={isSubmit}
                    data-qa="button_submit_group"
                    content={isGroup(props.group) ? "Uložit" : "Přidat"}
                />
            </ModalFooter>
        </Form>
    )
}

export default FormGroups
