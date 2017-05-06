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
        zoom: 18 
    });

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 20
    }).addTo(map);

    L.control.zoom({
        position:'topright'
    }).addTo(map); 
    lookup.view.marker = L.marker(center).addTo(map);
    lookup.view.map = map;
    return true;
};

lookup.view.moveMap = function(center,addMarker) {
    var map = lookup.view.map;
    if (map)  {
        if (lookup.view.marker)  {
            map.removeLayer(lookup.view.marker);
        }
        map.panTo(center);
        if (addMarker)  {
            lookup.view.marker = L.marker(center).addTo(map);
        }
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
    lookup.log(2,'show summary ..');
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
    if (r.extras && false)  {
      $('#section-taxbill-available-false').hide();
      var html = lookup.view.summary2table(r.extras.taxbill);
      $('#tbody-summary-taxbill')[0].innerHTML = html.join('');
      var slug = lookup.utils.bbl2slug(r.nycgeo.bbl);
      $('#link-taxbills-nyc').attr('href','http://taxbills.nyc/'+slug);
      $('#section-taxbill-available-true').show();
    }
    else {
      $('#section-taxbill-available-true').hide();
      $('#tbody-summary-taxbill')[0].innerHTML = '<!-- empty table -->';
      $('#section-taxbill-available-false').show();
    }
    if (r.extras && r.extras.nychpd_count)  {
        $('#section-nychpd-available-false').hide();
        var text = r.extras.nychpd_count + " contact record" + 
            _plural(r.extras.nychpd_count);
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
    lookup.log(2,'show summary done');
    lookup.log(2,r);
    lookup.view.cleanup();
    if (r.extras && r.extras.pluto)  {
      var spec ={color:'magenta',fillColor:'#f3f',fillOpacity:0.3};
      lookup.view.showObject(r.extras.pluto,spec,true);
    }
    if (r.extras && r.extras.building)  {
      var spec ={color:'orange',fillColor:'#ff3',fillOpacity:0.5};
      lookup.view.showObject(r.extras.building,spec,true);
    }
    // else if (r.nycgeo)  {
    //  lookup.view.moveMap([r.nycgeo.geo_lat,r.nycgeo.geo_lon],true);
    //}
    $('#panel-summary').show();
    lookup.log(2,'show summary done');
};


var sift = function(points,parts) {
    var n = points.length / 2;
    var q = new Array(parts.length);
    for (var i=0; i<parts.length; i++)  {
        if (i+1 < parts.length)  {
            k = parts[i+1];
        }  else  {
            k = n; 
        }
        q[i] = new Array(k-i);
        for (var j=0; j<k-i; j++)  {
            var off = 2*(i+j);
            q[i][j] = [points[off+1],points[off]]
        }
    }
    return q;
};

lookup.view.cleanup = function() {
    if (lookup.view.polygons)  {
        lookup.log(2,'polygon cleanup ..');
        // lookup.log(2,'length = '+lookup.view.polygons.length);
        for (var p of lookup.view.polygons)  {
            // lookup.log(2,'nuke '+p);
            lookup.view.map.removeLayer(p);
        }
        delete lookup.view["polygons"];
        lookup.view.polygons = new Array(0);
        lookup.log(2,'polygon cleanup done');
    }
};

lookup.view.showObject = function(b,spec,move) {
    lookup.log(2,'show object ..');
    lookup.log(2,b);
    lookup.log(2,spec);
    lookup.log(2,move);
    if (move)  {
        var center = [b.lat_ctr,b.lon_ctr];
        lookup.log(2,'center ..');
        lookup.log(2,center);
        lookup.view.moveMap(center,false);
    }
    var poly = sift(b.points,b.parts);
    lookup.log(2,'polygons = '+poly.length);
    lookup.log(2,poly);
    lookup.view.polygons = new Array(poly.length);
    for (var i=0; i<poly.length; i++)  {
        var polygon = L.polygon(poly[i],spec);
        // lookup.log(2,"add poly ..");
        polygon.addTo(lookup.view.map);
        lookup.view.polygons[i] = polygon;
    }
    lookup.log(2,'show object done');
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




