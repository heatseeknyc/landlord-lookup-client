(function() {

    lookup.app = {};
    lookup.app.run = function() {
        lookup.log(1,'version = '+lookup.version);
        $(document).ready(function () {
            lookup.view.initGoogleAutocomplete();
            lookup.control.initHandlers();
            lookup.view.initMap('themap');
            lookup.view.initPopups();
            lookup.control.processQueryString();
            lookup.log(1,'happy');
        });
        $.ajaxSetup(lookup.config.ajaxsetup);
        lookup.log(1,'launched.');
    };

})();
