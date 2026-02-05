/* eslint-disable no-unused-vars */
import React from 'react'
import { useParams } from "react-router-dom";

const TeamDetails = () => {
    const teamName = useParams().name;
    return (
        <div style={{ textAlign: "center" }}>
            <h1>Team Details of {teamName}</h1>
        </div>
    )
}

export default TeamDetails
