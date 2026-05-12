import { Modal, ModalProps } from "@mantine/core"
import * as React from "react"

type Props = ModalProps

/**
 * Standardní modal wrapper. Centrální defaulty jsou v theme (centered, overlay, transition).
 * Použij size prop pro přizpůsobení: "sm" | "md" | "lg" | "xl" | "90rem".
 */
const BaseModal: React.FC<Props> = (props) => <Modal {...props} />

export default BaseModal
