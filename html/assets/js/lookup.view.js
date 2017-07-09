(function() {

    lookup.view = {};
    lookup.view.polygons = {};

    // A simple check to tell whether Leaflet.js has been loaded or not.
    lookup.view.checkLeaflet = function() {
        return window.L !== undefined;
    };

    // Very soon we'll find a way to discover these templates, rather than 
    // having to specify them here.  But for now, we'll just repeat ourselves.
    lookup.view.initDust = function() {
        lookup.log(1,':: getting dusty...');
        dusty.load('section-acris-header');
        dusty.load('section-pluto-header');
        dusty.load('section-pluto-landuse');
        dusty.load('section-owner-nobody');
        dusty.load('section-owner-acris');
        dusty.load('section-owner-pluto');
        dusty.load('section-residential');
        dusty.load('section-compliance');
        lookup.log(1,':: all dusty now.');
    };

    lookup.view.render = function(divname,object) {
        dusty.render(divname,object);
        $('#'+divname).show();
        return true;
    };

    // A trivial wrapper which allow us to hide a div via 'un-sigiled' name.
    // Makes for a more consistent calling syntax. 
    lookup.view.hide = function(divname) {
        $('#'+divname).hide();
        return true;
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

    // deprecated
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


    // DEPRECATED
    lookup.view.showTaxbill = function() {
      var r = lookup.model.summary;
      if (r.taxlot && false)  {
        $('#section-taxbill-available-false').hide();
        var html = lookup.view.summary2table(r.taxlot.taxbill);
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

    // DEPRECATED
    lookup.view.__showHPD = function() {
        var r = lookup.model.summary;
        function _plural(n)  {
            if (n !== 1) { return 's'; }
            return '';
        }
        if (r.taxlot && r.taxlot.nychpd_count)  {
            $('#section-nychpd-available-false').hide();
            var text = r.taxlot.nychpd_count + " contact record" + 
                _plural(r.taxlot.nychpd_count);
            $('#var-nychpd-count').text(text);
            $('#section-nychpd-available-true').show();
        }
        else {
            $('#section-nychpd-available-true').hide();
            $('#section-nychpd-available-false').show();
        }
    };

    lookup.view.displayTaxlot = function() {
        lookup.log(2,'display taxlot..');
        var r = lookup.model.summary;
        if (!r.taxlot) {
            lookup.log(2,'display abort - no taxlot struct');
            return false;
        }
        pluto = r.taxlot.pluto;
        if (!pluto)  {
            lookup.log(2,'display abort - no pluto struct');
            return false;
        }
        // var building = x.building;
        // lookup.view.cleanup('building');
        lookup.view.cleanup('taxlot');
        var spec ={color:'magenta',fillColor:'#f3f',fillOpacity:0.3};
        lookup.view.showObject('taxlot',pluto,spec);
        lookup.view.moveTo(pluto);
        // if (false && building)  {
        //    var spec ={color:'orange',fillColor:'#ff3',fillOpacity:0.5};
        //    lookup.view.showObject('building',building,spec);
        // }
        return true;
    };
    
    lookup.view.showOwner = function(taxlot) {
        var acris = taxlot.acris;
        var pluto = taxlot.pluto;
        lookup.view.hide('section-owner-acris');
        lookup.view.hide('section-owner-pluto');
        if (acris && acris.party_count)  {
            lookup.view.render('section-owner-acris',taxlot);
        } else if (pluto && pluto.owner)  {
            lookup.view.render('section-owner-pluto',taxlot);
        } else {
            lookup.view.render('section-owner-nobody',taxlot);
        }
    };


    lookup.view.showResi = function(taxlot) {
        lookup.view.hide('section-residential');
        if (taxlot.meta.residential)  {
            lookup.view.render('section-residential',taxlot);
        }; 
    };

    lookup.view.showTaxlot = function(taxlot) {
        lookup.log(2,'show taxlot ..'); 
        if (!taxlot)  {
            return false;
        };
        lookup.view.hide('section-acris-header');
        lookup.view.hide('section-pluto-header');
        lookup.view.hide('section-pluto-landuse');
        taxlot.deco = nycprop.bbl_info(taxlot.meta.bbl);
        lookup.log(2,taxlot.deco); 
        taxlot.slug = lookup.utils.slugify(taxlot.meta.bbl);
        lookup.log(2,taxlot.slug); 
        if (taxlot.pluto)  {
            lookup.view.render('section-pluto-header',taxlot);
            lookup.view.render('section-pluto-landuse',taxlot);
        } else if (taxlot.acris)  {
            lookup.view.render('section-acris-header',taxlot);
        } else {
            lookup.view.showError('invalid frontend state')
            return false;
        }
        lookup.view.showOwner(taxlot);
        lookup.view.showResi(taxlot);
        lookup.view.render('section-compliance',taxlot);
        return true;
    };

    // DEPRECATED
    lookup.view.__showPluto = function(r) {
        lookup.log(2,'show pluto ..');
        /*
        $('#var-pluto-address').text(r.address)
        $('#var-pluto-borough').text('Manhattan')
        $('#var-pluto-bldg-count-label').text(r.bldg_count_label)
        $('#var-pluto-bldg-class').text(r.bldg_class)
        $('#var-pluto-bldg-class-label').text(r.bldg_class_label)
        $('#var-pluto-land-use').text(r.land_use)
        $('#var-pluto-land-use-label').text(r.land_use_label)
        if (r.building_count > 1)  {
            $('#switch-view-multi-bldg').show();
        }
        else  {
            $('#switch-view-multi-bldg').hide();
        }*/
        lookup.view.showHPD();
        lookup.view.render('section-pluto-header',r);
        // dusty.render('section-pluto-header',r);
        // $('#section-pluto-header').show();
    };

    // DEPRECATED
    lookup.view.__showExternalLinks = function() {
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

    lookup.view.showLookup = function() {
        lookup.log(2,'show lookup basics ..');
        var r = lookup.model.summary;
        $('#panel-data').hide();
        // $('#popup-almost').hide();
        $('#panel-error').hide();
        $('#panel-message').hide();
        lookup.log(2,'keytup ..');
        lookup.log(2,r.keytup);
        $('#var-keytup-bbl').text(''+r.keytup.bbl)
        // $('#var-meta-bin').text(r.keytup.bin)
        // lookup.view.showExternalLinks();
        lookup.view.showTaxlot(r.taxlot);
        $('#panel-summary').show();
        lookup.log(2,'show lookup done');
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
        lookup.log(3,'cleanup before');
        lookup.log(3,lookup.view.polygons);
        var list = lookup.view.polygons[tag];
        lookup.log(3,list);
        if (list)  {
            // lookup.log(2,'length = '+lookup.view.polygons.length);
            lookup.log(3,'nuke ..');
            for (var i=0; i<list.length; i++)  {
                var p = list[i];
                lookup.log(3,p);
                lookup.view.map.removeLayer(p);
            }
            delete lookup.view.polygons[tag];
        }
        lookup.log(3,'cleanup after');
        lookup.log(3,lookup.view.polygons);
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
            lookup.log(3,'add poly - aborting');
            return false;
        }
        var list = lookup.view.polygons[tag];
        if (list)  {
            lookup.log(3,'already ='+list.length);
        }  else  {
            lookup.view.polygons[tag] = new Array(0);
            list = lookup.view.polygons[tag];
            lookup.log(3,'initialized ='+list.length);
        }
        lookup.log(2,'add '+poly.length+' ..');
        for (var i=0; i<poly.length; i++)  {
            var p = L.polygon(poly[i],spec);
            lookup.log(3,p);
            p.addTo(map);
            lookup.log(3,'before='+list.length);
            lookup.log(3,list);
            list.push(p);
            lookup.log(3,'after='+list.length);
            lookup.log(3,list);
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
        var config = lookup.config.autocomplete;
        if (config && config.active)  {
            lookup.log(2,"autocomplete - active")
            $("#address-input").geocomplete(); 
        } else  {
            lookup.log(2,"autocomplete - inactive")
        }
    };

})();


