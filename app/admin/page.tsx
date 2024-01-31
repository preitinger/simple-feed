'use client';

import { useState } from "react";
import FeedComp from "../_components/FeedComp";
import FeedData from "../_lib/FeedData";
import { AddFeedReq, AddFeedResp } from "../_lib/admin/addFeed";
import { EditStartReq, EditStartResp } from "../_lib/admin/editStart";
import { EditFinishReq, EditFinishResp } from "../_lib/admin/editFinish";
import { myFetchPost } from "../_lib/apiRoutes";
import RowComp from "../_components/RowComp";

type AdminState = {
    type: 'deciding'
} | {
    type: 'startingEdit'
} | {
    type: 'editing';
    editedId: string;
    data: FeedData;
} | {
    type: 'repeatEditing';
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
        myFetchPost<AddFeedReq, AddFeedResp>(`/api/admin/addFeed`, addFeedReq).then((addFeedResp) => {
            switch (addFeedResp.type) {
                case 'error':
                    alert('Server-Fehler beim Hinzufügen des neuen Feeds: ' + addFeedResp.error);
                    onAdd();
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
            myFetchPost<EditStartReq, EditStartResp>('/api/admin/editStart', editStartReq).then((editStartResp) => {
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
            <h1>Administrate simple feed(s)</h1>
            {
                adminState.type === 'deciding' &&
                <RowComp>
                    <button onClick={onAdd}>Add new feed</button>
                    <button onClick={onEdit}>Edit existing feed</button>
                </RowComp>
            }
            {
                (adminState.type === 'editing' || adminState.type === 'repeatEditing') &&
                <FeedComp admin={true} id={adminState.editedId} dirtyData={adminState.type === 'repeatEditing' ? adminState.data : undefined} onNotFound={() => {
                    setAdminState({
                        type: 'deciding'
                    });
                }} onAbort={() => {
                    setAdminState({
                        type: 'deciding'
                    })
                }} onSave={(feedData) => {
                    console.log('onSave()')
                    if (adminState.type !== 'editing' && adminState.type !== 'repeatEditing') return;
                    const saveLoop = () => {
                        const passwd = prompt('Passwort für ' + feedData._id);
                        if (passwd == null) {
                            console.log('saveLoop: passwd null')
                            setAdminState({
                                data: feedData,
                                editedId: feedData._id,
                                type: 'repeatEditing',
                            })
                            return;
                        }

                        const editFinishReq: EditFinishReq = {
                            feedData: feedData,
                            passwd: passwd
                        }
                        console.log('will fetch /api/admin/editFinish with editFinishReq', editFinishReq);
                        myFetchPost<EditFinishReq, EditFinishResp>('/api/admin/editFinish', editFinishReq).then((editFinishResp) => {
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