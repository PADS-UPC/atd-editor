import React, { Component } from 'react';
import Utils from "./Utils.js";

var Navbar = require('react-bootstrap').Navbar;
var Nav = require('react-bootstrap').Nav;
var NavDropdown = require('react-bootstrap').NavDropdown;
var MenuItem = require('react-bootstrap').MenuItem;

class NavBar extends Component {

    constructor() {
        super()
        this.saveClicked = this.saveClicked.bind(this);
        this.loadClicked = this.loadClicked.bind(this);
    }

    saveClicked() {
        this.props.model.saveRequest()
            .then(function(response) {
                if (response.status !== "ok") {
                    console.log("Error saving data. "+response.status);
                }
            })
            .catch(() => console.log("Error saving data."))
    }

    loadClicked() {
        let self = this;
        this.props.model.loadRequest()
            .then(function (response) {
                console.log("wat")
                console.log(response)
                if (response.status !== "ok") {
                    console.log(response);
                    console.log("Error loading data. "+response.status);
                }
                else {
                    console.log("Got data:")
                    console.log(response.data);
                    self.props.model.importData(window.paragraphs, response.data);
                    console.log(self.props.model);
                }
            })
            .catch((res) => console.log("Error loading data" + res))
    }

    render() {
        return (
        <Navbar>
            <Navbar.Header>
                <Navbar.Brand>
                    <a href="#home">The Model Judge Editor</a>
                </Navbar.Brand>
            </Navbar.Header>
            <Nav>
                <NavDropdown eventKey={3} title="File" id="basic-nav-dropdown">
                    <MenuItem eventKey={3.1} onClick={this.saveClicked}>Save</MenuItem>
                    <MenuItem eventKey={3.1} onClick={this.loadClicked}>Load</MenuItem>
                    <MenuItem divider />
                    <MenuItem eventKey={3.2}>Placeholder</MenuItem>
                    <MenuItem eventKey={3.3}>Placehodler 2</MenuItem>
                </NavDropdown>
            </Nav>
        </Navbar>)
    }
}

export default NavBar;
