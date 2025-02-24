function mkModel (reRender) {

    /** The annotations, these will be highlighted in the text and also displayed at the left panel */
    let annotations = [];

    /** The relations */
    let relations = [];

    let annCount = 0;
    let relCount = 0;

    let relationCompatibilities = {
        "Entity": {"Entity": ["Coreference"]},
        "Action": {"Entity": ["Agent", "Patient"],
                   "Action": ["Exclusive", "Parallel", "Sequential"]}
    };


    let typeColors = {
        "Action": "#d97881",
        "Condition": "#81d978",
        "Entity": "#7881d9"
    };

    let dullTypeColors = {
        "Action": "#f0cbcf",
        "Condition": "#cff0cb",
        "Entity": "#cbcff0"
    };


    /** Constructor for annotations */
    let mkAnnotation = function (paragraphId, type, start, end, text, annRects) {
        let id = "A"+annCount++;
        let hover = false;
        return {id, paragraphId, type, start, end, hover, annRects, text};
    };

    let mkRelation = function (type, sourceId, destId) {
        let id = "R"+relCount++;
        return {id, type, sourceId, destId};
    };

    /** Source: https://stackoverflow.com/questions/37318808/what-is-the-in-place-alternative-to-array-prototype-filter */
    let filterInPlace = function filterInPlace(a, condition, thisArg) {
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
    let deleteAnnotation = function (id) {
        filterInPlace(annotations, (ann) => ann.id !== id);
        relations
            .filter((rel) => rel.sourceId === id || rel.destId ===id)
            .forEach((rel) => deleteRelation(rel.id));

        reRender();
    };

    /** Inserts the given annotation into the model */
    let addAnnotation = function(annotation) {
        annotations.push(annotation);
        reRender();
    };

    /** Removes the relation with id from the model */
    let deleteRelation = function(id) {
        filterInPlace(relations, (rel) => rel.id !== id);
        reRender();
    };

    /** Inserts the given relation into the model */
    let addRelation = function(relation) {
        relations.push(relation);
        reRender();
    };


    /** Sets the hover state for an annotation */
    let setHover = function(id, hoverState) {
        let index = annotations.findIndex((ann) => ann.id === id);
        annotations[index].hover = hoverState;
        reRender();
    };

    /** Sets the hover state for an annotation */
    let getHover = function(id) {
        let index = annotations.findIndex((ann) => ann.id === id);
        return annotations[index].hover;
    };

    let getAnnBoundingBox = function (id) {
        let index = annotations.findIndex((ann) => ann.id === id);
        let annRects = annotations[index].annRects;

        let rects = annRects.map((rect) => ({top: rect.top,
                                             bottom: rect.top + rect.height,
                                             left: rect.left,
                                             right: rect.left + rect.width}));

        let bbox = annRects[0];
        rects.forEach(function(rect) {
            if (rect.top < bbox.top) {bbox.top = rect.top;}
            if (rect.bottom > bbox.bottom) {bbox.bottom = rect.bottom;}
            if (rect.left < bbox.left) {bbox.left = rect.left;}
            if (rect.right > bbox.right) {bbox.right = rect.right;}
        });

        return bbox;
    };

    let isRelHighlighted = function (relId) {
        let index = relations.findIndex((rel) => rel.id === relId);
        let rel = relations[index];
        return rel.highlighted || getHover(rel.sourceId) || getHover(rel.destId);
    };

    let setRelHighlighted = function (relId, highlighted) {
        let index = relations.findIndex((rel) => rel.id === relId);
        relations[index].highlighted = highlighted;
        reRender();
    };


    return {
        typeColors,
        dullTypeColors,
        relationCompatibilities,
        mkAnnotation,
        mkRelation,
        relations,
        annotations,
        deleteAnnotation,
        addAnnotation,
        deleteRelation,
        addRelation,
        getHover,
        setHover,
        getAnnBoundingBox,
        isRelHighlighted,
        setRelHighlighted
    };
}

export default mkModel;
