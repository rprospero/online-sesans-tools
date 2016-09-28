function total_scattering(value) {
    var delta = value.sample-value.solvent
    return value.wavelength * value.wavelength * value.thickness * delta * delta * value.concentration * (1-value.concentration) * value.xsi;
};

function update_label(f) {
    return function(d, i) {
        var style = "white";
        if(isNaN(this.value) || this.value==="") {style="red"}
        else {
            var new_value = +this.value;
            d3.select("#results")
                .datum(f(new_value));
            d3.select("#results")
                .select("#total_scattering")
                .text(total_scattering);
            d3.select("#results")
                .select("#polarisation")
                .text(function(x) {return Math.exp(-total_scattering(x));});}
        d3.select(this).style("background-color",style)};};

function make_label(selector, f) {
    d3.select(selector)
        .on("input change",
            update_label(f));};

var def = {wavelength: 1,
           thickness: 1e7,
           sample: 1e-6,
           solvent: 0,
           concentration: 0.1,
           xsi: 1000};

d3.select("#results")
    .data([def]);

make_label("#wavelength",
            function(new_value) {
                return function(d) { d.wavelength = new_value; return d;}});
make_label("#thickness",
            function(new_value) {
                return function(d) { d.thickness = new_value * 1e7; return d;}});
make_label("#sample",
            function(new_value) {
                return function(d) { d.sample = new_value * 1e-6; return d;}});
make_label("#solvent",
            function(new_value) {
                return function(d) { d.solvent = new_value * 1e-6; return d;}});
make_label("#concentration",
            function(new_value) {
                return function(d) { d.concentration = new_value * 1e-2; return d;}});
make_label("#xsi",
            function(new_value) {
                return function(d) { d.xsi = new_value * 10; return d;}});
