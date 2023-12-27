'use client';

import { useState } from "react";
import FeedComp from "../_components/FeedComp";
import FeedData from "../_lib/FeedData";
import { AddFeedReq, AddFeedResp } from "../_lib/admin/addFeed";
import { EditStartReq, EditStartResp } from "../_lib/admin/editStart";
import { EditFinishReq, EditFinishResp } from "../_lib/admin/editFinish";

type AdminState = {
    type: 'deciding'
} | {
    type: 'startingEdit'
} | {
    type: 'editing';
    editedId: string;
    data: FeedData;
} | {
    type: 'adding';
} | {
    type: 'finishing';
}

export default function Admin() {
    const [adminState, setAdminState] = useState<AdminState>({
        type: 'deciding'
    })

    function onAdd() {
        const id = prompt('Id für neuen Feed');
        if (id == null) {
            setAdminState({
                type: 'deciding'
            })
            return;
        }
        const adminPasswd = prompt('Admin-Passwort')
        if (adminPasswd == null) {
            setAdminState({
                type: 'deciding'
            })
            return;
        }
        const feedPasswd = prompt('Passwort für neuen Feed');
        if (feedPasswd == null) {
            setAdminState({
                type: 'deciding'
            })
            return;
        }
        const addFeedReq: AddFeedReq = {
            id: id,
            adminPasswd: adminPasswd,
            feedPasswd: feedPasswd,
        }
        fetch(`/api/admin/addFeed`, {
            method: 'POST',
            body: JSON.stringify(addFeedReq),
        }).then(res => res.json()).then((addFeedResp: AddFeedResp) => {
            switch (addFeedResp.type) {
                case 'error':
                    alert('Server-Fehler beim Hinzufügen des neuen Feeds: ' + addFeedResp.error);
                    return;
                case 'idInUse':
                    alert('Die gewünschte Id ist bereits vergeben.');
                    onAdd();
                    return;
                case 'success':
                    alert(`Feed ${id} erfolgreich generiert.`)
                    setAdminState({
                        type: 'deciding'
                    });
                    break;
            }
        }).catch(reason => {
            console.error('thrown: ', reason);
            alert('Could not create new feed with id "' + id + '"! - ' + reason);
        })
        setAdminState({
            type: 'adding'
        })
    }

    function onEdit() {
        const feed = localStorage.getItem('feed');
        let passwd = localStorage.getItem('passwd');

        let initialVal = '';
        if (feed != null) {
            initialVal = JSON.parse(feed)._id;
        } else {
            initialVal = 'Georg_Reitinger' // TODO auskommentieren, 
        }
        const id = prompt('Feed ID', initialVal);
        if (id == null) return;
        passwd = prompt('Passwort fuer Feed ' + id, passwd ?? '');
        if (passwd == null) return;

        setAdminState({
            type: 'startingEdit'
        });

        const loopEditStart = (force: boolean) => {
            const editStartReq: EditStartReq = {
                id: id,
                passwd: passwd ?? '',
                force: force
            }
            fetch('/api/admin/editStart', {
                method: 'POST',
                body: JSON.stringify(editStartReq)
            }).then(resp => resp.json()).then((editStartResp: EditStartResp) => {
                switch (editStartResp.type) {
                    case 'alreadyEdited':
                        const confirmed = confirm(`Der Feed ${id} wird gerade oder wurde kürzlich von jemand bearbeitet. Trotzdem jetzt bearbeiten? (Falls jemand parallel ändert, können Eingaben verlogen gehen...)`);
                        if (confirmed) {
                            loopEditStart(true);
                            return;
                        }
                        setAdminState({
                            type: 'deciding'
                        })
                        return;
                    case 'notFound':
                        alert(`Der Feed ${id} wurde nicht in der Datenbank gefunden`);
                        setAdminState({
                            type: 'deciding'
                        })
                        return;
                    case 'wrongPasswd':
                        alert(`Falsches Passwort für Feed ${id}!`);
                        setAdminState({
                            type: 'deciding'
                        });
                        return;
                    case 'error':
                        alert(`Unerwarteter Fehler für Feed ${id}: ${editStartResp.error}`);
                        setAdminState({
                            type: 'deciding'
                        });
                        return;
                    case 'success':
                        setAdminState({
                            type: 'editing',
                            editedId: id,
                            data: editStartResp.data
                        })
                        try {
                            localStorage.setItem('feed', JSON.stringify(editStartResp.data));
                        } catch (reason) {
                            console.log(reason);
                        }
                        if (passwd != null) localStorage.setItem('passwd', passwd);
                        break;
                }
    
            })
        }
        loopEditStart(false);
    }

    return (
        <div>
            {
                adminState.type === 'deciding' &&
                <div>
                    <button onClick={onAdd}>Add new feed</button>
                    <button onClick={onEdit}>Edit existing feed</button>
                </div>
            }
            {
                adminState.type === 'editing' &&
                <FeedComp admin={true} editedId={adminState.editedId} onNotFound={() => {
                    setAdminState({
                        type: 'deciding'
                    });
                }} onAbort={() => {
                    setAdminState({
                        type: 'deciding'
                    })
                }} onSave={(feedData) => {
                    if (adminState.type !== 'editing') return;
                    const saveLoop = () => {
                        const passwd = prompt('Passwort für ' + feedData._id);
                        if (passwd == null) return;

                        const editFinishReq: EditFinishReq = {
                            feedData: feedData,
                            passwd: passwd
                        }
                        console.log('will fetch /api/admin/editFinish with editFinishReq', editFinishReq);
                        fetch('/api/admin/editFinish', {
                            method: 'POST',
                            body: JSON.stringify(editFinishReq)
                        }).then(resp => resp.json()).then((editFinishResp: EditFinishResp) => {
                            switch (editFinishResp.type) {
                                case 'notFound':
                                    alert('Der Feed ' + feedData._id + ' konnte nicht gespeichert werden, da er nicht in der Datenbank gefunden wurde.');
                                    setAdminState({
                                        type: 'editing',
                                        editedId: feedData._id,
                                        data: feedData
                                    });
                                    break;
                                case 'wrongPasswd':
                                    alert('Falsches Passwort!');
                                    saveLoop();
                                    return;
                                case 'error':
                                    alert('Fehler beim Speichern: ' + editFinishResp.error);
                                    setAdminState({
                                        type: 'editing',
                                        editedId: feedData._id,
                                        data: feedData
                                    });
                                    return;
                                case 'success':
                                    alert('Erfolgreich gespeichert.');
                                    setAdminState({
                                        type: "deciding"
                                    })
                                    return;
                            }
                        });
                        setAdminState({
                            type: 'finishing'
                        });
                    }
                    saveLoop();
                }} />
            }
            {
                adminState.type === 'startingEdit' &&
                <p>Lade Feed-Daten ...</p>
            }
            {
                adminState.type === 'finishing' &&
                <p>Speichere Feed ...</p>
            }
        </div>

    )
}