import React, { Component } from 'react';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

class Annotation extends Component {

    typeColors = {
        "Action": "#770000",
        "Condition": "#007700",
        "Entity": "#000077"
    }

    constructor() {
        super()

        this.state = {
            respondToMouseEvents: true,

            /* Creation of new relations */
            allowedRelations: [], // This stores the relation combinations that are possible between this annotation and the drag source
            sourceId: null // This contains the id of the drag source
        };

        this.handleOnMouseOver = this.handleOnMouseOver.bind(this);
        this.handleOnMouseOut = this.handleOnMouseOut.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.onDrop = this.onDrop.bind(this);
        this.onDragStart = this.onDragStart.bind(this);
        this.onDragOver = this.onDragOver.bind(this);
        this.createRelation = this.createRelation.bind(this);
    }

    handleOnMouseOver () {
        this.props.callbacks.setHover(true)
    }

    handleOnMouseOut () {
        this.props.callbacks.setHover(false)
    }

    handleClick (e, data) {
        this.props.callbacks[data.action]();
    }

    onDragOver (ev) {
        // Consider type combinations and discard impossible combinations
        let compat = this.props.model.relationCompatibilities[ev.dataTransfer.getData("type")];
        if (compat && compat[this.props.type]) {
            ev.preventDefault();
        }

    }

    onDrop (ev) {
        let id = ev.dataTransfer.getData("id")
        this.setState({sourceId: id,
                       allowedRelations: this.props.model.relationCompatibilities[ev.dataTransfer.getData("type")][this.props.type]});

        this.newRelContextTrigger.handleContextClick(ev);
    }

    onDragStart (ev) {
        ev.dataTransfer.setData("id", this.props.id);
        ev.dataTransfer.setData("type", this.props.type);
    }

    createRelation(e, data) {
        if (this.state.sourceId) {
            let rel = this.props.model.mkRelation(data.type, this.state.sourceId, this.props.id);
            this.props.model.addRelation(rel);
        }
    }

    render() {
        let annRects = this.props.annRects;
        let numLines = this.props.annRects.length;
        let annDivs = annRects.map((rect, idx) => <div key={`line-${idx}`}
                                                       style={{width: rect.width,
                                                               height: rect.height,
                                                               top: rect.top,
                                                               left: rect.left,
                                                               position: "absolute",
                                                               backgroundColor: this.typeColors[this.props.type],}}/>);

        return (
            <div onMouseOver={this.handleOnMouseOver} onMouseOut={this.handleOnMouseOut} >
                <ContextMenu id={"annotation-"+this.props.id+"-context-menu"}>
                    <MenuItem data={{action: 'deleteAnnotation'}} onClick={this.handleClick}>
                        Delete Annotation
                    </MenuItem>
                </ContextMenu>

                <ContextMenu id={"relation-"+this.props.id+"-context-menu"}>
                    {this.state.allowedRelations.map((type) => (<MenuItem data={{type}} onClick={this.createRelation}>{type}</MenuItem>))}
                </ContextMenu>

                <ContextMenuTrigger id={"relation-"+this.props.id+"-context-menu"} ref={c => this.newRelContextTrigger = c}/>

                <ContextMenuTrigger id={"annotation-"+this.props.id+"-context-menu"} holdToDisplay={-1}>
                    <div draggable="true" onDragStart={this.onDragStart} onDrop={this.onDrop} onDragOver={this.onDragOver}
                         style={{opacity: this.props.callbacks.getHover() ? "0.8" : "0.3"}}>
                        {annDivs}
                    </div>
                </ContextMenuTrigger>
            </div>);
    }
}

export default Annotation;
