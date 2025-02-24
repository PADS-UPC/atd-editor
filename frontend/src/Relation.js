import React, { PureComponent,  Component } from 'react';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

function generateCandidateAnchors (box) {
    let hw = box.width / 2;
    let hh = box.height / 2;

    let cx = box.left + hw;
    let cy = box.top + hh;

    return [[1,0], [-1, 0], [0, 1], [0, -1]].map(([bx,by]) => ({x: cx + bx*hw, y: cy + by*hh}))
}

function sqdist(p1, p2) {
    return (p1.x - p2.x)*(p1.x - p2.x) + (p1.y - p2.y)*(p1.y - p2.y);
}

class Relation extends Component {

    shouldComponentUpdate (nextProps, nextState) {
        let eq = true;

        eq = eq && this.props.highlighted === nextProps.highlighted;
        eq = eq && this.props.hidden === nextProps.hidden;


        return !eq;

    }

    render () {
        let sourceBox = this.props.sourceBox;
        let destBox = this.props.destBox;

        let sourceCandidates = generateCandidateAnchors(sourceBox);
        let destCandidates = generateCandidateAnchors(destBox);

        let minVal = Infinity;
        let minPair = null;

        for (let i = 0; i < sourceCandidates.length; ++i) {
            for (let j = 0; j < destCandidates.length; ++j) {
                let d = sqdist(sourceCandidates[i], destCandidates[j]);
                if (d < minVal) {
                    minVal = d;
                    minPair = [sourceCandidates[i], destCandidates[j]];
                }
            }
        }

        let v = { x: minPair[1].x - minPair[0].x,
                  y: minPair[1].y - minPair[0].y }
        let mv = Math.sqrt(v.x*v.x + v.y*v.y);
        let arrowheadSize = 11;

        if (mv > arrowheadSize * 1.5) {
            let delta = {x: arrowheadSize * v.x/mv, y: arrowheadSize * v.y/mv};
            minPair[1].x = minPair[1].x - delta.x;
            minPair[1].y = minPair[1].y - delta.y;
        }

        return (
            <div>
                <ContextMenu id={"relationdel-"+this.props.id+"-context-menu"}>
                    <MenuItem data={{action: 'deleteAnnotation'}}
                              onClick={() => {this.props.callbacks.deleteRelation(this.props.id); this.forceUpdate();}}>
                        Delete Relation
                    </MenuItem>
                </ContextMenu>
                <ContextMenuTrigger id={"relationdel-"+this.props.id+"-context-menu"} ref={c => this.delRelContextMenu = c}/>
                <div hidden={this.props.hidden} style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: this.props.highlighted ? "1.0" : "0.2"}}>

                    <svg width='100%' height='100%'
                         style={{position: "relative", pointerEvents: "none"}}>
                        <defs>
                            <marker id="markerArrow" markerWidth="13" markerHeight="13"
                                    style={{pointerEvents: "fill"}}
                                    refX="2" refY="6" orient="auto">
                                <path d="M0,3 l0,6 l8,-3 l-8,-3" style={{fill: "#000000"}} />
                            </marker>
                        </defs>

                        <line style={{pointerEvents: "none"}}
                              x1={minPair[0].x} y1={minPair[0].y}
                              x2={minPair[1].x} y2={minPair[1].y}
                              className="arrow" />

                        <line style={{pointerEvents: "stroke", strokeWidth: "10"}}
                              x1={minPair[0].x} y1={minPair[0].y}
                              x2={minPair[1].x} y2={minPair[1].y}
                              onClick={(ev) => {
                                      // TODO: Please forgive me
                                      document.getElementById("rel-card-"+this.props.id)
                                              .scrollIntoView({behavior: "smooth",
                                                               inline: "nearest",
                                                               block: "nearest"});
                              }}
                              onContextMenu={(ev) => {
                                      this.delRelContextMenu.handleContextClick(ev);
                                      return false;
                              }}
                              onMouseOver={() => this.props.callbacks.onHoverStart(this.props.id)}
                              onMouseOut={() => this.props.callbacks.onHoverEnd(this.props.id)}/>
                    </svg>
                </div>
            </div>);
    }
}

export default Relation;
