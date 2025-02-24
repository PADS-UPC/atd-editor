import React, { Component } from 'react';
import Utils from "./Utils.js";
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

var Navbar = require('react-bootstrap').Navbar;
var Nav = require('react-bootstrap').Nav;
var NavItem = require('react-bootstrap').NavItem;
var NavDropdown = require('react-bootstrap').NavDropdown;
var MenuItem = require('react-bootstrap').MenuItem;

let VisibilityToggle = function(props) {
    let selected = props.model.hiddenTypes[props.type];
    return (
        <ToggleButton
            selected={selected}
            value={props.type}
            onClick={() => props.model.setHiddenState(props.type, !selected)}>
            {selected ? (<span style={{textDecoration: "line-through"}}>{props.type}</span>) : props.type}
        </ToggleButton>);
    }


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
                if (response.status !== "ok") {
                    console.log(response);
                    console.log("Error loading data. "+response.status);
                }
                else {
                    console.log("Got data:")
                    console.log(response.data);
                    // XXX: window.paragraphs!!!
                    self.props.model.importData(window.paragraphs, response.data);
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

                <NavItem>
                    <ToggleButtonGroup style={{boxShadow: "0px 1px 5px 0px rgba(0, 0, 0, 0.2),0px 2px 2px 0px rgba(0, 0, 0, 0.14),0px 3px 1px -2px rgba(0, 0, 0, 0.12)"}}>
                        <VisibilityToggle model={this.props.model} type={"Action"}/>
                        <VisibilityToggle model={this.props.model} type={"Entity"}/>
                        <VisibilityToggle model={this.props.model} type={"Condition"}/>
                    </ToggleButtonGroup>
                </NavItem>
                <NavItem>
                    <ToggleButtonGroup style={{boxShadow: "0px 1px 5px 0px rgba(0, 0, 0, 0.2),0px 2px 2px 0px rgba(0, 0, 0, 0.14),0px 3px 1px -2px rgba(0, 0, 0, 0.12)"}}>
                        <VisibilityToggle model={this.props.model} type={"Agent"}/>
                        <VisibilityToggle model={this.props.model} type={"Patient"}/>
                    </ToggleButtonGroup>
                </NavItem>
                <NavItem>
                    <ToggleButtonGroup style={{boxShadow: "0px 1px 5px 0px rgba(0, 0, 0, 0.2),0px 2px 2px 0px rgba(0, 0, 0, 0.14),0px 3px 1px -2px rgba(0, 0, 0, 0.12)"}}>
                        <VisibilityToggle model={this.props.model} type={"Exclusive"}/>
                        <VisibilityToggle model={this.props.model} type={"Sequential"}/>
                        <VisibilityToggle model={this.props.model} type={"Parallel"}/>
                    </ToggleButtonGroup>
                </NavItem>
                <NavItem>
                    <ToggleButtonGroup style={{boxShadow: "0px 1px 5px 0px rgba(0, 0, 0, 0.2),0px 2px 2px 0px rgba(0, 0, 0, 0.14),0px 3px 1px -2px rgba(0, 0, 0, 0.12)"}}>
                        <VisibilityToggle model={this.props.model} type={"Coreference"}/>
                    </ToggleButtonGroup>
                </NavItem>
            </Nav>
        </Navbar>)
    }
}

export default NavBar;
