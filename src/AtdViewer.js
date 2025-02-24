import React, { Component } from 'react';
import { ContextMenu, MenuItem, ContextMenuTrigger, SubMenu } from "react-contextmenu";
import Annotation from "./Annotation.js";

const AtdViewerStyle = {"textAlign": "justify",
                        "margin": "100px 20% 100px 20%",
                        "padding": "8em 10em 8em 10em",
                        "backgroundColor": "white",
                        "boxShadow": "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                        "minHeight": "80em",
                        "fontSize": "12pt"};

function viewportRelativeBox (element) {
    let rparent = document.documentElement.getBoundingClientRect();
    let relement = element.getBoundingClientRect();

    return {
        top: relement.top - rparent.top,
        right: relement.right - rparent.right,
        bottom: relement.bottom - rparent.bottom,
        left: relement.left - rparent.left
    };
}

/*@pre: paragraph is a <p> element containing only plain text*/
function getCharacterPositionInParagraph (paragraph, offset) {
    let html = paragraph.innerHTML;
    let [html1, html2] = [html.slice(0, offset), html.slice(offset)];
    paragraph.innerHTML = html1+"<span id='marker'></span>"+html2;
    let box = viewportRelativeBox(document.getElementById('marker'));
    paragraph.innerHTML = html;

    return box;
}

/*@pre: range's common ancestor is a <p> element containing only plain text*/
function getOffsetInParentParagraph(range) {
    let paragraph = range.startContainer.parentElement;
    let textNodes = Array.from(paragraph.childNodes);
    let startIndex = textNodes.indexOf(range.startContainer);
    let endIndex = textNodes.indexOf(range.endContainer);

    let startOffset = range.startOffset;
    let endOffset = range.endOffset;

    for (let i = 0; i < textNodes.length; ++i) {
        if (i < startIndex) startOffset += textNodes[i].length;
        if (i < endIndex) endOffset += textNodes[i].length;
    }

    return [startOffset, endOffset];
}

let annCount = 0;
function createAnnotation(annotationModel) {
    let id = "A"+annCount++;
    annotationModel.id = id;
    return annotationModel;
}


class AtdViewer extends Component {

    contextTrigger = null;

    constructor () {
        super();

        this.state = {
            selection: null,
            annotations: [],
            nextAnnModel: null
        };

        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.newAnnotation = this.newAnnotation.bind(this);
    }

    deleteAnnotation(id) {
        this.setState({
            annotations: this.state.annotations.filter((ann) => ann.id !== id)
        });
        console.log(this.state.annotations);
    }

    mkAnnotation(annotationModel) {
        let {paragraphId, start, end} = annotationModel;
        let paragraph = document.getElementById(paragraphId);
        let startBox = getCharacterPositionInParagraph(paragraph, start);
        let endBox = getCharacterPositionInParagraph(paragraph, end);
        let id = annotationModel.id;

        let self = this;
        let callbacks = {
            deleteAnnotation: function() {self.deleteAnnotation(id)}
        };

        return (<Annotation key={id} startBox={startBox} endBox={endBox} paragraph={paragraph}
                            id={id} callbacks={callbacks} type={annotationModel.type}/>);
    }

    handleMouseUp (e) {
        let sel = window.getSelection();
        if (sel.anchorNode && sel.getRangeAt(0)) {
            let range = sel.getRangeAt(0);
            if (sel.anchorNode.parentElement !== sel.focusNode.parentElement) {
                range.collapse(false);
            } else {
                if (range.startOffset !== range.endOffset) {
                    let [start, end] = getOffsetInParentParagraph(range);
                    let annModel = {paragraphId: sel.anchorNode.parentElement.id,
                                    start: start,
                                    end: end};
                    this.setState({nextAnnModel: annModel});

                    if (this.contextTrigger) {
                        this.contextTrigger.handleContextClick(e);
                    }
                    return;
                }
            }
        }
    }

    newAnnotation (e, data) {
        if (this.state.nextAnnModel) {
            let ann = createAnnotation(this.state.nextAnnModel);
            ann.type = data.type;
            this.setState({
                annotations: this.state.annotations.concat(ann),
                nextAnnModel: null
            });
        }
    }

    render () {

        return(
            <div>
              <ContextMenu id="new-annotation-menu">
                <MenuItem data={{type: 'Action'}} onClick={this.newAnnotation}>
                  New Action
                </MenuItem>
                <MenuItem data={{type: 'Entity'}} onClick={this.newAnnotation}>
                  New Entity
                </MenuItem>
                <MenuItem data={{type: 'Condition'}} onClick={this.newAnnotation}>
                  New Condition
                </MenuItem>
              </ContextMenu>

            <ContextMenuTrigger id="new-annotation-menu" ref={c => this.contextTrigger = c} holdToDisplay={-1}>
                {this.state.annotations.sort((x, y) => (y.end - y.start)- (x.end - x.start)).map((annModel) => this.mkAnnotation(annModel))}
              <div id="atd-viewer" style={AtdViewerStyle} onMouseUp={this.handleMouseUp}>
                {this.props.sentences.map(function(sentence, index) {return(<p key={"paragraph-"+index} id={"paragraph-"+index}>{sentence}</p>);})}
              </div>
            </ContextMenuTrigger>
            </div>

        );
    }
}

export default AtdViewer;

/*
  function getSelectionStartEnd (selection) {

  var range = selection.getRangeAt(0);
  var clonedRange = range.cloneRange(); // Preserve to avoid destroying selection

  var dummy = document.createElement("span");
  range.insertNode(dummy);
  let startBox = viewportRelativeBox(dummy);
  dummy.parentNode.removeChild(dummy);
  range.collapse(false);
  range.insertNode(dummy);
  let endBox = viewportRelativeBox(dummy);
  dummy.parentNode.removeChild(dummy);

  selection.removeAllRanges();
  selection.addRange(clonedRange);

  return [startBox, endBox];
  }
*/
