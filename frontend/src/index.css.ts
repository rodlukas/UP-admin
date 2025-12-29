import { globalStyle } from "@vanilla-extract/css"

globalStyle("html, body, .main, .root", {
    backgroundColor: "#ecf0f5",
})

globalStyle(".main", {
    paddingTop: "3.5rem", // 56px
})

// aby tlacitka s odkazem nemely pointer
globalStyle("a .btn.disabled", {
    cursor: "default",
})

globalStyle(".breadcrumb", {
    backgroundColor: "transparent",
})

// prepsani pravidla z bootstrapu, nechceme responzivni chovani containeru, staci takto
globalStyle(".container", {
    maxWidth: "1500px",
})

// pro plynule scrollovani v modal oknu - viz https://github.com/twbs/bootstrap/issues/17695
globalStyle(".modal", {
    WebkitOverflowScrolling: "touch",
})

globalStyle(".modal hr", {
    opacity: 1,
    borderColor: "#dee2e6",
})

globalStyle(".list-group-item", {
    borderColor: "rgba(0,0,0,.125)",
})

globalStyle("b", {
    fontWeight: 600,
})

globalStyle("h2", {
    color: "#41464b",
    fontSize: "1.8rem",
    fontWeight: 600,
})

globalStyle("h3", {
    color: "#41464b",
    fontSize: "1.5rem",
    fontWeight: 600,
})

/**************************** FORMS ****************************/

// hvezdicka oznacujici povinna pole
globalStyle(".form-group-required .col-form-label::after", {
    marginLeft: "0.3em",
    color: "#dc3545",
    content: '"*"',
})

globalStyle("label", {
    userSelect: "none",
})

// pro spravne zarovnani labelu u checkboxu
// V Bootstrap 5 se .custom-control změnilo na .form-check
globalStyle(".form-check", {
    display: "inline-block",
})

globalStyle(".form-check-label", {
    marginLeft: "0.3em",
})

globalStyle(".input-group-text .form-label", {
    marginBottom: 0,
})

/**************************** TABLE ****************************/
globalStyle(".table", {
    backgroundColor: "white",
})

globalStyle(".table-custom th, .table-custom td", {
    padding: "0.3rem 0.6rem",
})

globalStyle(".table > tbody > tr > td", {
    verticalAlign: "middle",
})

globalStyle(".table th", {
    borderTop: 0,
})

globalStyle(".table .table-light th", {
    borderColor: "#bbbec2",
    backgroundColor: "#d7d6d6",
    color: "#41464b",
})

/**************************** BADGE ****************************/
globalStyle(".badge", {
    verticalAlign: "bottom",
    whiteSpace: "normal",
    fontSize: "1rem",
    fontWeight: 600, // aby se text zalamoval a nepretekal
})

globalStyle("h1 .badge", {
    verticalAlign: "middle", // zarovnani badge na middle, protoze ma mensi font-size nez h1
})

// kontrastnejsi barva pozadi badge
globalStyle(".badge-light", {
    backgroundColor: "#eaeaea",
})

globalStyle(".rounded-pill", {
    padding: ".25em .6em",
})

/**************************** REACT-TOASTIFY ****************************/

// vychozi zluta je spatne citelna s bilym textem
globalStyle('.Toastify__toast[data-type="warning"]', {
    background: "#e7b90f !important",
})

// vychozi text podle bootstrapu, nikoliv podle toastify
globalStyle(".Toastify__toast", {
    fontFamily: "unset !important",
})

// aby notifikace neprekryvala menu
globalStyle(".Toastify__toast-container--top-right", {
    top: "unset !important",
})

/**************************** DJANGO-DEBUG-TOOLBAR ****************************/

// zaridi, aby tlacitko DDT nikdy neprekazelo notifikacim (to je dulezite predevsim pro UI testy)
globalStyle("#djDebugToolbarHandle", {
    top: "380px !important",
})

/**************************** GDPR ****************************/

// skryti osobnich udaju v pripade potreby
globalStyle(
    ".gdpr [data-gdpr], .gdpr .memberships__option, .gdpr .client__option, .gdpr .memberships__multi-value__label, .gdpr .client__single-value",
    {
        backgroundColor: "currentcolor !important",
        userSelect: "none",
    },
)
