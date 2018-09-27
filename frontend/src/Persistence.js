function mkPersistence (model) {
    let save = function () {
        fetch("/api/save", {
            method: "POST",
            body: JSON.stringify(model)
        }).then((res) => res);
    };

    let load = function () {
        fetch("/api/load", {
        }).then((res) => res.json());
    };

    return {
        save,
        load
    };
}

export default mkPersistence;
