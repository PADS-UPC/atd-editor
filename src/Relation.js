import React, { Component } from 'react';

function generateCandidateAnchors (box) {
    let hw = box.width / 2;
    let hh = box.height / 2;

    console.log(`hw: ${hw}, hh: ${hh}`)

    let cx = box.left + hw;
    let cy = box.top + hh;

    return [[1,0], [-1, 0], [0, 1], [0, -1]].map(([bx,by]) => ({x: cx + bx*hw, y: cy + by*hh}))
}

function sqdist(p1, p2) {
    return (p1.x - p2.x)*(p1.x - p2.x) + (p1.y - p2.y)*(p1.y - p2.y);
}

class Relation extends Component {

    render () {
        let sourceBox = this.props.model.getAnnBoundingBox(this.props.sourceId);
        let destBox = this.props.model.getAnnBoundingBox(this.props.destId);

        let sourceCandidates = generateCandidateAnchors(sourceBox);
        let destCandidates = generateCandidateAnchors(destBox);

        console.log(sourceCandidates);
        console.log(destCandidates);

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
            <div style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: this.props.highlighted ? "1.0" : "0.2"}}>
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
                          onMouseOver={() => this.props.model.setRelHighlighted(this.props.id, true)}
                          onMouseOut={() => this.props.model.setRelHighlighted(this.props.id, false)}/>


                </svg>
            </div>);
    }
}

export default Relation;
