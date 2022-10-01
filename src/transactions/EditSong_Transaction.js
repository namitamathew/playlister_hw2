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
export default class EditSong_Transaction extends jsTPS_Transaction {
    constructor(initApp, songIndex, osongTitle, osongArtist, osongYtID, nsongTitle, nsongArtist, nsongYtID) {
        super();
        this.app = initApp;
        this.index = songIndex;
        this.oldTitle = osongTitle;
        this.oldArtist = osongArtist;
        this.oldYTiD = osongYtID;
        this.newTitle = nsongTitle;
        this.newArtist = nsongArtist;
        this.newYTiD = nsongYtID;
    }

    doTransaction() {
        this.app.editSong(this.index, this.newTitle, this.newArtist, this.newYTiD);
    }
    
    undoTransaction() {
        this.app.editSong(this.index, this.oldTitle, this.oldArtist, this.oldYTiD);
    }
}