import React, { Component } from 'react';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import Annotation from "./Annotation.js";
import Relation from "./Relation.js";

const AtdViewerStyle = {"textAlign": "justify",
                        "margin": "100px 10% 100px 10%",
                        "padding": "8em 10em 8em 10em",
                        "backgroundColor": "white",
                        "boxShadow": "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                        "minHeight": "80em",
                        "fontSize": "12pt"};


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

    callbacks = {
        onHoverStart: (id) => {this.props.callbacks.onHoverStart(id)},
        onHoverEnd: (id) => {this.props.callbacks.onHoverEnd(id)},
        deleteAnnotation: (id) => {this.deleteAnnotation(id)},
        addRelation: (type, sourceId, destId) => {
            let rel = this.props.model.mkRelation(type, sourceId, destId);
            this.props.model.addRelation(rel);
        }
    }

    createAnnotationHighlight(annotationModel) {
        let {id, annRects, type} = annotationModel;

        return (<Annotation key={id}
                            hover={this.props.hover[id]}
                            annRects={annRects}
                            id={id}
                            callbacks={this.callbacks}
                            type={annotationModel.type}
                            hidden={this.props.model.shouldBeHidden(type)} />);
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
            let ann = this.props.model.mkAnnotation(paragraphId, data.type, start, end);
            this.props.model.addAnnotation(ann);

            this.setState({
                nextAnnModel: null
            });
            this.forceUpdate();
        }
    }

    render () {

        if (!this.props.paragraphs) {
            return (<p> Loading data ... </p>)
        } else {

            window.paragraphs = this.props.paragraphs;

            let paragraphs = this.props.paragraphs.map(
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
                            <Relation
                                id={rel.id}
                                sourceId={rel.sourceId}
                                destId={rel.destId}
                                highlighted={this.props.hover[rel.id]}
                                sourceBox={this.props.model.getAnnBoundingBox(rel.sourceId)}
                                destBox={this.props.model.getAnnBoundingBox(rel.destId)}
                                callbacks={this.callbacks}
                                hidden={this.props.model.shouldBeHidden(rel.type)}
                            />)}
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
}

export default AtdViewer;
