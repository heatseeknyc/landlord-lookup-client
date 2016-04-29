lookup.view = {};

// A simple check to tell whether Leaflet.js has been loaded or not.
lookup.view.checkLeaflet = function() {
    return window.L !== undefined;
};

lookup.view.initMap = function(mapname) {
    lookup.log(1,':: init map');
    var stat = lookup.view.checkLeaflet();
    lookup.log(1,':: init map - stat = '+stat);
    if (!lookup.view.checkLeaflet())  {
        lookup.log(1,':: init map - leaflet not found - aborting');
        return false;
    }

    var center = [40.726389, -73.981667];
    var map = L.map(mapname,{
        center: center, 
        zoomControl: false,
        zoom: 15
    });

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.control.zoom({
        position:'topright'
    }).addTo(map); 
    lookup.view.marker = L.marker(center).addTo(map);
    lookup.view.map = map;
    return true;
};

lookup.view.moveMap = function(center) {
    var map = lookup.view.map;
    if (map)  {
        if (lookup.view.marker)  {
            map.removeLayer(lookup.view.marker);
        }
        map.panTo(center);
        lookup.view.marker = L.marker(center).addTo(map);
    }
};

lookup.view.summary2table = function(r) {
    var html = [], z = 0;
    html[z++] = "<tr>";
    html[z++] = "<th>Active&nbsp;Date</th>";
    html[z++] = "<td>" + r.active_date + "</td>";
    html[z++] = "</tr>";
    html[z++] = "<tr>";
    html[z++] = "<th>Owner&nbsp;Name</th>";
    html[z++] = "<td>" + r.owner_name + "</td>";
    html[z++] = "</tr>";
    html[z++] = "<tr>";
    html[z++] = "<th>Mailng&nbsp;Address</th>";
    html[z++] = "<td>" + r.owner_address.join(', ') + "</td>";
    html[z++] = "</tr>";
    return html;
};



lookup.view.showSummary = function() {
    var r = lookup.model.summary;
    function _plural(n)  {
        if (n !== 1) { return 's'; }
        return '';
    }
    $('#panel-data').hide();
    $('#panel-error').hide();
    $('#panel-message').hide();
    $('#var-summary-bbl').text(r.nycgeo.bbl)
    $('#var-summary-bin').text(r.nycgeo.bin)
    if (r.extras)  {
      $('#section-taxbill-available-false').hide();
      var html = lookup.view.summary2table(r.extras.taxbill);
      $('#tbody-summary-taxbill')[0].innerHTML = html.join('');
      var slug = lookup.utils.bbl2slug(r.nycgeo.bbl);
      $('#link-taxbills-nyc').attr('href','https://taxbills.nyc/'+slug);
      $('#section-taxbill-available-true').show();
    }
    else {
      $('#section-taxbill-available-true').hide();
      $('#tbody-summary-taxbill')[0].innerHTML = '<!-- empty table -->';
      $('#section-taxbill-available-false').show();
    }
    if (r.extras && r.extras.nychpd_contacts)  {
        $('#section-nychpd-available-false').hide();
        var text = r.extras.nychpd_contacts + " contact record" + 
            _plural(r.extras.nychpd_contacts);
        $('#var-nychpd-count').text(text);
        $('#section-nychpd-available-true').show();
    }
    else {
        $('#section-nychpd-available-true').hide();
        $('#section-nychpd-available-false').show();
    }
    if (r.extras && r.extras.dhcr_active)  {
        $('#section-dhcr-active-false').hide();
        $('#section-dhcr-active-true').show();
    }
    else {
        $('#section-dhcr-active-true').hide();
        $('#section-dhcr-active-false').show();
    }
    if (r.nycgeo)  {
      lookup.view.moveMap([r.nycgeo.geo_lat,r.nycgeo.geo_lon]);
    }
    $('#panel-summary').show();
};

lookup.view.showContacts = function() {
    r = lookup.model.contacts;
    $(".panel-lower").hide();
    lookup.log(1,'show contacts!');
    lookup.log(2,r);
    var keys = [
      'registration_id','contact_id','contact_name','contact_type',
      'description','corpname','business_address' 
    ];
    var html = lookup.render.rowset2html(r,keys);
    $("#tbody-contacts")[0].innerHTML = html.join('');
    $("#panel-data").show();
    lookup.log(1,':: pushed (contacts).')
};

lookup.view.showError = function(msg) {
    $('#panel-message').hide();
    $('#panel-summary').hide();
    $('#error-search').text(msg);
    $('#panel-error').show();
};

// Default error message when some invalid UI state occurs.
lookup.view.showDefaultError = function() {
    lookup.view.showError("Something went wrong! Reload the page and try your search again.");
};

lookup.view.showTestPanel = function() {
    $('.panel-lower').hide();
    $('#panel-testdata').show();
};


lookup.view.initPopups = function()  {
    $('.popup-control').click(function(){
        lookup.log(3,"click!");
        lookup.log(3,"this.id = "+this.id);
        var target = $(this).parent()[0];
        lookup.log(3,"target.id = "+target.id);
        $(target).hide();
    });
};

lookup.view.initTabs = function()  {
};

lookup.view.initGoogleAutocomplete = function() {
    if (lookup.config.google_autocomplete_active) {
      // var x = $("#address-input");
      // lookup.log(1,"x = " + typeof(x));
      // lookup.log(1,x);
      $("#address-input").geocomplete(); 
      // $.fn.geocomplete("#address-input");
    }
};




