// funkce pro prepnuti modu skryti soukromych informaci klientu
function toggleGdpr() {
    const gdpr_attr = "gdpr"
    // zapni/vypni soukromy mod (pokud ma body prislusnou tridu, vypni mod - odstran ji, jinak zapni - pridej ji)
    if (document.body.classList.contains(gdpr_attr)) {
        document.body.classList.remove(gdpr_attr)
        return "soukromý režim VYPNUTÝ"
    } else {
        document.body.classList.add(gdpr_attr)
        return "soukromý režim ZAPNUTÝ"
    }
}
