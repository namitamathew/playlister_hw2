import React, { Component } from 'react';

export default class EditSongModal extends Component {
    render() {
        const { editSongConfirmCallback, hideEditSongModalCallback } = this.props;
        return (
            <div 
                class="modal" 
                id="edit-song-modal" 
                data-animation="slideInOutLeft">
                    <div class="modal-root" id='verify-delete-list-root'>
                        <div class="modal-north">
                            Edit Song
                        </div>
                        <div class="modal-center">
                            <div class="modal-center-content">
                                <div id="title-prompt" class="modal-prompt">Title:</div><input id="edit-song-modal-title-textfield" class='modal-textfield' type="text" />
                                <div id="artist-prompt" class="modal-prompt">Artist:</div><input id="edit-song-modal-artist-textfield" class='modal-textfield' type="text" />
                                <div id="you-tube-id-prompt" class="modal-prompt">You Tube Id:</div><input id="edit-song-modal-youTubeId-textfield" class='modal-textfield' type="text" />
                            </div>
                        </div>
                        <div class="modal-south">
                            <input type="button" 
                                id="edit-list-confirm-button" 
                                class="modal-button" 
                                onClick={editSongConfirmCallback}
                                value='Confirm' />
                            <input type="button" 
                                id="edit-list-cancel-button" 
                                class="modal-button" 
                                onClick={hideEditSongModalCallback}
                                value='Cancel' />
                        </div>
                    </div>
            </div>
        );
    }
}