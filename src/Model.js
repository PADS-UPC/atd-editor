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


    /** Constructor for annotations */
    let mkAnnotation = function (paragraphId, type, start, end) {
        let id = "A"+annCount++;
        let hover = false;
        return {id, paragraphId, type, start, end, hover};
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


    return {
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
        setHover
    };
}

export default mkModel;
