import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import NavBar from "./NavBar.js";
import Popup from "reactjs-popup";
import AtdViewer from "./AtdViewer.js";
import SidePanel from "./SidePanel.js";
import ReactList from "react-list";
import mkModel from './Model.js'

var Button = require('react-bootstrap').Button;
var ButtonToolbar = require('react-bootstrap').ButtonToolbar;
var ButtonGroup = require('react-bootstrap').ButtonGroup;
var Row = require('react-bootstrap').Row;
var Col = require('react-bootstrap').Col;
var ListGroup = require('react-bootstrap').ListGroup;
var ListGroupItem = require('react-bootstrap').ListGroupItem;



//var Navbar = require('react-bootstrap').Navbar;
//var NavItem = require('react-bootstrap').NavItem;
//var Nav = require('react-bootstrap').Nav;

function splitTextInParagraphs(text) {
    return text.split("\n\n");
}

class App extends Component {

    constructor () {
        super();
        this.state = {
            paragraphs: null,
            username: null,
            model: mkModel(this.forceUpdate.bind(this)),
            hover: {}
        }
    }

    callbacks = {
        onHoverStart: (id) => {
            let o = {};
            o[id] = true;

            let hoverGroup = this.state.model.getHoverGroup(id);
            hoverGroup.forEach((x) => o[x] = true);

            this.setState({hover: Object.assign(this.state.hover, o)})
        },
        onHoverEnd: (id) => {
            this.setState({hover: {}})
        }
    }

    componentDidMount() {
        fetch("/api/getText")
            .then((response) => response.text())
            .then((response) =>
                this.setState({paragraphs: splitTextInParagraphs(response)},
                ))
            .catch((error) => console.log("Error loading text: " + error));

        fetch("/api/getUserName")
            .then((response) => response.text())
            .then((response) =>
                this.setState({username: response})
            )
            .catch((error) => console.log("Error fetching username: " + error));
    }

    render() {

        return (
            <div className="App" style={{"backgroundColor": "#eeeeee", "paddingBottom": "100%"}}>
                <NavBar model={this.state.model} username={this.state.username}/>
                <Row>
                    <Col md={3} xs={3}>
                        <div>
                            <SidePanel model={this.state.model}
                                       callbacks={this.callbacks}
                                       hover={this.state.hover}/>
                        </div>
                    </Col>
                    <Col md={9} xs={9}>
                        <AtdViewer paragraphs={this.state.paragraphs}
                                   model={this.state.model}
                                   callbacks={this.callbacks}
                                   hover={this.state.hover}>
                        </AtdViewer>
                    </Col>
                </Row>

            </div>
        );
    }
}

export default App;
