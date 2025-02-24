import React, { Component } from 'react';
import ReactList from "react-list";
import Constants from "./Constants.js";
import Checkbox from '@material-ui/core/Checkbox'

var Tab = require('react-bootstrap').Tab;
var Tabs = require('react-bootstrap').Tabs;
var Button = require('react-bootstrap').Button;
var Col = require('react-bootstrap').Col;
var Row = require('react-bootstrap').Row;

class SidePanel extends Component {

    constructor() {
        super()

        this.createAnnotationBox = this.createAnnotationBox.bind(this);
        this.createRelationBox = this.createRelationBox.bind(this);
    }

    createAnnotationBox (ann) {
        //let ann = this.annotationsToRender[index];

        return (
            <div id={"ann-card-"+ann.id}
                 key={"sidepanel"+ann.id}
                 style={{backgroundColor: this.props.hover[ann.id] ?
                                          Constants.typeColors[ann.type] :
                                          Constants.dullTypeColors[ann.type],
                         textAlign: "left",
                         padding: "1em",
                         margin: "1em",
                         borderRadius: "0.2em",
                         boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}
                 onMouseOver={() => this.props.callbacks.onHoverStart(ann.id)}
                 onMouseOut={() => this.props.callbacks.onHoverEnd(ann.id)} >
                <Row>
                    <Col xs={10}>
                        <h4><strong>{ann.id}</strong> {ann.text}</h4>
                    </Col>
                    <Col xs={2}>
                        <Button bsSize="small" onClick={() => this.props.model.deleteAnnotation(ann.id)}>x</Button>
                    </Col>
                </Row>
                {ann.type === "Action" ?
                 <div>
                     <label style={{fontWeight: "normal"}}>Optional
                         <input name="Optional"
                                type="checkbox"
                                checked={this.props.model.hasAttribute(ann.id, "Optional")}
                                onChange={() => {this.props.model.toggleAttribute(ann.id, "Optional"); this.forceUpdate()}}
                         />
                         
                     </label>

                    <br/>
                 </div> :
                 <div></div>}
            </div>);
    }

    createRelationBox (rel) {
        //let rel = this.relationsToRender[index];

        let sourceAnn = this.props.model.getAnnotation(rel.sourceId);
        let destAnn = this.props.model.getAnnotation(rel.destId);

        return (
            <div id={"rel-card-"+rel.id}
                 key={"sidepanel"+rel.id}
                 style={{backgroundColor: this.props.hover[rel.id] ? "#dddddd" : "white",
                         textAlign: "left",
                         padding: "1em",
                         margin: "1em",
                         borderRadius: "0.2em",
                         boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}
                 onMouseOver={() => this.props.callbacks.onHoverStart(rel.id)}
                 onMouseOut={() => this.props.callbacks.onHoverEnd(rel.id)} >
                <Row>
                    <Col xs={10}>
                        <h4><strong>{rel.id}</strong> {rel.type}</h4>
                    </Col>
                    <Col xs={2}>
                        <Button bsSize="small" onClick={() => this.props.model.deleteRelation(rel.id)}>x</Button>
                    </Col>
                </Row>
                <p>{rel.sourceId}: {sourceAnn.text}</p>
                <p>{rel.destId}: {destAnn.text}</p>
            </div>);
    }

    annotationsToRender = []

    relationsToRender = []

    render() {
        this.annotationsToRender = this.props.model.annotations.filter((ann) => !this.props.model.shouldBeHidden(ann.type))
        this.relationsToRender = this.props.model.relations.filter((rel) => !this.props.model.shouldBeHidden(rel.type))

        return (
            <Tabs style={{overflowY: "hidden"}} id="tabs">
                <Tab eventKey={1} title="Annotations">
                    <div id="annotations-scroll"
                        style={{overflowY: "scroll", height: "800px",
                                 direction: "rtl"}}>
                        {this.annotationsToRender.map((ann) => this.createAnnotationBox(ann))}
                    </div>
                </Tab>
                <Tab eventKey={2} title="Relations">
                    <div style={{overflowY: "scroll", height: "800px",
                                 direction: "rtl"}}>
                        {this.relationsToRender.map((rel) => this.createRelationBox(rel))}
                    </div>
                </Tab>
            </Tabs>
            );
    }
}

export default SidePanel;
