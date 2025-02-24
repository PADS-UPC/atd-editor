import React, { Component } from 'react';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

const AtdViewerStyle = {"textAlign": "justify",
                        "margin": "100px 20% 100px 20%",
                        "padding": "8em 10em 8em 10em",
                        "backgroundColor": "white",
                        "boxShadow": "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                        "minHeight": "80em",
                        "fontSize": "12pt"};

class AtdViewer extends Component {

    constructor () {
        super();
        this.handleMouseUp = this.handleMouseUp.bind(this);
    }

    state = {
    }

    handleMouseUp () {
        let selection = document.getSelection();
        this.state.selection = selection;

        window.test = this.state.selection; //TODO: Debug

        let startParagraph = parseInt(selection.anchorNode.parentElement.id.replace("paragraph-", ""));
        let startOffset = selection.anchorOffset;
        let endParagraph = parseInt(selection.focusNode.parentElement.id.replace("paragraph-", ""));
        let endOffset = selection.focusOffset;

        this.state.rect = selection.anchorNode;

        var range = window.getSelection().getRangeAt(0);
        var dummy = document.createElement("span");
        range.insertNode(dummy);
        var box = dummy.getBoundingClientRect();
        dummy.parentNode.removeChild(dummy);
        console.log(box);
        this.rectLeft = box.left;
        this.rectTop = box.top;


        this.forceUpdate();


        console.log("P"+startParagraph+"("+startOffset+")-P"+endParagraph+"("+endOffset+")");
    }

    render () {
        return(
            <ContextMenuTrigger id="some_unique_identifier" >
                <div style={{width: "10px", height: "10px", top: this.rectTop, left: this.rectLeft, backgroundColor: "red", opacity: "0.5", position: "absolute"}}></div>
              <div style={AtdViewerStyle} onMouseUp={this.handleMouseUp}>
                {this.props.sentences.map(function(sentence, index) {return(<p id={"paragraph-"+index}>{sentence}</p>);})}
              </div>
            </ContextMenuTrigger>
        );
    }
}

export default AtdViewer;
