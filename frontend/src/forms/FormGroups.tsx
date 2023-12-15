import * as React from "react"
import {
    Alert,
    Col,
    CustomInput,
    Form,
    FormGroup,
    Input,
    Label,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from "reactstrap"

import ClientService from "../api/services/ClientService"
import GroupService from "../api/services/GroupService"
import CancelButton from "../components/buttons/CancelButton"
import DeleteButton from "../components/buttons/DeleteButton"
import SubmitButton from "../components/buttons/SubmitButton"
import GroupName from "../components/GroupName"
import Loading from "../components/Loading"
import Tooltip from "../components/Tooltip"
import {
    CoursesVisibleContextProps,
    WithCoursesVisibleContext,
} from "../contexts/CoursesVisibleContext"
import { alertRequired, clientName } from "../global/utils"
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

type Props = CoursesVisibleContextProps & {
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
}

type State = {
    /** Název skupiny. */
    name: GroupPostApiDummy["name"]
    /** Skupina je aktivní (true). */
    active: GroupPostApiDummy["active"]
    /** Kurz skupiny. */
    course: GroupPostApiDummy["course"]
    /** Pole členů skupiny. */
    members: ClientType[]
    /** Pole klientů. */
    clients: ClientType[]
    /** Probíhá načítání (true). */
    isLoading: boolean
    /** Formulář byl odeslán (true). */
    isSubmit: boolean
}

/** Formulář pro skupiny. */
class FormGroups extends React.Component<Props, State> {
    isGroup = (group: Props["group"]): group is GroupType => "id" in group

    state: State = {
        name: this.props.group.name,
        active: this.props.group.active,
        course: this.props.group.course,
        members: this.getMembersOfGroup(this.props.group.memberships),
        clients: [],
        isLoading: true,
        isSubmit: false,
    }

    // pripravi pole se cleny ve spravnem formatu, aby fungoval react-select
    getMembersOfGroup(members: MembershipType[]): ClientType[] {
        return members.map((member) => member.client)
    }

    // pripravi pole se cleny ve spravnem formatu, aby slo poslat do API
    prepareMembersForSubmit(members: State["members"]): GroupPutApi["memberships"] {
        return members.map((memberOfGroup) => ({ client_id: memberOfGroup.id }))
    }

    onSelectChange = (
        name: "members" | "course",
        obj?: CourseType | readonly ClientType[] | ClientType | null,
    ): void => {
        this.props.setFormDirty()
        // react-select muze vratit null (napr. pri smazani vsech) nebo undefined, udrzujme tedy stav konzistentni
        if (name === "members" && !obj) {
            obj = []
        } else if (name === "course" && !obj) {
            obj = null
        }
        // prevState kvuli https://github.com/Microsoft/TypeScript/issues/13948
        this.setState((prevState) => ({
            ...prevState,
            [name]: obj,
        }))
    }

    onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        this.props.setFormDirty()
        const target = e.currentTarget
        const value = target.type === "checkbox" ? target.checked : target.value
        // prevState kvuli https://github.com/Microsoft/TypeScript/issues/13948
        this.setState((prevState) => ({
            ...prevState,
            [target.id]: value,
        }))
    }

    onSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault()
        const { name, members, course, active } = this.state
        if (alertRequired("kurz", course)) {
            return
        }
        const courseId = course!.id
        let request: Promise<GroupType>
        const dataPost: GroupPostApi = {
            name,
            memberships: this.prepareMembersForSubmit(members),
            course_id: courseId,
            active,
        }
        if (this.isGroup(this.props.group)) {
            const dataPut: GroupPutApi = { ...dataPost, id: this.props.group.id }
            request = GroupService.update(dataPut)
        } else {
            request = GroupService.create(dataPost)
        }
        this.setState({ isSubmit: true }, (): void => {
            request
                .then((response) => {
                    this.props.funcProcessAdditionOfGroup &&
                        this.props.funcProcessAdditionOfGroup(response)
                    this.props.funcForceClose(true, { active: response.active, isDeleted: false })
                })
                .catch(() => {
                    this.setState({ isSubmit: false })
                })
        })
    }

    close = (): void => {
        this.props.funcClose()
    }

    delete = (id: GroupType["id"]): void => {
        GroupService.remove(id).then(() =>
            this.props.funcForceClose(true, { active: this.state.active, isDeleted: true }),
        )
    }

    processAdditionOfClient = (newClient: ClientType): void => {
        this.props.setFormDirty()
        this.setState((prevState) => {
            return {
                members: [...prevState.members, newClient],
            }
        })
    }

    getClientsAfterAddition = (): void => {
        this.setState({ isLoading: true }, this.getClients)
    }

    getClients = (): void => {
        ClientService.getAll().then((clients) =>
            this.setState({
                clients,
                isLoading: false,
            }),
        )
    }

    componentDidMount(): void {
        this.getClients()
        this.props.coursesVisibleContext.funcRefresh()
    }

    render(): React.ReactNode {
        const { name, clients, members, course, active } = this.state
        return (
            <Form onSubmit={this.onSubmit} data-qa="form_group">
                <ModalHeader toggle={this.close}>
                    {this.isGroup(this.props.group) ? "Úprava" : "Přidání"} skupiny:{" "}
                    <GroupName group={{ name }} bold />
                </ModalHeader>
                <ModalBody>
                    {!this.props.coursesVisibleContext.isLoaded || this.state.isLoading ? (
                        <Loading />
                    ) : (
                        <>
                            <FormGroup row className="required">
                                <Label for="name" sm={2}>
                                    Název
                                </Label>
                                <Col sm={10}>
                                    <Input
                                        type="text"
                                        id="name"
                                        value={name}
                                        onChange={this.onChange}
                                        autoFocus
                                        data-qa="group_field_name"
                                        required
                                        spellCheck
                                    />
                                </Col>
                            </FormGroup>
                            <FormGroup row className="required">
                                <Label for="course" sm={2}>
                                    Kurz
                                </Label>
                                <Col sm={10}>
                                    <SelectCourse
                                        value={course}
                                        onChangeCallback={this.onSelectChange}
                                        options={this.props.coursesVisibleContext.courses}
                                    />
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label for="members" sm={2}>
                                    Členové
                                </Label>
                                <Col sm={10}>
                                    {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                                    {/* @ts-ignore: isMulti components type problem */}
                                    <ReactSelectWrapper<ClientType, true>
                                        {...reactSelectIds<ClientType>("members")}
                                        value={members}
                                        getOptionLabel={(option): string => clientName(option)}
                                        getOptionValue={(option): string => option.id.toString()}
                                        isMulti
                                        closeMenuOnSelect={false}
                                        onChange={(newValue): void =>
                                            this.onSelectChange("members", newValue)
                                        }
                                        options={clients}
                                        placeholder={"Vyberte členy z existujících klientů..."}
                                        isClearable={false}
                                    />
                                    <Or
                                        content={
                                            <ModalClients
                                                refresh={this.getClientsAfterAddition}
                                                processAdditionOfClient={
                                                    this.processAdditionOfClient
                                                }
                                                withOr
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
                                    <CustomInput
                                        type="checkbox"
                                        id="active"
                                        checked={active}
                                        label="Je aktivní"
                                        onChange={this.onChange}
                                        data-qa="group_checkbox_active"
                                    />{" "}
                                    {!active && (
                                        <Tooltip
                                            postfix="active"
                                            text="Neaktivním skupinám nelze vytvořit lekci."
                                        />
                                    )}
                                </Col>
                            </FormGroup>
                            {this.isGroup(this.props.group) && (
                                <FormGroup row className="border-top pt-3">
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
                                                        this.isGroup(this.props.group) &&
                                                        window.confirm(
                                                            `Opravdu chcete smazat skupinu ${name}?`,
                                                        )
                                                    ) {
                                                        this.delete(this.props.group.id)
                                                    }
                                                }}
                                                data-qa="button_delete_group"
                                            />
                                        </Alert>
                                    </Col>
                                </FormGroup>
                            )}
                        </>
                    )}
                </ModalBody>
                <ModalFooter>
                    <CancelButton onClick={this.close} />{" "}
                    <SubmitButton
                        disabled={this.state.isLoading}
                        loading={this.state.isSubmit}
                        data-qa="button_submit_group"
                        content={this.isGroup(this.props.group) ? "Uložit" : "Přidat"}
                    />
                </ModalFooter>
            </Form>
        )
    }
}

export default WithCoursesVisibleContext(FormGroups)
