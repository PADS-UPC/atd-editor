import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import NavBar from "./NavBar.js";
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

let TEST = "T99	Condition 194 227	he wants an individual membership\nT100	Condition 274 302	he wants a family membership\nT53	Entity 708 739	the payment request to the bank\nT10	Entity 113 125	the customer\nT67	Action 815 822	charges\nT25	Entity 312 314	he\nT35	Action 475 485	introduces\nT18	Action 237 244	prepare\nT32	Action 403 407	give\nT77	Action 876 885	confirmed\nT96	Entity 1099 1107	the card\nT80	Entity 887 909	the ZooClub department\nT40	Entity 540 559	the payment request\nT34	Entity 408 424	this information\nT33	Entity 380 392	The customer\nT82	Action 933 940	deliver\nT98	Entity 1109 1111	he\nT88	Entity 1008 1071	a request to mail the Zoo Club's magazine to the visitor's home\nT19	Entity 229 231	he\nT63	Entity 760 783	the payment information\nT45	Action 615 623	forwards\nT11	Entity 138 189	whether he wants an individual or family membership\nT69	Entity 823 834	the payment\nT47	Entity 624 649	the visitor's information\nT94	Action 1090 1098	receives\nT26	Entity 330 370	the information for its spouse and spawn\nT78	Entity 861 872	the payment\nT24	Action 322 329	prepare\nT50	Entity 679 701	The billing department\nT9	Action 131 137	decide\nT86	Action 1002 1007	makes\nT81	Entity 920 928	the card\nT60	Entity 741 749	The bank\nT84	Entity 941 943	it\nT46	Entity 587 609	The ZooClub department\nT97	Action 1116 1118	go\nT37	Entity 486 513	the visitor's personal data\nT95	Entity 1078 1089	the visitor\nT79	Action 914 919	print\nT51	Action 702 707	sends\nT38	Action 534 539	takes\nT87	Entity 977 1001	the Marketing department\nT36	Entity 452 474	The ZooClub department\nT61	Action 750 759	processes\nT20	Entity 245 269	his personal information\nR22	Agent Arg1:T35 Arg2:T36	\nR53	Agent Arg1:T94 Arg2:T95	\nR35	Agent Arg1:T61 Arg2:T60	\nR48	Agent Arg1:T86 Arg2:T87	\nR39	Patient Arg1:T67 Arg2:T69	\nR16	Patient Arg1:T24 Arg2:T26	\nR12	Patient Arg1:T18 Arg2:T20	\nR46	Agent Arg1:T82 Arg2:T80	\nR38	Agent Arg1:T67 Arg2:T60	\nR55	Agent Arg1:T97 Arg2:T98	\nR15	Agent Arg1:T24 Arg2:T25	\nR21	Patient Arg1:T32 Arg2:T34	\nR36	Patient Arg1:T61 Arg2:T63	\nR45	Patient Arg1:T79 Arg2:T81	\nR28	Patient Arg1:T45 Arg2:T47	\nR5	Agent Arg1:T9 Arg2:T10	\nR47	Patient Arg1:T82 Arg2:T84	\nR20	Agent Arg1:T32 Arg2:T33	\nR25	Patient Arg1:T38 Arg2:T40	\nR27	Agent Arg1:T45 Arg2:T46	\nR6	Patient Arg1:T9 Arg2:T11	\nR49	Patient Arg1:T86 Arg2:T88	\nR11	Agent Arg1:T18 Arg2:T19	\nR31	Patient Arg1:T51 Arg2:T53	\nR30	Agent Arg1:T51 Arg2:T50	\nR54	Patient Arg1:T94 Arg2:T96	\nR24	Agent Arg1:T38 Arg2:T36	\nR23	Patient Arg1:T35 Arg2:T37	\nR44	Agent Arg1:T79 Arg2:T80	\nR43	Patient Arg1:T77 Arg2:T78	\nR56	Coreference Arg1:T37 Arg2:T47	\nR61	Coreference Arg1:T33 Arg2:T10	\nR66	Coreference Arg1:T47 Arg2:T63	\nR68	Coreference Arg1:T20 Arg2:T34	\nR69	Coreference Arg1:T80 Arg2:T46	\nR70	Coreference Arg1:T46 Arg2:T36	\nR73	Coreference Arg1:T53 Arg2:T60	\nR76	Coreference Arg1:T78 Arg2:T69	\nR78	Coreference Arg1:T81 Arg2:T96	\nR1	Coreference Arg1:T84 Arg2:T81	\nR2	Coreference Arg1:T98 Arg2:T95	\nT1	Action 15 20	wants\nT2	Entity 7 14	visitor\nT3	Entity 21 39	to become a member\nR3	Patient Arg1:T1 Arg2:T3	\nR4	Agent Arg1:T1 Arg2:T2	\n";


function splitTextInParagraphs(text) {
    return text.split("\n\n");
}

class App extends Component {

    constructor () {
        super();
        this.state = {
            paragraphs: null,
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
               //               () => {this.state.model.importData(this.state.paragraphs, TEST)}
                ))
            .catch((error) => console.log("Error loading text: " + error));
    }

    render() {

        return (
            <div className="App" style={{"backgroundColor": "#eeeeee", "paddingBottom": "100%"}}>
                <NavBar model={this.state.model}/>
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
