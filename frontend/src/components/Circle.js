import React from "react"
import "./Circle.css"

const Circle = ({color}) =>
    <div className="circle" style={{background: color}} title={color}/>

export default Circle
