import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
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


var Navbar = require('react-bootstrap').Navbar;
var NavItem = require('react-bootstrap').NavItem;
var Nav = require('react-bootstrap').Nav;


const sentences = ["When a visitor wants to become a member of Barcelona's ZooClub, the following steps must be taken. First of all, the customer must decide whether he wants an individual or family membership. If he wants an individual membership, he must prepare his personal information. If he wants a family membership instead, he should prepare the information for its spouse and spawn as well.",

                   "The customer must then give this information to the ZooClub department. The ZooClub department introduces the visitor's personal data into the system and takes the payment request to the Billing department. The ZooClub department also forwards the visitor's information to the marketing department. The billing department sends the payment request to the bank. The bank processes the payment information and, if everything is correct, charges the payment into user's account.",

                   "Once the payment is confirmed, the ZooClub department can print the card and deliver it to the visitor. In the meantime, the Marketing department makes a request to mail the Zoo Club's magazine to the visitor's home. Once the visitor receives the card, he can go home."];



class App extends Component {

    constructor () {
        super();
        this.state = {model: mkModel(this.forceUpdate.bind(this))}
    }
    

    render() {
        return (
            <div className="App" style={{"backgroundColor": "#eeeeee", "paddingBottom": "100%"}}>
                <Navbar>
                    <Navbar.Header>
                        <Navbar.Brand>
                            <a href="#home">The Model Judge Editor</a>
                        </Navbar.Brand>
                    </Navbar.Header>
                    <Nav>
                    </Nav>
                </Navbar>
                <Row>
                    <Col md={3} xs={3}>
                        <div style={{overflowY: "scroll", height: "800px",
                                     direction: "rtl"}}>
                            <SidePanel model={this.state.model}/>
                        </div>
                    </Col>
                    <Col md={9} xs={9}>
                        <AtdViewer sentences={sentences} model={this.state.model}></AtdViewer>
                    </Col>
                </Row>

            </div>
        );
    }
}

export default App;
