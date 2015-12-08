"use strict";

class api {
    constructor(app){
        app.get('/create', this.create);
        app.get('/destroy', this.destroy);
        return app;
    }

    create(req, res){
        res.send('create OK');
    }

    destroy(req, res){
        res.send('destroy OK');
    }
};

module.exports = api;
