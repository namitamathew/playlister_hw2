import React from "react";

export default class SongCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isDragging: false,
            draggedTo: false,
            hover: false
        }
    }
    handleDragStart = (event) => {
        event.dataTransfer.setData("song", event.target.id);
        this.setState(prevState => ({
            isDragging: true,
            draggedTo: prevState.draggedTo
        }));
    }
    handleDragOver = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            isDragging: prevState.isDragging,
            draggedTo: true
        }));
    }
    handleDragEnter = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            isDragging: prevState.isDragging,
            draggedTo: true
        }));
    }
    handleDragLeave = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            isDragging: prevState.isDragging,
            draggedTo: false
        }));
    }
    handleDrop = (event) => {
        event.preventDefault();
        let target = event.target;
        let targetId = target.id;
        targetId = targetId.substring(target.id.indexOf("-") + 1);
        let sourceId = event.dataTransfer.getData("song");
        sourceId = sourceId.substring(sourceId.indexOf("-") + 1);
        
        this.setState(prevState => ({
            isDragging: false,
            draggedTo: false,
            hover: true
        }));

        // ASK THE MODEL TO MOVE THE DATA
        this.props.moveCallback(sourceId, targetId);
    }

    handleHoverStart = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            isDragging: prevState.isDragging,
            draggedTo: prevState.draggedTo,
            hover: true
        }))
        console.log("hover")

    }

    handleHoverEnd = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            isDragging: prevState.isDragging,
            draggedTo: prevState.draggedTo,
            hover: false
        }))
        console.log("hoverStop")

    }

    handleEditSong = (event) => {
        let song = this.props;
        event.preventDefault();
        this.props.editCallback(song);
    }

    handleDeleteSong = (event) => {
        let song = this.props;
        event.preventDefault();
        this.props.deleteSCallback(song);
    }



    getItemNum = () => {
        return this.props.id.substring("playlist-song-".length);
    }

    render() {
        const { song } = this.props;

        let num = this.getItemNum();
        console.log("num: " + num);
        let itemClass = "playlister-song";
        if (this.state.hover) {
            itemClass = "playlister-song-hover";
            if (this.state.draggedTo) {
                itemClass = "playlister-song-dragged-to";
            }
            return (
                <div
                id={'song-' + num}
                className={itemClass}
                onDragStart={this.handleDragStart}
                onDragOver={this.handleDragOver}
                onDragEnter={this.handleDragEnter}
                onDragLeave={this.handleDragLeave}
                onDrop={this.handleDrop}
                onMouseEnter={this.handleHoverStart}
                onMouseLeave={this.handleHoverEnd}
                onDoubleClick={this.handleEditSong}
                draggable="true"
            >
                {num}.&nbsp;<a href={"https://youtu.be/"+ song.youTubeId}> {song.title} by {song.artist}</a>
                <input
                    type="button"
                    id={"delete-list-" + num}
                    className="song-card-button"
                    onClick={this.handleDeleteSong}
                    value={"\u2715"} />
            </div>
            )
        }
        return (
            <div
                id={'song-' + num}
                className={itemClass}
                onDragStart={this.handleDragStart}
                onDragOver={this.handleDragOver}
                onDragEnter={this.handleDragEnter}
                onDragLeave={this.handleDragLeave}
                onDrop={this.handleDrop}
                onMouseEnter={this.handleHoverStart}
                onMouseLeave={this.handleHoverEnd}
                onDoubleClick={this.handleEditSong}
                draggable="true"
            >
                {num}.&nbsp;<a href={"https://youtu.be/" + song.youTubeId}> {song.title} by {song.artist}</a>
                
                <input
                    type="button"
                    id={"delete-list-" + num}
                    className="song-card-button"
                    onClick={this.handleDeleteSong}
                    value={"\u2715"} />
            </div>
        )
    }
}