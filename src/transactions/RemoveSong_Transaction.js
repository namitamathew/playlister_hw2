import jsTPS_Transaction from "../common/jsTPS.js"
/**
 * MoveSong_Transaction
 * 
 * This class represents a transaction that works with drag
 * and drop. It will be managed by the transaction stack.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class RemoveSong_Transaction extends jsTPS_Transaction {
    constructor(initApp, songIndex, osongTitle, osongArtist, osongYtID) {
        super();
        this.app = initApp;
        this.index = songIndex;
        this.oldTitle = osongTitle;
        this.oldArtist = osongArtist;
        this.oldYTiD = osongYtID;
    }

    doTransaction() {
        this.app.deleteSong(this.index);
    }
    
    undoTransaction() {
        this.app.undoDeleteSong(this.index, this.oldTitle, this.oldArtist, this.oldYTiD);
    }
}