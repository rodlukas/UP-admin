import { style } from "@vanilla-extract/css"

export const loginContainer = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1rem",
    minHeight: "calc(100vh - 3.5rem)",
})

export const loginCard = style({
    border: "1px solid #e9ecef",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05)",
    backgroundColor: "white",
    padding: "2.5rem",
    width: "100%",
    maxWidth: "420px",
})

export const logoContainer = style({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "1.5rem",
})

export const logo = style({
    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
    objectFit: "contain",
    width: "90px",
    height: "90px",
})

export const title = style({
    marginBottom: "0.5rem",
    textAlign: "center",
    letterSpacing: "-0.02em",
    color: "#212529",
    fontSize: "2rem",
    fontWeight: 700,
})

export const subtitle = style({
    marginBottom: "2rem",
    textAlign: "center",
    color: "#6c757d",
    fontSize: "0.95rem",
    fontWeight: 400,
})

export const submitButton = style({
    width: "100%",
})
