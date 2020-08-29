import React from "react"
import { useApp } from './app'
import { json } from 'overmind';
export default function List() {
    const { state } = useApp()
    const users = state.users
    return (
        <div id="menu" className="flex justify-center   p-6">
            <div className="max-w-lg grid gap-1 pt p-3 border border-gray-500 divide-y-4 divide-blue-200 text-black">
                { Object.keys(users).map((key) => {
                    const user = users[key];
                    const statusColor = user.status === 'ready' ? ' bg-green-800 text-white' : ''
                    return (
                        <React.Fragment key={ key }>
                            <div className="flex py-1 pt-2" key={ key }>
                                <span className={ "w-64 border mx-3 px-3 bg-white" + statusColor }>
                                    { user.roomStatus }
                                </span>
                                <span className="w-full border mx-1 px-3 bg-white">
                                    { user.name }
                                </span>
                            </div>
                        </React.Fragment>
                    );
                }) }
            </div>
        </div>
    );
}
