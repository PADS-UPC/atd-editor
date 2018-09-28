
function Utils () {
    let utils = {};


    utils.viewportRelativeBox = function(element) {
        let rparent = document.getElementById('annotations-root').getBoundingClientRect();
        let relement = element.getBoundingClientRect();

        return {
            top: relement.top - rparent.top,
            right: relement.right - rparent.left,
            bottom: relement.bottom - rparent.top,
            left: relement.left - rparent.left
        };
    };

    utils.viewportRelativeBox2 = function(element) {
        let rparent = document.getElementById('annotations-root').getBoundingClientRect();
        let relement = element.getBoundingClientRect();

        return {
            top: relement.top - rparent.top,
            right: relement.right - rparent.right,
            bottom: relement.bottom - rparent.bottom,
            left: relement.left - rparent.left
        };
    };



    /*@pre: paragraph is a <p> element containing only plain text*/
    utils.getCharacterPositionInParagraph = function(paragraph, offset) {
        let html = paragraph.innerHTML;
        let [html1, html2] = [html.slice(0, offset), html.slice(offset)];
        paragraph.innerHTML = html1+"<span id='marker'></span>"+html2;
        let box = utils.viewportRelativeBox(document.getElementById('marker'));
        paragraph.innerHTML = html;

        return box;
    };


    /** Computes the necessary rectangles of an annotation given the selection start
        and end positions, and the paragraph node with the selection */
    utils.computeRects = function(paragraph, startBox, endBox) {
        let lineHeight = parseFloat(window.getComputedStyle(paragraph).getPropertyValue("line-height").replace("px",""));
        let paragraphRect = utils.viewportRelativeBox(paragraph);
        let lineStart = paragraphRect.left;
        let lineEnd = paragraphRect.right;
        let numLines = Math.round(((endBox.top + lineHeight) - startBox.top) / lineHeight);
        let annRects = [];

        if (numLines === 1) {
            // Start and end on same line
            annRects = annRects.concat({top: startBox.top,
                                        left: startBox.left,
                                        width: endBox.left - startBox.left,
                                        height: lineHeight});
        } else {
            let lineTop = startBox.top;
            // First line
            annRects = annRects.concat({width: lineEnd - startBox.left,
                                        height: lineHeight,
                                        top: lineTop,
                                        left: startBox.left});

            lineTop += lineHeight;

            // Full lines (intermediate)
            for (var i = 1; i < numLines - 1; ++i) {
                annRects = annRects.concat({width: lineEnd - lineStart,
                                            height: lineHeight,
                                            top: lineTop,
                                            left: lineStart});

                lineTop += lineHeight;
            }

            // Last line
            annRects = annRects.concat({width: endBox.left - lineStart,
                                        height: lineHeight,
                                        top: lineTop,
                                        left: lineStart});
        }

        return annRects;
    };

    // Converts a brat range to an internal range representation.
    // @pre: This assumes start, end are in the same paragraph.
    utils.bratRangeToRange = function(paragraphs, start, end) {
        let paragraphIndex = -1;

        let currentLength = 0;
        for (let i = 0; i < paragraphs.length; ++i) {
            if (start < currentLength + paragraphs[i].length) {
                paragraphIndex = i;
                start -= currentLength;
                end -= currentLength;
                break;
            }
            // NOTE: Add 2 to account for endline characters
            currentLength += paragraphs[i].length + 2;
        }

        if (paragraphIndex === -1) return null;
        else return {start, end, paragraphId: `paragraph-${paragraphIndex}`};

    };

    // Converts an internal range representation to a range suited for brat exporting.
    // @pre: This assumes start, end are in the same paragraph.
    utils.rangeToBratRange = function(paragraphs, paragraphId, start, end) {
        let paragraphIndex = parseInt(paragraphId.replace("paragraph-", ""), 10);

        let length = 0;
        for (let i = 0; i < paragraphIndex; ++i) {
            // NOTE: Add 2 to account for endline characters
            length += paragraphs[i].length + 2;
        }

        return {start: start+length, end: end+length};
    };

    utils.tokenizeBratLine = function(bratLine) {
        return bratLine.split(/\s+/);
    };

    utils.parseBratLine = function(paragraphs, args) {
        if (args[0].match(/^T/)) {
            return utils.parseBratSpan(paragraphs, args);
        }
        else if (args[0].match(/^R/)) {
            return utils.parseBratRelation(paragraphs, args);
        }
        else if (args[0].match(/^A/)) {
            return utils.parseBratAttribute(paragraphs, args);
        }
        else {
            console.log("Warning: Ignoring input line "+JSON.stringify(args));
            return null;
        }
    };

    utils.parseBratRelation = function(paragraphs, args) {
        let [id, type, sourceId, destId] = args;

        return {metaType: "Relation",
                id,
                type,
                sourceId: sourceId.replace(/Arg\d+:/, ""),
                destId: destId.replace(/Arg\d+:/, "")};
    };

    utils.parseBratSpan = function(paragraphs, args) {
        let [id, type, start, end, ...text] = args;
        let fixedRange = utils.bratRangeToRange(paragraphs, start, end);
        let fixedText = text.join(" ");

        return {metaType: "Annotation",
                id,
                type,
                text: fixedText,
                start: fixedRange.start,
                end: fixedRange.end,
                paragraphId: fixedRange.paragraphId};
    };

    utils.parseBratAttribute = function(paragraphs, args) {
        let [id, type, annId] = args;
        return {metaType: "Attribute",
                id,
                type,
                annId};
    };

    utils.parseBratFile = function(paragraphs, bratFile) {
        let lines = bratFile.split("\n");
        let parsedLines = lines
            .map((line) => utils.parseBratLine(paragraphs, utils.tokenizeBratLine(line)));

        return parsedLines.filter((x) => x);
    };

    utils.exportBratFile = function(annotations, relations, attributes) {
        let out = "";
        annotations.forEach((ann) => {
            // XXX: window.paragraphs!!!
            let {start, end} = utils.rangeToBratRange(window.paragraphs, ann.paragraphId, ann.start, ann.end);
            out += ann.id + "\t" + ann.type + " " +
                start + " " + end + "\t" + ann.text + "\n";
        });
        relations.forEach((rel) => {
            out += rel.id + "\t" + rel.type + " Arg1:" + rel.sourceId +
                " Arg2:" + rel.destId + "\n";
        });
        attributes.forEach((attr) => {
            out += attr.id + "\t" + attr.type + " " + attr.annId + "\n";
        });
        return out;
    };

    return utils;
}

/*
console.log(Utils().parseBratFile(["When a visitor wants to become a member of Barcelona's ZooClub, the following steps must be taken.\nFirst of all, the customer must decide whether he wants an individual or family membership.\nIf he wants an individual membership, he must prepare his personal information.\nIf he wants a family membership instead, he should prepare the information for its spouse and spawn as well.",
                       "The customer must then give this information to the ZooClub department.\nThe ZooClub department introduces the visitor's personal data into the system and takes the payment request to the Billing department.\nThe ZooClub department also forwards the visitor's information to the marketing department.\nThe billing department sends the payment request to the bank.\nThe bank processes the payment information and, if everything is correct, charges the payment into user's account.",
                       "Once the payment is confirmed, the ZooClub department can print the card and deliver it to the visitor.\nIn the meantime, the Marketing department makes a request to mail the Zoo Club's magazine to the visitor's home. Once the visitor receives the card, he can go home.\n"],

                                  "T99	Condition 194 227	he wants an individual membership\nT100	Condition 274 302	he wants a family membership\nT53	Entity 708 739	the payment request to the bank\nT10	Entity 113 125	the customer\nT67	Action 815 822	charges\nT25	Entity 312 314	he\nT35	Action 475 485	introduces\nT18	Action 237 244	prepare\nT32	Action 403 407	give\nT77	Action 876 885	confirmed\nT96	Entity 1099 1107	the card\nT80	Entity 887 909	the ZooClub department\nT40	Entity 540 559	the payment request\nT34	Entity 408 424	this information\nT33	Entity 380 392	The customer\nT82	Action 933 940	deliver\nT98	Entity 1109 1111	he\nT88	Entity 1008 1071	a request to mail the Zoo Club's magazine to the visitor's home\nT19	Entity 229 231	he\nT63	Entity 760 783	the payment information\nT45	Action 615 623	forwards\nT11	Entity 138 189	whether he wants an individual or family membership\nT69	Entity 823 834	the payment\nT47	Entity 624 649	the visitor's information\nT94	Action 1090 1098	receives\nT26	Entity 330 370	the information for its spouse and spawn\nT78	Entity 861 872	the payment\nT24	Action 322 329	prepare\nT50	Entity 679 701	The billing department\nT9	Action 131 137	decide\nT86	Action 1002 1007	makes\nT81	Entity 920 928	the card\nT60	Entity 741 749	The bank\nT84	Entity 941 943	it\nT46	Entity 587 609	The ZooClub department\nT97	Action 1116 1118	go\nT37	Entity 486 513	the visitor's personal data\nT95	Entity 1078 1089	the visitor\nT79	Action 914 919	print\nT51	Action 702 707	sends\nT38	Action 534 539	takes\nT87	Entity 977 1001	the Marketing department\nT36	Entity 452 474	The ZooClub department\nT61	Action 750 759	processes\nT20	Entity 245 269	his personal information\nR22	Agent Arg1:T35 Arg2:T36	\nR53	Agent Arg1:T94 Arg2:T95	\nR35	Agent Arg1:T61 Arg2:T60	\nR48	Agent Arg1:T86 Arg2:T87	\nR39	Patient Arg1:T67 Arg2:T69	\nR16	Patient Arg1:T24 Arg2:T26	\nR12	Patient Arg1:T18 Arg2:T20	\nR46	Agent Arg1:T82 Arg2:T80	\nR38	Agent Arg1:T67 Arg2:T60	\nR55	Agent Arg1:T97 Arg2:T98	\nR15	Agent Arg1:T24 Arg2:T25	\nR21	Patient Arg1:T32 Arg2:T34	\nR36	Patient Arg1:T61 Arg2:T63	\nR45	Patient Arg1:T79 Arg2:T81	\nR28	Patient Arg1:T45 Arg2:T47	\nR5	Agent Arg1:T9 Arg2:T10	\nR47	Patient Arg1:T82 Arg2:T84	\nR20	Agent Arg1:T32 Arg2:T33	\nR25	Patient Arg1:T38 Arg2:T40	\nR27	Agent Arg1:T45 Arg2:T46	\nR6	Patient Arg1:T9 Arg2:T11	\nR49	Patient Arg1:T86 Arg2:T88	\nR11	Agent Arg1:T18 Arg2:T19	\nR31	Patient Arg1:T51 Arg2:T53	\nR30	Agent Arg1:T51 Arg2:T50	\nR54	Patient Arg1:T94 Arg2:T96	\nR24	Agent Arg1:T38 Arg2:T36	\nR23	Patient Arg1:T35 Arg2:T37	\nR44	Agent Arg1:T79 Arg2:T80	\nR43	Patient Arg1:T77 Arg2:T78	\nR56	Coreference Arg1:T37 Arg2:T47	\nR61	Coreference Arg1:T33 Arg2:T10	\nR66	Coreference Arg1:T47 Arg2:T63	\nR68	Coreference Arg1:T20 Arg2:T34	\nR69	Coreference Arg1:T80 Arg2:T46	\nR70	Coreference Arg1:T46 Arg2:T36	\nR73	Coreference Arg1:T53 Arg2:T60	\nR76	Coreference Arg1:T78 Arg2:T69	\nR78	Coreference Arg1:T81 Arg2:T96	\nR1	Coreference Arg1:T84 Arg2:T81	\nR2	Coreference Arg1:T98 Arg2:T95	\nT1	Action 15 20	wants\nT2	Entity 7 14	visitor\nT3	Entity 21 39	to become a member\nR3	Patient Arg1:T1 Arg2:T3	\nR4	Agent Arg1:T1 Arg2:T2	\n"));
*/

window.Utils = Utils();

export default Utils();
