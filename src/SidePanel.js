import React, { Component } from 'react';
import ReactList from "react-list";

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
        return (
            <div style={{backgroundColor: "white",
                         textAlign: "left",
                         padding: "1em",
                         margin: "1em",
                         borderRadius: "0.2em",
                         boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}>
                <Row>
                    <Col xs={10}>
                        <h3>{this.props.model.annotations[index].type}</h3>
                    </Col>
                    <Col xs={2}>
                        <Button bsSize="small" onClick={() => this.props.model.deleteAnnotation(this.props.model.annotations[index].id)}>x</Button>
                    </Col>
                </Row>
                <p>{this.props.model.annotations[index].start}</p>
            </div>);
    }

    createRelationBox (index, key) {
        return (
            <div style={{backgroundColor: "white",
                         textAlign: "left",
                         padding: "1em",
                         margin: "1em",
                         borderRadius: "0.2em",
                         boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}>
                <Row>
                    <Col xs={10}>
                        <h3>{this.props.model.relations[index].type}</h3>
                    </Col>
                    <Col xs={2}>
                        <Button bsSize="small" onClick={() => this.props.model.deleteRelation(this.props.model.relations[index].id)}>x</Button>
                    </Col>
                </Row>
                <p>{this.props.model.relations[index].sourceId} {this.props.model.relations[index].destId}</p>
            </div>);
    }

    render() {
        return (
            <div style={{overflowY: "scroll", height: "800px",
                         direction: "rtl"}}>
                <ReactList
                    itemRenderer={this.createRelationBox}
                    length={this.props.model.relations.length}
                    type='uniform'/>
                <ReactList
                    itemRenderer={this.createAnnotationBox}
                    length={this.props.model.annotations.length}
                    type='uniform'/>
            </div>);
    }
}

export default SidePanel;
