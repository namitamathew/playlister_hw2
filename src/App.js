import React from 'react';
import './App.css';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';
import jsTPS from './common/jsTPS.js';

// OUR TRANSACTIONS
import MoveSong_Transaction from './transactions/MoveSong_Transaction.js';
import AddSong_Transaction from './transactions/AddSong_Transaction.js';
import EditSong_Transaction from './transactions/EditSong_Transaction.js';
import RemoveSong_Transaction from './transactions/RemoveSong_Transaction.js';

// THESE REACT COMPONENTS ARE MODALS
import DeleteListModal from './components/DeleteListModal.js';
import EditSongModal from './components/EditSongModal';
import DeleteSongModal from './components/DeleteSongModal';

// THESE REACT COMPONENTS ARE IN OUR UI
import Banner from './components/Banner.js';
import EditToolbar from './components/EditToolbar.js';
import PlaylistCards from './components/PlaylistCards.js';
import SidebarHeading from './components/SidebarHeading.js';
import SidebarList from './components/SidebarList.js';
import Statusbar from './components/Statusbar.js';

class App extends React.Component {

    constructor(props) {
        super(props);

        // THIS IS OUR TRANSACTION PROCESSING SYSTEM
        this.tps = new jsTPS();

        // THIS WILL TALK TO LOCAL STORAGE
        this.db = new DBManager();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();

        // SETUP THE INITIAL STATE
        this.state = {
            listKeyPairMarkedForDeletion : null,
            currentList : null,
            sessionData : loadedSessionData,
            editSong: null,
            deleteSong: null,
            modalOpen: false
        }

    }


    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        let newKey = this.state.sessionData.nextKey;
        let newName = "Untitled" + newKey;

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            songs: []
        };

        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            },
            editSong: prevState.editSong,
            deleteSong: prevState.deleteSong,
            modalOpen: prevState.modalOpen
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
            this.refreshToolbars();
        });

        
    }
    // THIS FUNCTION BEGINS THE PROCESS OF DELETING A LIST.
    deleteList = (key) => {
        // IF IT IS THE CURRENT LIST, CHANGE THAT
        let newCurrentList = null;
        if (this.state.currentList) {
            if (this.state.currentList.key !== key) {
                // THIS JUST MEANS IT'S NOT THE CURRENT LIST BEING
                // DELETED SO WE'LL KEEP THE CURRENT LIST AS IT IS
                newCurrentList = this.state.currentList;
            }
        }

        let keyIndex = this.state.sessionData.keyNamePairs.findIndex((keyNamePair) => {
            return (keyNamePair.key === key);
        });
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        if (keyIndex >= 0)
            newKeyNamePairs.splice(keyIndex, 1);

        // AND FROM OUR APP STATE
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : null,
            currentList: newCurrentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter - 1,
                keyNamePairs: newKeyNamePairs
            },
            editSong: prevState.editSong,
            deleteSong: prevState.deleteSong,
            modalOpen: prevState.modalOpen
        }), () => {
            // DELETING THE LIST FROM PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationDeleteList(key);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
            this.refreshToolbars();
        });

        
    }
    deleteMarkedList = () => {
        this.deleteList(this.state.listKeyPairMarkedForDeletion.key);
        this.hideDeleteListModal();
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
            sessionData: prevState.sessionData,
            editSong: prevState.editSong,
            deleteSong: prevState.deleteSong,
            modalOpen: false

        }), () => {
            this.refreshToolbars();
        });
    }
    // THIS FUNCTION SPECIFICALLY DELETES THE CURRENT LIST
    deleteCurrentList = () => {
        if (this.state.currentList) {
            this.deleteList(this.state.currentList.key);
        }
        this.refreshToolbars();
    }
    renameList = (key, newName) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === key) {
                pair.name = newName;
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        // WE MAY HAVE TO RENAME THE currentList
        let currentList = this.state.currentList;
        if (currentList.key === key) {
            currentList.name = newName;
        }

        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : null,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            },
            editSong: prevState.editSong,
            deleteSong: prevState.deleteSong,
            modalOpen: prevState.modalOpen
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            let list = this.db.queryGetList(key);
            list.name = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
            this.refreshToolbars();
        });
        
    }
    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {
        let newCurrentList = this.db.queryGetList(key);
        console.log(newCurrentList);
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newCurrentList,
            sessionData: this.state.sessionData,
            editSong: prevState.editSong,
            deleteSong: prevState.deleteSong,
            modalOpen: prevState.modalOpen
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
            console.log(this.state.currentList)
            this.refreshToolbars();
        });
        
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: null,
            sessionData: this.state.sessionData,
            editSong: prevState.editSong,
            deleteSong: prevState.deleteSong,
            modalOpen: prevState.modalOpen
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
            this.refreshToolbars();
        });
        
    }
    setStateWithUpdatedList(list) {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList : list,
            sessionData : this.state.sessionData,
            editSong: prevState.editSong,
            deleteSong: prevState.deleteSong,
            modalOpen: prevState.modalOpen
        }), () => {
            // UPDATING THE LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationUpdateList(this.state.currentList);
            this.refreshToolbars();
        });

    }
    getPlaylistSize = () => {
        return this.state.currentList.songs.length;
    }
    // THIS FUNCTION MOVES A SONG IN THE CURRENT LIST FROM
    // start TO end AND ADJUSTS ALL OTHER ITEMS ACCORDINGLY
    moveSong(start, end) {
        let list = this.state.currentList;

        // WE NEED TO UPDATE THE STATE FOR THE APP
        start -= 1;
        end -= 1;
        if (start < end) {
            let temp = list.songs[start];
            for (let i = start; i < end; i++) {
                list.songs[i] = list.songs[i + 1];
            }
            list.songs[end] = temp;
        }
        else if (start > end) {
            let temp = list.songs[start];
            for (let i = start; i > end; i--) {
                list.songs[i] = list.songs[i - 1];
            }
            list.songs[end] = temp;
        }
        this.setStateWithUpdatedList(list);
        this.refreshToolbars();
    }
    // THIS FUNCTION ADDS A MoveSong_Transaction TO THE TRANSACTION STACK
    addMoveSongTransaction = (start, end) => {
        let transaction = new MoveSong_Transaction(this, start, end);
        this.tps.addTransaction(transaction);
        this.refreshToolbars();
    }

    addAddSongTransaction = () => {
        let size = this.getPlaylistSize();
        let transaction = new AddSong_Transaction(this, size+1);
        this.tps.addTransaction(transaction);
        this.refreshToolbars();

    }

    addEditSongTransaction = (index, oT, oA, oY, nT, nA, nY) => {
        let transaction = new EditSong_Transaction(this, index, oT, oA, oY, nT, nA, nY);
        this.tps.addTransaction(transaction);
        this.refreshToolbars();
    }

    addRemoveSongTransaction = (index, title, artist, youTubeID) => {
        let transaction = new RemoveSong_Transaction(this, index, title, artist, youTubeID);
        this.tps.addTransaction(transaction);
        this.refreshToolbars();
    }

    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING AN UNDO
    undo = () => {
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
            this.refreshToolbars();
        }
        
    }
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING A REDO
    redo = () => {
        if (this.tps.hasTransactionToRedo()) {
            this.tps.doTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
            this.refreshToolbars();
        }
        
    }

    refreshToolbars = () => {
        let undo = document.getElementById("undo-button")
        let redo = document.getElementById("redo-button")
        let addSong = document.getElementById("add-song-button")
        let close = document.getElementById("close-button")
        let addList = document.getElementById("add-list-button")
        console.log(this.state.currentList)
        if (this.state.currentList != null) {
            close.classList.remove("disabled");
            close.disabled = false;
            addList.classList.remove("disabled");
            addList.disabled = false;
            addSong.classList.remove("disabled");
            addSong.disabled = false;
            if (this.tps.hasTransactionToUndo()) {
                undo.classList.remove("disabled");
                undo.disabled = false;
            }
            else {
                undo.classList.add("disabled");
                undo.disabled = true;
            }
            if (this.tps.hasTransactionToRedo()) {
                redo.classList.remove("disabled");
                redo.disabled = false;
            }
            else {
                redo.classList.add("disabled");
                redo.disabled = true;
            }
            if (this.state.modalOpen) {
                close.classList.add("disabled");
                close.disabled = true;
                addSong.classList.add("disabled");
                addSong.disabled = true;
                addList.classList.add("disabled");
                addList.disabled = true;
                undo.classList.add("disabled");
                undo.disabled = true;
                redo.classList.add("disabled");
                redo.disabled = true;
            }
        }
        else {
            close.classList.add("disabled");
            close.disabled = true;
            addSong.classList.add("disabled");
            addSong.disabled = true;
            addList.classList.remove("disabled");
            addList.disabled = false;
            undo.classList.add("disabled");
            undo.disabled = true;
            redo.classList.add("disabled");
            redo.disabled = true;
            if (this.state.modalOpen) {
                close.classList.add("disabled");
                close.disabled = true;
                addSong.classList.add("disabled");
                addSong.disabled = true;
                addList.classList.add("disabled");
                addList.disabled = true;
                undo.classList.add("disabled");
                undo.disabled = true;
                redo.classList.add("disabled");
                redo.disabled = true;
            }
        }

    }

    addSong = () => {
        let newSong = {"title": "Untitled", "artist": "Unknown", "youTubeId": "dQw4w9WgXcQ"};
        let list = this.state.currentList;
        list.songs.push(newSong);
        this.setStateWithUpdatedList(list);
        this.refreshToolbars();

    }

    markListForDeletion = (keyPair) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : keyPair,
            sessionData: prevState.sessionData,
            editSong: prevState.editSong,
            deleteSong: prevState.deleteSong,
            modalOpen: true
        }), () => {
            // PROMPT THE USER
            this.showDeleteListModal();
            this.refreshToolbars();
        });
        
    }
    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showDeleteListModal() {
        let modal = document.getElementById("delete-list-modal");
        modal.classList.add("is-visible");
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal() {
        let modal = document.getElementById("delete-list-modal");
        modal.classList.remove("is-visible");
    }

    deleteListCancel = () => {
        this.hideDeleteListModal();
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
            sessionData: prevState.sessionData,
            editSong: prevState.editSong,
            deleteSong: prevState.deleteSong,
            modalOpen: false

        }), () => {
            this.refreshToolbars();
        });
    }

    markSongEdit = (song) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
            sessionData: prevState.sessionData,
            editSong: song,
            deleteSong: prevState.deleteSong,
            modalOpen: true

        }), () => {
            this.showEditSongModal();
            this.refreshToolbars();
        });
       
    }

    showEditSongModal() {
        let modal = document.getElementById("edit-song-modal");
        let cSong = this.state.editSong.song;
        document.getElementById("edit-song-modal-title-textfield").value = cSong.title;
        document.getElementById("edit-song-modal-artist-textfield").value = cSong.artist;
        document.getElementById("edit-song-modal-youTubeId-textfield").value = cSong.youTubeId;
        modal.classList.add("is-visible");
    }

    hideEditSongModal() {
        let modal = document.getElementById("edit-song-modal");
        modal.classList.remove("is-visible");
    }

    editSongConfirm = () => {      
        let num = this.state.editSong.id.substring("playlist-song-".length);
        let oldTitle = this.state.editSong.song.title;
        let oldArtist = this.state.editSong.song.artist;
        let oldID = this.state.editSong.song.youTubeId;
        let songTitle = document.getElementById("edit-song-modal-title-textfield").value;
        let songArtist = document.getElementById("edit-song-modal-artist-textfield").value;
        let songYTiD = document.getElementById("edit-song-modal-youTubeId-textfield").value;
        
        this.addEditSongTransaction(num, oldTitle, oldArtist, oldID, songTitle, songArtist, songYTiD);
        this.hideEditSongModal();
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
            sessionData: prevState.sessionData,
            editSong: prevState.editSong,
            deleteSong: prevState.deleteSong,
            modalOpen: false

        }), () => {
            this.refreshToolbars();
        });
    }

    editSongCancel = () => {
        this.hideEditSongModal();
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
            sessionData: prevState.sessionData,
            editSong: prevState.editSong,
            deleteSong: prevState.deleteSong,
            modalOpen: false

        }), () => {
            this.refreshToolbars();
        });
    }

    editSong = (num, songTitle, songArtist, songYTiD) => {
        // IF IT IS THE CURRENT LIST, CHANGE THAT
        let list = this.state.currentList;
        list.songs[num-1].title = songTitle;
        list.songs[num-1].artist = songArtist;
        list.songs[num-1].youTubeId = songYTiD;

        this.setStateWithUpdatedList(list);
        this.refreshToolbars();

    }

    markSongDelete = (song) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
            sessionData: prevState.sessionData,
            editSong: prevState.editSong,
            deleteSong: song,
            modalOpen: true

        }), () => {
            this.showDeleteSongModal();
            this.refreshToolbars();
        });
       
    }

    hideDeleteSongModal() {
        let modal = document.getElementById("delete-song-modal");
        modal.classList.remove("is-visible");
    }

    showDeleteSongModal() {
        let modal = document.getElementById("delete-song-modal");
        modal.classList.add("is-visible");
    }

    deleteSongConfirm =() => {
        
        let num = this.state.deleteSong.id.substring("playlist-song-".length);
        let cSong = this.state.deleteSong.song;
        console.log(cSong);
        this.addRemoveSongTransaction(num, cSong.title, cSong.artist, cSong.youTubeID);
        this.hideDeleteSongModal();
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
            sessionData: prevState.sessionData,
            editSong: prevState.editSong,
            deleteSong: prevState.deleteSong,
            modalOpen: false

        }), () => {
            this.refreshToolbars();
        });

    }

    deleteSongCancel = () => {
        this.hideDeleteSongModal();
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
            sessionData: prevState.sessionData,
            editSong: prevState.editSong,
            deleteSong: prevState.deleteSong,
            modalOpen: false

        }), () => {
            this.refreshToolbars();
        });
    }

    deleteSong = (num) => {
        // IF IT IS THE CURRENT LIST, CHANGE THAT
        let list = this.state.currentList;
        list.songs.splice(num-1, 1);
        this.setStateWithUpdatedList(list);

    }

    undoDeleteSong = (num, title, artist, youTubeID) => {
        let list = this.state.currentList;
        let song = {"title": title, "artist": artist, "youTubeId": youTubeID};
        list.songs.splice(num-1, 0, song);
        this.setStateWithUpdatedList(list);
    }

    componentDidMount() {
        //var $this = $(ReactDOM.findDOMNode(this));
        this.refreshToolbars();
        // set el height and width etc.
      }

    render() {
        let canAddSong = this.state.currentList !== null;
        let canUndo = this.tps.hasTransactionToUndo();
        let canRedo = this.tps.hasTransactionToRedo();
        let canClose = this.state.currentList !== null;
        return (
            <div id="root">
                <Banner />
                <SidebarHeading
                    createNewListCallback={this.createNewList}
                />
                <SidebarList
                    currentList={this.state.currentList}
                    keyNamePairs={this.state.sessionData.keyNamePairs}
                    deleteListCallback={this.markListForDeletion}
                    loadListCallback={this.loadList}
                    renameListCallback={this.renameList}
                />
                <EditToolbar
                    canAddSong={canAddSong}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    canClose={canClose} 
                    addSongCallback={this.addAddSongTransaction}
                    undoCallback={this.undo}
                    redoCallback={this.redo}
                    closeCallback={this.closeCurrentList}
                />
                <PlaylistCards
                    currentList={this.state.currentList}
                    moveSongCallback={this.addMoveSongTransaction}
                    editSongCallback={this.markSongEdit}
                    deleteSongCallback={this.markSongDelete}
                />
                <Statusbar 
                    currentList={this.state.currentList} 
                />
                <DeleteListModal
                    listKeyPair={this.state.listKeyPairMarkedForDeletion}
                    hideDeleteListModalCallback={this.deleteListCancel}
                    deleteListCallback={this.deleteMarkedList} />
                <EditSongModal
                    hideEditSongModalCallback={this.editSongCancel}
                    editSongConfirmCallback={this.editSongConfirm}
                />
                <DeleteSongModal
                    songToDelete={this.state.deleteSong}
                    hideDeleteSongModalCallback={this.deleteSongCancel}
                    deleteSongConfirmCallback={this.deleteSongConfirm}
                />
            </div>
        );
        
    }
}


export default App;
