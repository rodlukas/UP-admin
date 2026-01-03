import { keyframes, style } from "@vanilla-extract/css"

const fadeIn = keyframes({
    from: {
        opacity: 0,
    },
    to: {
        opacity: 1,
    },
})

export const searchOverlay = style({
    position: "fixed",
    zIndex: 1020, // Bootstrap navbar ma z-index 1030
    top: "56px", // vyska navbaru (56px) - desktop
    right: 0,
    bottom: 0,
    left: 0,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    backdropFilter: "blur(4px)",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    cursor: "default",
    overflowY: "auto",
    animation: `${fadeIn} 0.15s ease-out`,
    "@media": {
        "(max-width: 991.98px)": {
            zIndex: 1040, // vyssi nez navbar (1030), aby byl nad rozbalenym menu
            top: "106px", // vyska navbaru (56px) + search input (~50px)
        },
    },
})

export const searchContainer = style({
    position: "relative",
    zIndex: 1021,
    margin: "0 auto",
    marginBottom: "2rem",
    borderRadius: "0 0 0.375rem 0.375rem",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05)",
    backgroundColor: "white",
    padding: "0 1rem 2rem",
    width: "100%",
    maxWidth: "900px",
    height: "auto",
    animation: `${fadeIn} 0.2s ease-out`,
})
