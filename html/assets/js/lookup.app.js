(function() {

    lookup.app = {};
    lookup.app.run = function() {
        lookup.log(1,'version = '+lookup.version);
        $(document).ready(function () {
            lookup.service.initConf();
            lookup.view.initGoogleAutocomplete();
            lookup.control.initHandlers();
            lookup.view.initDust();
            lookup.view.initMap('themap');
            lookup.view.initPopups();
            lookup.control.processLocalPath();
            lookup.log(1,'happy');
        });
        $.ajaxSetup(lookup.config.ajaxsetup);
        lookup.log(1,'launched.');
    };

})();
