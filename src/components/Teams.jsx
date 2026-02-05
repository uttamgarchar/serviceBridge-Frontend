/* eslint-disable react/jsx-key */
/* eslint-disable no-unused-vars */
import React from 'react'
import { Link } from 'react-router-dom'

const Teams = () => {
    var iplteams = [
        { id: 1, name: "rcb" },
        { id: 2, name: "mi" },
        { id: 3, name: "csk" },
        { id: 4, name: "kkr" },
    ]
    return (
        <div style={{ textAlign: "center" }}>
            <h1>Ipl Teams</h1>
            {
                iplteams.map((iplteams) => {

                    return <li>
                        <Link to={`/teamDetails/${iplteams.name}`}>{iplteams.name}</Link>

                    </li>
                })
            }
        </div>
    )
}

export default Teams
