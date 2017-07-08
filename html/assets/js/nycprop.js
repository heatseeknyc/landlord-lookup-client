// A few shortucts for dustjs.
(function () {
    nycprop = {};
    nycprop.version = '001b';

    var boroname = {1:'Manhattan', 2:'Bronx', 3:'Brooklyn', 4:'Queens', 5:'Staten Island'};

    nycprop.bbl_info = function(n) {
        lot = n % 10000;
        qblock = (n - lot) / 10000; 
        block = qblock % 100000;
        boro = (qblock - block) / 100000; 
        longname = boroname[boro];
        return { boro:boro, block:block, lot:lot, borough:longname, qblock:qblock};
    };
})();

