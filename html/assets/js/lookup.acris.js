(function() {
    var _acris = {};

    // Simple English captions for ACRIS doctypes.
    // We keep the order in this dict the same as the order in the control types 
    // metadata file we get from ACRIS, for easy lookups.
    var _doctype2eng = {
        "ASTU": 'Unit of Assignment',
        "CNTR": 'Contract of Sale',
        "DEED": 'Transfer of Deed'
    };
    
    // Provide a simple English caption for a doctype 
    _acris.doctype2eng = function(doctype) {
        var x = _doctype2eng;
        if (x[doctype])  { return x[doctype]; }
        // This should never happen, but if it is, we'll let a displayable
        // caption trickle up.  The worst thing that could happens is the uer
        // gets slightly confused.
        return "[unknown doctype]"
    };
    lookup.acris = _acris; 

})();

