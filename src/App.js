import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import AtdViewer from "./AtdViewer.js";

var Button = require('react-bootstrap').Button;
var ButtonToolbar = require('react-bootstrap').ButtonToolbar;
var ButtonGroup = require('react-bootstrap').ButtonGroup;

var Navbar = require('react-bootstrap').Navbar;
var NavItem = require('react-bootstrap').NavItem;
var Nav = require('react-bootstrap').Nav;


const sentences = ["When a visitor wants to become a member of Barcelona's ZooClub, the following steps must be taken. First of all, the customer must decide whether he wants an individual or family membership. If he wants an individual membership, he must prepare his personal information. If he wants a family membership instead, he should prepare the information for its spouse and spawn as well.",

                   "The customer must then give this information to the ZooClub department. The ZooClub department introduces the visitor's personal data into the system and takes the payment request to the Billing department. The ZooClub department also forwards the visitor's information to the marketing department. The billing department sends the payment request to the bank. The bank processes the payment information and, if everything is correct, charges the payment into user's account.",

                   "Once the payment is confirmed, the ZooClub department can print the card and deliver it to the visitor. In the meantime, the Marketing department makes a request to mail the Zoo Club's magazine to the visitor's home. Once the visitor receives the card, he can go home."];

class App extends Component {
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



            
            <ContextMenu id="some_unique_identifier">
            <MenuItem data={{foo: 'bar'}} onClick={this.handleClick}>
              ContextMenu Item 1
            </MenuItem>
            <MenuItem data={{foo: 'bar'}} onClick={this.handleClick}>
                ContextMenu Item 2
            </MenuItem>
              <MenuItem divider />
              <MenuItem data={{foo: 'bar'}} onClick={this.handleClick}>
   	            ContextMenu Item 3
              </MenuItem>
            </ContextMenu>
            <AtdViewer sentences={sentences}></AtdViewer>

      </div>
    );
  }
}

export default App;
