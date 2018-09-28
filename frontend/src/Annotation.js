import React, { Component } from 'react';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import Constants from "./Constants.js";

class Annotation extends Component {


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
        this.props.callbacks.onHoverStart(this.props.id);
    }

    handleOnMouseOut () {
        this.props.callbacks.onHoverEnd(this.props.id);
    }

    handleClick (e, data) {
        this.props.callbacks[data.action](this.props.id);
    }

    onDragOver (ev) {
        // Consider type combinations and discard impossible combinations
        let compat = Constants.relationCompatibilities[ev.dataTransfer.getData("type")];
        if (compat && compat[this.props.type]) {
            ev.preventDefault();
        }

    }

    onDrop (ev) {
        let id = ev.dataTransfer.getData("id")
        this.setState({sourceId: id,
                       allowedRelations: Constants.relationCompatibilities[ev.dataTransfer.getData("type")][this.props.type]});

        this.newRelContextTrigger.handleContextClick(ev);
    }

    onDragStart (ev) {
        ev.dataTransfer.setData("id", this.props.id);
        ev.dataTransfer.setData("type", this.props.type);
    }

    createRelation(e, data) {
        if (this.state.sourceId) {
            //let rel = this.props.model.mkRelation(data.type, this.state.sourceId, this.props.id);
            //this.props.model.addRelation(rel);
            this.props.callbacks.addRelation(data.type, this.state.sourceId, this.props.id);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        let eq = true;

        eq = eq && this.props.hover === nextProps.hover;
        eq = eq && this.props.hidden === nextProps.hidden;

        return !eq;
    }

    render() {
        let annRects = this.props.annRects;
        let numLines = this.props.annRects.length;
        let annDivs = annRects.map(
            (rect, idx) => <div key={`line-${idx}`}
                                style={{width: rect.width,
                                        height: rect.height,
                                        top: rect.top,
                                        left: rect.left,
                                        position: "absolute",
                                        backgroundColor: Constants.typeColors[this.props.type],}}
                                onClick={() => {
                                        // TODO: Please forgive me
                                        document.getElementById("ann-card-"+this.props.id)
                                                .scrollIntoView({behavior: "smooth",
                                                                 inline: "nearest",
                                                                 block: "nearest"});
                                }}/>);

        return (
            <div hidden={this.props.hidden} onMouseOver={this.handleOnMouseOver} onMouseOut={this.handleOnMouseOut} >
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
                         style={{opacity: this.props.hover ? "0.8" : "0.3"}}>
                        {annDivs}
                    </div>
                </ContextMenuTrigger>
            </div>);
    }
}

export default Annotation;
