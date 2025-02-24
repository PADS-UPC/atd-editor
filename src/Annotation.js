import React, { Component } from 'react';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

function viewportRelativeBox (element) {
    let rparent = document.getElementById('annotations-root').getBoundingClientRect();
    let relement = element.getBoundingClientRect();

    return {
        top: relement.top - rparent.top,
        right: relement.right - rparent.left,
        bottom: relement.bottom - rparent.bottom,
        left: relement.left - rparent.left
    };
}

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
            console.log("wat");
            ev.preventDefault();
        }

    }

    onDrop (ev) {
        console.log("onDrop?");
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

        let lineHeight = parseFloat(window.getComputedStyle(this.props.paragraph).getPropertyValue("line-height").replace("px",""));
        let paragraphRect = viewportRelativeBox(this.props.paragraph);
        let lineStart = paragraphRect.left;
        let lineEnd = paragraphRect.right;
        let numLines = Math.round(((this.props.endBox.top + lineHeight) - this.props.startBox.top) / lineHeight);
        let annRects = [];

        if (numLines === 1) {
            // Start and end on same line
            annRects = annRects.concat(<div key="line-0"
                                            style={{width: this.props.endBox.left - this.props.startBox.left,
                                                    height: lineHeight,
                                                    top: this.props.startBox.top,
                                                    left: this.props.startBox.left,
                                                    position: "absolute",
                                                    backgroundColor: this.typeColors[this.props.type],
                                                    pointerEvents: this.state.respondToMouseEvents ? "auto" : "none"}}/>);
        } else {
            let lineTop = this.props.startBox.top;
            // First line
            annRects = annRects.concat(<div key="line-0"
                                            style={{width: lineEnd - this.props.startBox.left,
                                                    height: lineHeight,
                                                    top: lineTop,
                                                    left: this.props.startBox.left,
                                                    position: "absolute",
                                                    backgroundColor: this.typeColors[this.props.type],
                                                    pointerEvents: this.state.respondToMouseEvents ? "auto" : "none"}}/>);

            lineTop += lineHeight;

            // Full lines (intermediate)
            for (var i = 1; i < numLines - 1; ++i) {
                annRects = annRects.concat(<div key={"line-"+i} style={{width: lineEnd - lineStart,
                                                                        height: lineHeight,
                                                                        top: lineTop,
                                                                        left: lineStart,
                                                                        position: "absolute",
                                                                        backgroundColor: this.typeColors[this.props.type],
                                                                        pointerEvents: this.state.respondToMouseEvents ? "auto" : "none"}}/>);

                lineTop += lineHeight;
            }

            // Last line
            annRects = annRects.concat(<div key={"line-"+numLines} style={{width: this.props.endBox.left - lineStart,
                                                                           height: lineHeight,
                                                                           top: lineTop,
                                                                           left: lineStart,
                                                                           position: "absolute",
                                                                           backgroundColor: this.typeColors[this.props.type],
                                                                           pointerEvents: this.state.respondToMouseEvents ? "auto" : "none"}}/>);


        }

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
                        {annRects}
                    </div>
                </ContextMenuTrigger>
            </div>);
    }
}

export default Annotation;
