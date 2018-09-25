import React, { Component } from 'react';
import ReactList from "react-list";

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

    createAnnotationBox (index, key) {
        let ann = this.props.model.annotations[index];

        return (
            <div style={{backgroundColor: this.props.model.getHover(ann.id) ? "#dd5555" : "white",
                         textAlign: "left",
                         padding: "1em",
                         margin: "1em",
                         borderRadius: "0.2em",
                         boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}
                 onMouseOver={() => this.props.model.setHover(ann.id, true)}
                 onMouseOut={() => this.props.model.setHover(ann.id, false)}>
                <Row>
                    <Col xs={10}>
                        <h3>{ann.type}</h3>
                    </Col>
                    <Col xs={2}>
                        <Button bsSize="small" onClick={() => this.props.model.deleteAnnotation(ann.id)}>x</Button>
                    </Col>
                </Row>
                <p>{ann.start}</p>
            </div>);
    }

    createRelationBox (index, key) {
        let rel = this.props.model.relations[index];

        return (
            <div style={{backgroundColor: this.props.model.isRelHighlighted(rel.id) ? "#dd5555" : "white",
                         textAlign: "left",
                         padding: "1em",
                         margin: "1em",
                         borderRadius: "0.2em",
                         boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}
                 onMouseOver={() => this.props.model.setRelHighlighted(rel.id, true)}
                 onMouseOut={() => this.props.model.setRelHighlighted(rel.id, false)} >
                <Row>
                    <Col xs={10}>
                        <h3>{rel.type}</h3>
                    </Col>
                    <Col xs={2}>
                        <Button bsSize="small" onClick={() => this.props.model.deleteRelation(rel.id)}>x</Button>
                    </Col>
                </Row>
                <p>{rel.sourceId} {rel.destId}</p>
            </div>);
    }

    render() {
        return (
            <Tabs>
                <Tab eventKey={1} title="Annotations">
                    <div style={{overflowY: "scroll", height: "800px",
                                 direction: "rtl"}}>
                        <ReactList
                            itemRenderer={this.createAnnotationBox}
                            length={this.props.model.annotations.length}
                            type='uniform'/>
                    </div>
                </Tab>
                <Tab eventKey={2} title="Relations">
                    <div style={{overflowY: "scroll", height: "800px",
                                 direction: "rtl"}}>
                        <ReactList
                            itemRenderer={this.createRelationBox}
                            length={this.props.model.relations.length}
                            type='uniform'/>
                    </div>
                </Tab>
            </Tabs>
            );
    }
}

export default SidePanel;
