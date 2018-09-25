import React, { Component } from 'react';
import { ContextMenu, MenuItem, ContextMenuTrigger, SubMenu } from "react-contextmenu";
import Annotation from "./Annotation.js";
import Relation from "./Relation.js";

const AtdViewerStyle = {"textAlign": "justify",
                        "margin": "100px 10% 100px 10%",
                        "padding": "8em 10em 8em 10em",
                        "backgroundColor": "white",
                        "boxShadow": "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                        "minHeight": "80em",
                        "fontSize": "12pt"};

function viewportRelativeBox (element) {
    let rparent = document.getElementById('annotations-root').getBoundingClientRect();
    let relement = element.getBoundingClientRect();

    return {
        top: relement.top - rparent.top,
        right: relement.right - rparent.left,
        bottom: relement.bottom - rparent.top,
        left: relement.left - rparent.left
    };
}


/** Computes the necessary rectangles of an annotation given the selection start
    and end positions, and the paragraph node with the selection */
function computeRects (paragraph, startBox, endBox) {
    let lineHeight = parseFloat(window.getComputedStyle(paragraph).getPropertyValue("line-height").replace("px",""));
    let paragraphRect = viewportRelativeBox(paragraph);
    let lineStart = paragraphRect.left;
    let lineEnd = paragraphRect.right;
    let numLines = Math.round(((endBox.top + lineHeight) - startBox.top) / lineHeight);
    let annRects = [];

    console.log(`numLines ${(((endBox.top + lineHeight) - startBox.top) / lineHeight)}`)

    if (numLines === 1) {
        // Start and end on same line
        annRects = annRects.concat({top: startBox.top,
                                    left: startBox.left,
                                    width: endBox.left - startBox.left,
                                    height: lineHeight});
    } else {
        let lineTop = startBox.top;
        // First line
        annRects = annRects.concat({width: lineEnd - startBox.left,
                                    height: lineHeight,
                                    top: lineTop,
                                    left: startBox.left});

        lineTop += lineHeight;

        // Full lines (intermediate)
        for (var i = 1; i < numLines - 1; ++i) {
            annRects = annRects.concat({width: lineEnd - lineStart,
                                        height: lineHeight,
                                        top: lineTop,
                                        left: lineStart});

            lineTop += lineHeight;
        }

        // Last line
        annRects = annRects.concat({width: endBox.left - lineStart,
                                    height: lineHeight,
                                    top: lineTop,
                                    left: lineStart});
    }

    return annRects;
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

window.getCharacterPositionInParagraph = getCharacterPositionInParagraph;

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

class AtdViewer extends Component {

    contextTrigger = null;

    constructor () {
        super();

        this.state = {
            selection: null,
            //annotations: [],
            nextAnnModel: null
        };

        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.newAnnotation = this.newAnnotation.bind(this);
    }

    deleteAnnotation(id) {
        this.props.model.deleteAnnotation(id);
        this.forceUpdate();

        //this.setState({
            //annotations: this.state.annotations.filter((ann) => ann.id !== id)
        //});
    }

    createAnnotationHighlight(annotationModel) {
        let {paragraphId, start, end, id, annRects} = annotationModel;

        let self = this;
        let callbacks = {
            getHover: function() {return self.props.model.getHover(id)},
            setHover: function(hoverState) {self.props.model.setHover(id, hoverState)},
            deleteAnnotation: function() {self.deleteAnnotation(id)}
        };

        return (<Annotation key={id} annRects={annRects} id={id} callbacks={callbacks}
                            model={this.props.model} type={annotationModel.type}/>);
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
            let {paragraphId, start, end} = this.state.nextAnnModel;
            let paragraph = document.getElementById(paragraphId);
            let startBox = getCharacterPositionInParagraph(paragraph, start);
            let endBox = getCharacterPositionInParagraph(paragraph, end);

            let annRects = computeRects(paragraph, startBox, endBox);

            let ann = this.props.model.mkAnnotation(paragraphId, data.type, start, end, annRects);
            this.props.model.addAnnotation(ann);

            this.setState({
                nextAnnModel: null
            });
            this.forceUpdate();
        }
    }

    render () {

        let paragraphs = this.props.sentences.map(
            function(sentence, index) {
                return(<p key={"paragraph-"+index} id={"paragraph-"+index}>{sentence}</p>);
            });

        let annotations = this.props.model.annotations
            .sort((x, y) => (y.end - y.start)- (x.end - x.start))
            .map((annModel) => this.createAnnotationHighlight(annModel));

        return(
            <div style={{width:"100%", height: "100%"}}>
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

                <div id="relations-root" style={{position: "absolute", width: "100%", height: "100%", pointerEvents: "none"}}>
                    {this.props.model.relations.map((rel) =>
                        <Relation id={rel.id} sourceId={rel.sourceId} destId={rel.destId} model={this.props.model} highlighted={this.props.model.isRelHighlighted(rel.id)} />)}
                </div>

                <ContextMenuTrigger id="new-annotation-menu" ref={c => this.contextTrigger = c} holdToDisplay={-1}>
                    <div id="annotations-root" style={{position: "relative"}}>
                    {annotations}
                    </div>
                    <div id="atd-viewer" style={AtdViewerStyle} onMouseUp={this.handleMouseUp}>
                        {paragraphs}
                    </div>
                </ContextMenuTrigger>
            </div>

        );
    }
}

export default AtdViewer;
