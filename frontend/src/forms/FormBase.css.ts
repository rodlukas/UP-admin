import { globalStyle, style } from "@vanilla-extract/css"

import { statusNoticeDanger } from "../global/surfaces.css"
import { vars } from "../theme/tokens"

globalStyle("form[data-qa^='form_'] .mantine-Modal-header", {
    borderBottom: vars.borderShort.formDivider,
    backgroundColor: vars.bg.subtle,
    padding: "1rem 1.25rem 0.95rem",
})

globalStyle(".mantine-Modal-content:has(form[data-qa^='form_'])", {
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    /**
     * Nesaž `minWidth: 0` na celý bílý box — v kombinaci s flex uvnitř
     * `.mantine-Modal-inner` to při méně obsahu (Přidat vs. Úprava) zúží okno
     * jen na šířku textu, zatímco u delšího formuláře vypadá širší. Scrollování
     * řeší `Modal.Body` s `minHeight: 0`.
     */
    border: 0,
    borderRadius: vars.radius.lg,
    boxShadow:
        "0 18px 48px rgb(15 23 42 / 0.16), 0 6px 18px rgb(15 23 42 / 0.08), 0 0 0 1px light-dark(rgb(226 232 240 / 0.85), rgb(60 70 90 / 0.6))",
    backgroundColor: vars.bg.surface,
    width: "100%",
    maxHeight: "calc(100dvh - 2rem)",
    overflow: "hidden",
})

globalStyle(".mantine-Modal-content:has(form[data-qa^='form_']) > .mantine-Modal-body", {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    padding: 0,
    minHeight: 0,
    overflow: "hidden",
})

globalStyle(".mantine-Modal-content:has(form[data-qa^='form_']) form[data-qa^='form_']", {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    width: "100%",
    minHeight: 0,
})

globalStyle("form[data-qa^='form_'] .mantine-Modal-title", {
    lineHeight: 1.35,
    letterSpacing: "-0.015em",
    color: vars.text.primary,
    fontSize: "1rem",
    fontWeight: 600,
})

globalStyle(".mantine-Modal-content form[data-qa^='form_'] .mantine-Modal-body", {
    flex: "1 1 auto",
    backgroundColor: vars.bg.subtle,
    padding: "1rem 1.25rem 0.95rem",
    minWidth: 0,
    minHeight: 0,
    overflowY: "auto",
})

globalStyle("form[data-qa^='form_'] .mantine-Modal-close", {
    borderRadius: vars.radius.md,
    color: vars.text.subtleMuted,
})

globalStyle("form[data-qa^='form_'] .mantine-Modal-close:hover", {
    backgroundColor: vars.bg.hoverElevated,
    color: vars.text.primary,
})

globalStyle("form[data-qa^='form_'] .mantine-Modal-body hr", {
    opacity: 1,
    margin: "1.1rem 0",
    borderColor: vars.border.formDivider,
})

globalStyle(
    "form[data-qa^='form_'] .mantine-Input-input, form[data-qa^='form_'] .mantine-Select-input, form[data-qa^='form_'] .mantine-Textarea-input",
    {
        transition:
            "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out, background-color 0.15s ease-in-out",
        borderRadius: vars.radius.md,
        borderColor: vars.border.default,
        backgroundColor: vars.bg.elevated,
    },
)

globalStyle(
    "form[data-qa^='form_'] .mantine-InputWrapper-label, form[data-qa^='form_'] .mantine-Textarea-label",
    {
        marginBottom: "0.35rem",
        lineHeight: 1.35,
        color: vars.text.primary,
        fontSize: "0.84rem",
        fontWeight: 600,
    },
)

globalStyle(
    "form[data-qa^='form_'] .mantine-InputWrapper-description, form[data-qa^='form_'] .mantine-Textarea-description",
    {
        marginTop: "0.35rem",
        lineHeight: 1.35,
        color: vars.text.subtleMuted,
        fontSize: "0.75rem",
    },
)

globalStyle(
    "form[data-qa^='form_'] .mantine-Input-input:hover, form[data-qa^='form_'] .mantine-Select-input:hover, form[data-qa^='form_'] .mantine-Textarea-input:hover",
    {
        borderColor: vars.border.strong,
        backgroundColor: vars.bg.elevated,
    },
)

globalStyle(
    "form[data-qa^='form_'] .mantine-Input-input:focus, form[data-qa^='form_'] .mantine-Select-input:focus, form[data-qa^='form_'] .mantine-Textarea-input:focus",
    {
        borderColor: vars.colors.primary,
        boxShadow: vars.shadow.focusRing,
        backgroundColor: vars.bg.elevated,
    },
)

globalStyle("form[data-qa^='form_'] .mantine-Checkbox-label", {
    color: vars.text.primary,
    fontWeight: 500,
})

export const modalWizardContent = style({})

globalStyle(`${modalWizardContent} .mantine-Modal-header`, {
    borderBottom: vars.borderShort.formDivider,
    backgroundColor: vars.bg.surface,
    padding: "1rem 1.25rem 0.95rem",
})

globalStyle(`${modalWizardContent} .mantine-Modal-body`, {
    paddingTop: "0.85rem",
})

/** Sjednotí šířku s `Modal` size u klienta/skupiny: Přidat i Upravit stejně široké. */
export const modalContentClientGroup = style({
    boxSizing: "border-box",
    minWidth: "min(100%, 40rem)",
    maxWidth: "100%",
})

export const modalActions = style({
    display: "flex",
    flexShrink: 0,
    flexWrap: "wrap",
    gap: "0.55rem",
    marginTop: "1.05rem",
    borderTop: vars.borderShort.formDivider,
    borderRadius: 0,
    backgroundColor: "transparent",
    paddingTop: "0.95rem",
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
})

export const formContent = style({
    display: "flex",
    flexDirection: "column",
    gap: "1.05rem",
})

export const formSection = style({
    border: vars.borderShort.formDivider,
    borderRadius: vars.radius.md,
    boxShadow: "0 1px 2px rgb(15 23 42 / 0.04)",
    backgroundColor: vars.bg.elevated,
    padding: "1rem 1rem 0.95rem",
})

export const formSectionDanger = style([
    statusNoticeDanger,
    {
        padding: "0.95rem 1rem",
    },
])

export const formSectionTitle = style({
    marginBottom: "0.8rem",
    textTransform: "none",
    letterSpacing: "-0.01em",
    color: vars.text.primary,
    fontSize: "0.94rem",
    fontWeight: 700,
})

export const fieldBlock = style({
    display: "flex",
    flexDirection: "column",
    gap: "0.45rem",
})

export const fieldLabel = style({
    lineHeight: 1.35,
    color: vars.text.primary,
    fontSize: "0.84rem",
    fontWeight: 600,
})

export const fieldStack = style({
    display: "flex",
    flexDirection: "column",
    gap: "0.95rem",
})

export const inlineCheckboxRow = style({
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    minHeight: "2.7rem",
})

export const deleteAlertText = style({
    border: 0,
    borderRadius: 0,
    backgroundColor: "transparent",
    padding: 0,
})

globalStyle(`${deleteAlertText} p`, {
    marginBottom: "0.65rem",
})

globalStyle(`${modalActions} button`, {
    minWidth: "unset",
})

globalStyle(`${modalActions} .mantine-Button-root`, {
    borderRadius: vars.radius.lg,
    minHeight: "2.8rem",
    fontWeight: 600,
})

globalStyle(`${modalActions} .mantine-Button-root[data-variant='default']`, {
    borderColor: vars.border.default,
    backgroundColor: vars.bg.elevated,
    color: vars.text.slate,
})

globalStyle(`${modalActions} .mantine-Button-root[data-variant='default']:hover`, {
    backgroundColor: vars.bg.hoverElevated,
})

globalStyle(`${modalActions} > *`, {
    "@media": {
        "(max-width: 575.98px)": {
            flex: "0 0 auto",
        },
    },
})
