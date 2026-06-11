import { Modal, ModalProps } from "@mantine/core"
import * as React from "react"

import { MODAL_TRANSITION_PROPS } from "../theme/theme"

type Props = ModalProps

/**
 * Standardní modal wrapper. Centrální defaulty jsou v theme (centered, overlay, transition).
 * Použij size prop pro přizpůsobení: "sm" | "md" | "lg" | "xl" | "90rem".
 *
 * Kontrakt kompozice obsahu (Mantine Modal balí children vždy do vlastního Modal.Body):
 * - formuláře (FormXxx s `data-qa^='form_'`) si renderují vlastní Modal.Header/Modal.Body
 *   a modal otevírají s `withCloseButton={false}` — padding vnějšího těla nuluje globální
 *   reset ve FormBase.css.ts,
 * - ne-formulářový obsah hlavičku nevnořuje a používá prop `title` (+ výchozí zavírací
 *   křížek), Mantine pak vykreslí hlavičku přes celou šířku okna sám.
 *
 * `transitionProps` se zde mergují s theme defaultem: Mantine props theme default nahrazují
 * celé, takže předání pouhého `{ onExited }` by jinak modal tiše přepnulo na výchozí
 * animaci Mantine ("fade-down").
 */
const BaseModal: React.FC<Props> = ({ transitionProps, ...props }) => (
    <Modal {...props} transitionProps={{ ...MODAL_TRANSITION_PROPS, ...transitionProps }} />
)

export default BaseModal
