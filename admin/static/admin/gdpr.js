// funkce pro prepnuti modu skryti soukromych informaci klientu
function toggleGdpr() {
    const gdprAttr = "gdpr"
    // zapni/vypni soukromy mod (pokud ma body prislusnou tridu, vypni mod - odstran ji, jinak zapni - pridej ji)
    if (document.body.classList.contains(gdprAttr)) {
        document.body.classList.remove(gdprAttr)
        return "soukromý režim VYPNUTÝ"
    } else {
        document.body.classList.add(gdprAttr)
        return "soukromý režim ZAPNUTÝ"
    }
}
