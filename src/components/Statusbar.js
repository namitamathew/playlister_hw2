import React from "react";

export default class Statusbar extends React.Component {
    render() {
        const {currentList} = this.props;
        let name = "";
        if (currentList) {
            name = currentList.name;
        }

        //loadToolbar();

        return (
            <div id="playlister-statusbar">
                {name}
            </div>
        )
    }
}