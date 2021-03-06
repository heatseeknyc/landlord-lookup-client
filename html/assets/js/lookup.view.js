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
        lookup.log(3,':: getting dusty...');
        dusty.load('section-header-pad-only');
        dusty.load('section-header-acris-only');
        dusty.load('section-header-acris-with-pad');
        dusty.load('section-header-acris-condounit');
        dusty.load('section-header-pluto');
        dusty.load('section-landuse');
        dusty.load('section-owner-acris');
        dusty.load('section-owner-pluto');
        dusty.load('section-owner-condo');
        dusty.load('section-owner-nobody');
        dusty.load('section-owner-hpdreg');
        dusty.load('section-rentstable');
        dusty.load('section-compliance');
        lookup.log(3,':: all dusty now.');
    };

    lookup.view.render = function(divname,object) {
        lookup.log(2,':: render '+divname+' ..');
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

        var center = lookup.config.leaflet.center.slice(0); 
        var zoom   = lookup.config.leaflet.zoom;
        var map = L.map(mapname,{
            center: center, 
            zoomControl: false,
            zoom: zoom 
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

    // Pans to the current shape, magically adjusting zoom level
    lookup.view.panTo = function(shape) {
        lookup.log(1,'panTo ..');
        lookup.log(1,shape);
        var map = lookup.view.map;
        if (!map)  { return false; }
        if (lookup.view.marker)  { map.removeLayer(lookup.view.marker); }
        var alpha = 1.5;
        var radius = shape.radius;
        var center = [shape.lat_ctr,shape.lon_ctr];
        var level = lookup.utils.zoomlevel(shape.radius,alpha);
        lookup.log(2,'panTo center');
        lookup.log(2,center);
        lookup.log(2,{'alpha':alpha,'radius':radius,'level':level});
        map.setView(center,level);
        // map.panTo(center,level);
        return true;
    };

    // Tells us whether the taxlot struct has a shape struct somewhere to display.
    var isViewable = function (taxlot)  {
        return (taxlot.pluto) || (taxlot.condo && taxlot.condo.baselot);
    };

    // Displays the embedded member shape struct, if it can find one.
    // Looks first for a 'pluto' struct, then for a 'condo.baselot' struct.  
    lookup.view.displayTaxlot = function() {
        lookup.log(2,'display taxlot ..');
        lookup.view.cleanup('building');
        lookup.view.cleanup('taxlot');
        var r = lookup.model.summary;
        var taxlot = r.taxlot;
        var pluto = taxlot.pluto;
        var baselot = null;
        if (taxlot.condo) { baselot = taxlot.condo.baselot; }
        var spec ={color:'magenta',fillColor:'#f3f',fillOpacity:0.3};
        if (pluto)  {
            lookup.view.showObject('taxlot',pluto,spec);
            lookup.view.panTo(pluto);
        } else if (baselot)  {
            lookup.view.showObject('taxlot',baselot,spec);
            lookup.view.panTo(baselot);
        }  else  {
            lookup.log(2,'display abort - no lot struct');
            return false;
        }
        lookup.log(2,'display taxlot done');
        return true;
    };
    
    lookup.view.showOwner = function(taxlot) {
        var meta = taxlot.meta;
        var acris = taxlot.acris;
        var pluto = taxlot.pluto;
        var condo = taxlot.condo;
        lookup.log(2,'show owner ..');
        lookup.view.hide('section-owner-acris');
        lookup.view.hide('section-owner-pluto');
        lookup.view.hide('section-owner-condo');
        if (meta.is_bank)  {
            lookup.view.render('section-owner-condo',taxlot);
        } else if (acris)  {
            // This will default to showing Pluto, if we're in ACRIS but
            // we still can't identify ownership. 
            lookup.view.render('section-owner-acris',taxlot);
        } else if (pluto && pluto.owner)  {
            lookup.view.render('section-owner-pluto',taxlot);
        } else {
            lookup.view.render('section-owner-nobody',taxlot);
        }
        lookup.log(2,'show owner done');
    };

    // Show "residential info", if residential.  
    // At present this just means rent stabilization info (whatever the status may be). 
    lookup.view.showResi = function(taxlot) {
        lookup.view.hide('section-rentstable');
        if (taxlot.meta.is_resi)  {
            lookup.view.render('section-rentstable',taxlot);
        };
    };

    lookup.view.initTaxlotLinks = function()  {
        lookup.log(2,'taxlot links ');
        $('#link-multi-bldg').click(function(){
            lookup.log(2,"click!");
            lookup.log(2,"this.id = "+this.id);
            lookup.control.doBuildings(true);
        });
    };

    lookup.utils.augment_taxlot = function(taxlot) {
        taxlot.deco = nycprop.bbl_info(taxlot.meta.bbl);
        lookup.log(2,taxlot.deco); 
        taxlot.slug = lookup.utils.slugify(taxlot.meta.bbl);
        lookup.log(2,taxlot.slug); 
        lookup.utils.adjust_control_flags(taxlot);
        lookup.explain.augment(taxlot);
    };

    // Augments the pluto dict with control flags to assist the templating 
    // system (dustjs), which checks for existence (not true-ness).  Rather than
    // create a new top-level struct, we prefer to mangle the pluto struct slightly,
    // using a convention whereby a leading underscore means "derived boolean flag".
    lookup.utils.adjust_control_flags = function(taxlot) {
        var pluto = taxlot.pluto;
        if (pluto)  {
            if (pluto.year_built > 0)  { pluto._built = 1; }
            if (pluto.bldg_count > 1)  { pluto._bldg_multi = 1; }
        };
        var stable = taxlot.stable;
        if (stable)  {
            if (stable.code === 1 || stable.code === 2)  {
                stable._confirmed = 1;
            };
        };
        var acris = taxlot.acris;
        if (acris)  {
            if (acris.code === 0)   { acris._mortonly = 1; }
            if (acris.code === 1)   { acris._vanilla = 1; };
            if (acris.code === 2)   { acris._partial = 1; };
            if (acris.code === 3)   { acris._complex = 1; };
            if (acris.party2_count > 1) { acris._multiparty = 1; };
            // A special flag to default to the Pluto owner (if present)
            if (acris._mortonly || acris._partial || acris._complex)  {
                if (pluto && pluto.owner)  { acris._showpluto = 1; }
            };
        };
    };

    // Refers to the taxlot info summary, not the lot shape. 
    lookup.view.showTaxlot = function(taxlot) {
        lookup.log(2,'show taxlot ..'); 
        if (!taxlot)  {
            return false;
        };
        lookup.log(2,taxlot); 
        lookup.view.hide('section-header-pad-ony');
        lookup.view.hide('section-header-acris-only');
        lookup.view.hide('section-header-acris-with-pad');
        lookup.view.hide('section-header-acris-condounit');
        lookup.view.hide('section-header-pluto');
        lookup.view.hide('section-landuse');
        lookup.utils.augment_taxlot(taxlot);
        // The following looks a bit obtuse.
        // But these are the various corner cases we need to deal with
        // (appearing roughly in order of likeliehood).
        var meta  = taxlot.meta;
        var condo = taxlot.condo;
        var acris = taxlot.acris;
        if (taxlot.pluto)  {
            lookup.view.render('section-header-pluto',taxlot);
            lookup.view.render('section-landuse',taxlot);
        } else if (acris)  {
            if (condo && condo.parent)  {
                lookup.view.render('section-header-acris-condounit',taxlot);
            } else if (meta.in_pad)  {
                lookup.view.render('section-header-acris-with-pad',taxlot);
            }  else  {
                lookup.view.render('section-header-acris-only',taxlot);
            }
        } else if (meta.in_pad)  {
            lookup.view.render('section-header-pad-only',taxlot);
        } else {
            lookup.view.showError('invalid frontend state')
            return false;
        }
        lookup.view.showOwner(taxlot);
        lookup.view.showResi(taxlot);
        lookup.view.render('section-compliance',taxlot);
        lookup.view.initTaxlotLinks();
        return true;
    };

    lookup.view.showLookup = function() {
        lookup.log(2,'show lookup basics ..');
        var r = lookup.model.summary;
        $('#panel-data').hide();
        $('#panel-error').hide();
        $('#panel-message').hide();
        lookup.log(2,'keytup ..');
        lookup.log(2,r.keytup);
        lookup.view.showTaxlot(r.taxlot);
        $('#panel-summary').show();
        lookup.view.pushState(r.keytup);
        lookup.log(2,'show lookup done');
    };

    lookup.view.pushState = function(keytup) {
        if (window.history.pushState) {
            var newpath = '/taxlot/'+keytup.bbl;
            window.history.pushState(null, null, newpath);
        }
    };

    // Takes the 'points' and 'parts' lists as they appear in shapefiile structs,
    // and genrates the implied partition into distinct lists of coordinate pairs.
    var sift = function(points,parts) {
        var n = points.length / 2;
        var q = new Array(parts.length);
        prevk = 0;
        for (var i=0; i<parts.length; i++)  {
            if (i+1 < parts.length)  {
                k = parts[i+1];
            }  else  {
                k = n; 
            }
            var width = k-prevk;
            q[i] = new Array(width);
            for (var j=0; j<width; j++)  {
                var off = 2*(prevk+j);
                q[i][j] = [points[off+1],points[off]]
            }
            prevk = k;
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
        lookup.log(3,center);
        lookup.view.moveMap(center,false);
    };

    lookup.view.showObject = function(tag,shape,spec) {
        lookup.log(3,'show object tag='+tag+' ..');
        lookup.log(4,shape);
        lookup.log(4,spec);
        var poly = sift(shape.points,shape.parts);
        // lookup.log(2,'show object - sifted');
        // lookup.log(2,poly);
        lookup.view.addPoly(tag,poly,spec);
        lookup.log(3,'show object done');
        return true;
    };

    lookup.view.addPoly = function(tag,poly,spec) {
        lookup.log(3,'add poly tag='+tag+' ..');
        lookup.log(4,poly);
        var map = lookup.view.map;
        if (!map)  {
            lookup.log(4,'add poly - aborting');
            return false;
        }
        var list = lookup.view.polygons[tag];
        if (list)  {
            lookup.log(4,'already ='+list.length);
        }  else  {
            lookup.view.polygons[tag] = new Array(0);
            list = lookup.view.polygons[tag];
            lookup.log(4,'initialized ='+list.length);
        }
        lookup.log(3,'add '+poly.length+' ..');
        for (var i=0; i<poly.length; i++)  {
            var p = L.polygon(poly[i],spec);
            lookup.log(4,p);
            p.addTo(map);
            lookup.log(4,'before='+list.length);
            lookup.log(4,list);
            list.push(p);
            lookup.log(4,'after='+list.length);
            lookup.log(4,list);
        }
        lookup.log(3,'add poly done ['+tag+']');
        return true;
    };

    lookup.view.showContacts = function() {
        var r = lookup.model.contacts;
        $(".panel-lower").hide();
        lookup.log(3,'show contacts!');
        lookup.log(4,r);
        var keys = [
            'registration_id','contact_id','contact_name','contact_type',
            'description','corpname','business_address' 
        ];
        var html = lookup.render.rowset2html(r,keys);
        $("#tbody-contacts")[0].innerHTML = html.join('');
        $("#panel-data").show();
        // $("#popup-almost").show();
        lookup.log(3,':: done show contacts.')
    };

    lookup.view.showBuildings = function() {
        var blist = lookup.model.buildings;
        lookup.log(3,':: show buildings!');
        lookup.log(4,blist);
        lookup.view.cleanup('building');
        for (var i=0; i<blist.length; i++)  {
            var spec ={color:'orange',fillColor:'#ff3',fillOpacity:0.5};
            lookup.view.showObject('building',blist[i],spec);
        }
        lookup.log(3,':: done show buildings.')
    };


    lookup.view.showError = function(msg) {
        lookup.log(1,':: error['+msg+']')
        $('#panel-message').hide();
        $('#panel-summary').hide();
        $('#error-search').text(msg);
        $('#panel-error').show();
    };

    // Default error message when some invalid UI state occurs.
    lookup.view.showDefaultError = function() {
        lookup.view.showError("Something went wrong! Reload the page and try your search again.");
    };

    lookup.view.showTest = function() {
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


