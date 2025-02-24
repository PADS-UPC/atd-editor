function Constants() {

    let constants = {};

    constants.relationCompatibilities = {
        "Entity": {"Entity": ["Coreference"]},
        "Action": {"Entity": ["Agent", "Patient"],
                   "Action": ["Exclusive", "Parallel", "Sequential"]}
    };

    constants.relationTypes = {
        "Coreference": ["Entity", "Entity"],
        "Agent": ["Action", "Entity"],
        "Patient": ["Action", "Entity"],
        "Exclusive": ["Action", "Action"],
        "Parallel": ["Action", "Action"],
        "Sequential": ["Action", "Action"]
    };

    constants.typeColors = {
        "Action": "#d97881",
        "Condition": "#81d978",
        "Entity": "#7881d9"
    };

    constants.dullTypeColors = {
        "Action": "#f0cbcf",
        "Condition": "#cff0cb",
        "Entity": "#cbcff0"
    };

    return constants;

}

export default Constants();
