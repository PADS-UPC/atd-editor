import React, { Component } from 'react';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

var last_annotation_id = 0;

class Annotation extends Component {

    typeColors = {
        "Action": "#770000",
        "Condition": "#007700",
        "Entity": "#000077"
    }

    constructor() {
        super()

        this.state = {
            hover: false,
            respondToMouseEvents: true
        };

        this.handleOnMouseOver = this.handleOnMouseOver.bind(this);
        this.handleOnMouseOut = this.handleOnMouseOut.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    handleOnMouseOver () {
        this.setState({hover: true});
    }

    handleOnMouseOut () {
        this.setState({hover: false});
    }

    handleClick (e, data) {
        this.props.callbacks[data.action]();
    }

    render() {

        let lineHeight = parseFloat(window.getComputedStyle(this.props.paragraph).getPropertyValue("line-height").replace("px",""));
        let paragraphRect = this.props.paragraph.getBoundingClientRect();
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
                annRects = annRects.concat(<div key={"line-"+i}style={{width: lineEnd - lineStart,
                                                        height: lineHeight,
                                                        top: lineTop,
                                                        left: lineStart,
                                                        position: "absolute",
                                                        backgroundColor: this.typeColors[this.props.type],
                                                        pointerEvents: this.state.respondToMouseEvents ? "auto" : "none"}}/>);

                lineTop += lineHeight;
            }

            // Last line
            annRects = annRects.concat(<div key={"line-"+numLines}style={{width: this.props.endBox.left - lineStart,
                                                    height: lineHeight,
                                                    top: lineTop,
                                                    left: lineStart,
                                                    position: "absolute",
                                                    backgroundColor: this.typeColors[this.props.type],
                                                    pointerEvents: this.state.respondToMouseEvents ? "auto" : "none"}}/>);


        }

        return (<div onMouseOver={this.handleOnMouseOver} onMouseOut={this.handleOnMouseOut} >
                <ContextMenu id={"annotation-"+this.props.id+"-context-menu"}>
                  <MenuItem data={{action: 'deleteAnnotation'}} onClick={this.handleClick}>
                    Delete Annotation
                  </MenuItem>
                </ContextMenu>
                <ContextMenuTrigger id={"annotation-"+this.props.id+"-context-menu"} holdToDisplay={-1}>
                <div style={{opacity: this.state.hover ? "0.8" : "0.3"}}>
                {annRects}
                </div>
                </ContextMenuTrigger>
                </div>);
    }
}

export default Annotation;
