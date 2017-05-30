lookup.view = {};
lookup.view.polygons = {};

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


// deprecated
lookup.view.showTaxbill = function() {
    var r = lookup.model.summary;
    if (r.extras && false)  {
      $('#section-taxbill-available-false').hide();
      var html = lookup.view.summary2table(r.extras.taxbill);
      $('#tbody-summary-taxbill')[0].innerHTML = html.join('');
      var bbl = r.nygeo.bbl;
      $('#link-taxbills-nyc').attr('href','http://taxbills.nyc/'+slug);
      $('#section-taxbill-available-true').show();
    }
    else {
      $('#section-taxbill-available-true').hide();
      $('#tbody-summary-taxbill')[0].innerHTML = '<!-- empty table -->';
      $('#section-taxbill-available-false').show();
    }
};

lookup.view.showHPD = function() {
    var r = lookup.model.summary;
    function _plural(n)  {
        if (n !== 1) { return 's'; }
        return '';
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
};

lookup.view.displayShapes = function() {
    lookup.log(2,'display shapes ..');
    var r = lookup.model.summary;
    var x = r.extras;
    if (!x) {
        lookup.log(2,'dislpaly shapes abort');
        return false;
    }
    var taxlot = x.taxlot;
    var building = x.building;
    lookup.view.cleanup('taxlot');
    lookup.view.cleanup('building');
    if (taxlot)  {
        var spec ={color:'magenta',fillColor:'#f3f',fillOpacity:0.3};
        lookup.view.showObject('taxlot',taxlot,spec);
        lookup.view.moveTo(taxlot);
    }
    if (building)  {
        var spec ={color:'orange',fillColor:'#ff3',fillOpacity:0.5};
        lookup.view.showObject('building',building,spec);
    }
    return true;
};

lookup.view.showPluto = function() {
    var r = lookup.model.summary;
    var p = r.extras.pluto;
    $('#var-pluto-bldg-count-label').text(p.bldg_count_label)
    $('#var-pluto-bldg-class').text(p.bldg_class)
    $('#var-pluto-bldg-class-label').text(p.bldg_class_label)
    $('#var-pluto-land-use').text(p.land_use)
    $('#var-pluto-land-use-label').text(p.land_use_label)
    if (p.bldg_count > 1)  {
        $('#switch-view-multi-bldg').show();
    }
    else  {
        $('#switch-view-multi-bldg').hide();
    }
};

lookup.view.showExternalLinks = function() {
    var r = lookup.model.summary;
    var bbl = r.keytup.bbl;
    if (!bbl)  {
        console.log(2,'show external - no bbl');
        return false;
    }
    var slug = lookup.utils.bbl2slug(bbl);
    var acris = lookup.utils.bbl2acris(bbl);
    var bisweb = lookup.utils.bbl2bisweb(bbl);
    $('#link-taxbills-nyc').attr('href','http://taxbills.nyc/'+slug);
    $('#link-oasis').attr('href','http://www.oasisnyc.net/map.aspx?zoomto=lot:'+bbl);
    $('#link-bisweb').attr('href','http://a810-bisweb.nyc.gov/bisweb/PropertyProfileOverviewServlet?'+bisweb);
    $('#link-acris').attr('href','http://a836-acris.nyc.gov/bblsearch/bblsearch.asp?'+acris);
    return true;
};

lookup.view.showSummary = function() {
    lookup.log(2,'show summary basics ..');
    var r = lookup.model.summary;
    $('#panel-data').hide();
    // $('#popup-almost').hide();
    $('#panel-error').hide();
    $('#panel-message').hide();
    $('#var-summary-bbl').text(r.keytup.bbl)
    $('#var-summary-bin').text(r.keytup.bin)
    lookup.view.showExternalLinks();
    lookup.view.showPluto();
    lookup.view.showHPD();
    lookup.view.displayShapes();
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

lookup.view.cleanup = function(tag) {
    lookup.log(2,'cleanup '+tag+'..');
    lookup.log(2,'cleanup before');
    lookup.log(2,lookup.view.polygons);
    var list = lookup.view.polygons[tag];
    lookup.log(2,list);
    if (list)  {
        // lookup.log(2,'length = '+lookup.view.polygons.length);
        lookup.log(2,'nuke ..');
        for (var i=0; i<list.length; i++)  {
            var p = list[i];
            lookup.log(2,p);
            lookup.view.map.removeLayer(p);
        }
        delete lookup.view.polygons[tag];
    }
    lookup.log(2,'cleanup after');
    lookup.log(2,lookup.view.polygons);
    lookup.log(2,'cleanup done');
};

lookup.view.moveTo = function(shape) {
    var center = [shape.lat_ctr,shape.lon_ctr];
    lookup.log(2,'center ..');
    lookup.log(2,center);
    lookup.view.moveMap(center,false);
};

lookup.view.showObject = function(tag,shape,spec) {
    lookup.log(2,'show object tag='+tag+' ..');
    lookup.log(2,shape);
    lookup.log(2,spec);
    var poly = sift(shape.points,shape.parts);
    lookup.view.addPoly(tag,poly,spec);
    lookup.log(2,'show object done');
    return true;
};

lookup.view.addPoly = function(tag,poly,spec) {
    lookup.log(2,'add poly tag='+tag+' ..');
    lookup.log(2,poly);
    var map = lookup.view.map;
    if (!map)  {
        lookup.log(2,'add poly - aborting');
        return false;
    }
    var list = lookup.view.polygons[tag];
    if (list)  {
        lookup.log(2,'already ='+list.length);
    }  else  {
        lookup.view.polygons[tag] = new Array(0);
        list = lookup.view.polygons[tag];
        lookup.log(2,'initialized ='+list.length);
    }
    lookup.log(2,'add ..');
    for (var i=0; i<poly.length; i++)  {
        var p = L.polygon(poly[i],spec);
        lookup.log(2,p);
        p.addTo(map);
        lookup.log(2,'before='+list.length);
        lookup.log(2,list);
        list.push(p);
        lookup.log(2,'after='+list.length);
        lookup.log(2,list);
    }
    lookup.log(2,'add poly done ['+tag+']');
    return true;
};

lookup.view.showContacts = function() {
    var r = lookup.model.contacts;
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
    // $("#popup-almost").show();
    lookup.log(1,':: done show contacts.')
};

lookup.view.showBuildings = function() {
    var blist = lookup.model.buildings;
    lookup.log(1,'show buildings!');
    lookup.log(2,blist);
    lookup.view.cleanup('building');
    for (var i=0; i<blist.length; i++)  {
        var spec ={color:'orange',fillColor:'#ff3',fillOpacity:0.5};
        lookup.view.showObject('building',blist[i],spec);
    }
    lookup.log(1,':: done show buildings.')
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

lookup.view._initLinks = function()  {
    $('#switch-view-multi-bldg').click(function(){
        lookup.log(2,"click!");
        lookup.log(2,"this.id = "+this.id);
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




