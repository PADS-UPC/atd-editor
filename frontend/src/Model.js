import Utils from "./Utils.js";
import Constants from "./Constants.js";

function mkModel (reRender) {

    let model = {};

    /** The annotations, these will be highlighted in the text and also displayed at the left panel */
    model.annotations = [];

    /** The relations */
    model.relations = [];

    /** Attributes are modifiers on annotations */
    model.attributes = [];

    model.annCount = 0;
    model.relCount = 0;
    model.attrCount = 0;



    /** Constructor for annotations */
    model.mkAnnotation = function (paragraphId, type, start, end) {
        let id = "T"+model.annCount++;
        let hover = false;
        let paragraph = document.getElementById(paragraphId);
        let text = paragraph.textContent.substring(start, end);
        let startBox = Utils.getCharacterPositionInParagraph(paragraph, start);
        let endBox = Utils.getCharacterPositionInParagraph(paragraph, end);

        let annRects = Utils.computeRects(paragraph, startBox, endBox);

        return {id, paragraphId, type, start, end, hover, annRects, text};
    };

    model.mkRelation = function (type, sourceId, destId) {
        let id = "R"+model.relCount++;
        return {id, type, sourceId, destId};
    };

    model.mkAttribute = function(type, annId) {
        let id = "A"+model.attrCount++;
        return {id, type, annId};
    };

    /** Source: https://stackoverflow.com/questions/37318808/what-is-the-in-place-alternative-to-array-prototype-filter */
    model.filterInPlace = function filterInPlace(a, condition, thisArg) {
        let j = 0;

        a.forEach((e, i) => {
            if (condition.call(thisArg, e, i, a)) {
                if (i!==j) a[j] = e;
                j++;
            }
        });

        a.length = j;
        return a;
    };

    /** Removes the annotation with id from the model */
    model.deleteAnnotation = function (id) {
        model.filterInPlace(model.annotations, (ann) => ann.id !== id);
        model.relations
            .filter((rel) => rel.sourceId === id || rel.destId ===id)
            .forEach((rel) => model.deleteRelation(rel.id));

        reRender();
    };

    /** Inserts the given annotation into the model */
    model.addAnnotation = function(annotation) {
        model.annotations.push(annotation);
        reRender();
    };

    /** Removes the relation with id from the model */
    model.deleteRelation = function(id) {
        model.filterInPlace(model.relations, (rel) => rel.id !== id);
        reRender();
    };

    /** Inserts the given relation into the model */
    model.addRelation = function(relation) {
        model.relations.push(relation);
        reRender();
    };

    model.hiddenTypes = {
    };

    // NOTE: This function works under the assumption that relations and spans
    // will never share a type name, and thus the type can be used reliably 
    model.hideType = function(type) {
        model.hiddenTypes[type] = true;
        reRender();
    };

    model.showType = function(type) {
        model.hiddenTypes[type] = false;
        reRender();
    };

    model.setHiddenState = function(type, hiddenState) {
        model.hiddenTypes[type] = hiddenState;
        reRender();
    };

    model.hasAttribute = function(id, attrType) {
        let attrs = model.attributes.filter((attr) => attr.annId === id && attr.type === attrType);
        return attrs.length > 0;
    };

    model.toggleAttribute = function(id, attrType) {
        if (model.hasAttribute(id, attrType)) {
            model.attributes = model.attributes.filter((attr) => !(id === attr.annId && attrType === attr.type));
        } else {
            model.attributes.push(model.mkAttribute(attrType, id));
        }
    };

    /** Returns whether a type should be hidden. Note that, for example, in relations,
        if Actions are hidden, temporal relations should be too. */
    model.shouldBeHidden = function(type) {
        if (model.hiddenTypes[type]) return true;
        else if (Constants.relationTypes[type] &&
            Constants.relationTypes[type].flat().some((t) => model.hiddenTypes[t]))
            return true;
        else return false;
    };


    model.getAnnotation = function(id) {
        let index = model.annotations.findIndex((ann) => ann.id === id);
        return model.annotations[index];
    };

    model.getRelation = function(id) {
        let index = model.relations.findIndex((rel) => rel.id === id);
        return model.relations[index];
    };


    /** Sets the hover state for an annotation */
    model.setHover = function(id, hoverState) {
        //let index = model.annotations.findIndex((ann) => ann.id === id);
        //model.annotations[index].hover = hoverState;
        //reRender();
    };

    /** Returns the hover group of element with given id */
    model.getHoverGroup = function(id) {
        let hoverGroup = [];
        if (id[0] === "T") {
            // Annotation hovered
            hoverGroup = hoverGroup.concat(
                model.relations
                    .filter((rel) => rel.sourceId === id || rel.destId === id)
                    .map((rel) => rel.id));
        } else if (id[0] === "R"){
            // Relation hovered
            let rel = model.getRelation(id);
            hoverGroup = [rel.sourceId, rel.destId];
        }

        return hoverGroup;
    };

    /** Sets the hover state for an annotation */
    model.getHover = function(id) {
        //let index = model.annotations.findIndex((ann) => ann.id === id);
        //return model.annotations[index].hover;
    };

    model.getAnnBoundingBox = function (id) {
        let index = model.annotations.findIndex((ann) => ann.id === id);
        let annRects = model.annotations[index].annRects;

        let rects = annRects.map((rect) => ({top: rect.top,
                                             bottom: rect.top + rect.height,
                                             left: rect.left,
                                             right: rect.left + rect.width}));

        let bbox = Object.assign({}, annRects[0]);
        rects.forEach(function(rect) {
            if (rect.top < bbox.top) {bbox.top = rect.top;}
            if (rect.bottom > bbox.bottom) {bbox.bottom = rect.bottom;}
            if (rect.left < bbox.left) {bbox.left = rect.left;}
            if (rect.right > bbox.right) {bbox.right = rect.right;}
        });

        return bbox;
    };

    model.isRelHighlighted = function (relId) {
        //let index = model.relations.findIndex((rel) => rel.id === relId);
        //let rel = model.relations[index];
        //return rel.highlighted || model.getHover(rel.sourceId) || model.getHover(rel.destId);
    };

    model.setRelHighlighted = function (relId, highlighted) {
        //let index = model.relations.findIndex((rel) => rel.id === relId);
        //model.relations[index].highlighted = highlighted;
        //reRender();
    };

    model.saveRequest = function () {
        let p = fetch("/api/save", {
            method: "POST",
            body: Utils.exportBratFile(model.annotations,
                                       model.relations,
                                       model.attributes)
        }).then((res) => res.json());
        return p;
    };

    model.loadRequest = function () {
        let p = fetch("/api/load", {
        }).then((res) => res.json());
        return p;
    };

    model.loadData = function (data) {
        // Clear existing arrays
        model.relations.length = 0;
        model.annotations.length = 0;

        model.relations.push(...data.relations);
        model.annotations.push(...data.annotations);
        model.annCount = data.annCount;
        model.relCount = data.relCount;
        reRender();
    };

    model.importData = function (paragraphs, bratString) {
        console.log("Importing data");
        let parsedData = Utils.parseBratFile(paragraphs, bratString);

        let newAnnotations = [];
        let newAttributes = [];
        let newRelations = [];

        // Load the imported annotations and relations
        parsedData.forEach((l) => {
            if (l.metaType === "Annotation") {
                let {id, paragraphId, type, start, end, text} = l;

                /// XXX
                if (text === "an individual or family membership") {window.debugFoo = 1;}

                let ann = model.mkAnnotation(paragraphId, type, start, end);
                ann.id = id;
                newAnnotations.push(ann);
                console.assert(ann.text === text);
            }
            else if (l.metaType === "Relation") {
                // let mkRelation = function (type, sourceId, destId) {
                let {id, type, sourceId, destId} = l;
                let rel = model.mkRelation(type, sourceId, destId);
                rel.id = id;
                newRelations.push(rel);
            }
            else if (l.metaType === "Attribute") {
                let {id, type, annId} = l;
                let attr = model.mkAttribute(type, annId);
                attr.id = id;
                newAttributes.push(attr);
            }

        });

        // Fix annCount and relCount for future ids
        model.annCount = newAnnotations.length === 0 ? 0 : 1 + Math.max(...newAnnotations.map((ann) => parseInt(ann.id.replace("T", ""), 10)));
        model.relCount = newRelations.length === 0 ? 0 : 1 + Math.max(...newRelations.map((rel) => parseInt(rel.id.replace("R", ""), 10)));
        model.attrCount = newAttributes.length === 0 ? 0 : 1 + Math.max(...newAttributes.map((rel) => parseInt(rel.id.replace("A", ""), 10)));

        model.annotations = newAnnotations;
        model.relations = newRelations;
        model.attributes = newAttributes;

        reRender();
    };

    window.model = model;

    return model;
}

export default mkModel;
