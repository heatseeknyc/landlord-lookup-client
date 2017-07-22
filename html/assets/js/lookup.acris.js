(function() {
    var _acris = {};

    // Simple English captions for ACRIS doctypes.
    // We keep the order in this dict the same as the order in the control types 
    // metadata file we get from ACRIS, for easy lookups.
    var _doctype2eng = {
        "ASTU": 'Unit of Assignment',
        "CNTR": 'Contract of Sale',
        "DEED": 'Deed Transfer',
        "IDED": 'In Rem Deed',
        "LTPA": 'Letter Patent',
        "DEEDO": 'Deed (Other)',
        "MCON": 'Memorandum of Contract',
        "ACON": 'Assignment of Contract',
        "CORRD": 'Correction Deed',
        "CONDEED": 'Confirmatory Deed',
        "DEED COR": 'Correction Deed (Internal)',
        "DEED, LE": 'Life Estate Deed',
        "CORR, LE": 'Corrected Life Estate Deed',
        "DEED, TS": 'Timeshare Deed',
        "DEEDP": 'Deed (Pre Rpt Tax)',
        "TORREN": 'Torren Deed',
        "DEED, RC": 'Deed (with Restricted Covenant)',
        "TLS": 'Tax Lien Sale',
        "CTOR": 'Court Order'
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

