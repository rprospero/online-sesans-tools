function total_scattering(value) {
    var delta = value.sample-value.solvent
    return value.wavelength * value.wavelength * value.thickness * delta * delta * value.xsi;
};

function update_label(f) {
    return function(d, i) {
        var style = "white";
        if(isNaN(this.value)) {style="red"}
        else {
            var new_value = +this.value;
            d3.select("body")
                .selectAll("div")
                .datum(f(new_value))
                .text(total_scattering);}
        d3.select(this).style("background-color",style)};};

function make_label(selector, f) {
    d3.select(selector)
        .on("input change",
            update_label(f));};

var def = {wavelength: 3,
           thickness: 1e7,
           sample: 3e-6,
           solvent: 0,
           xsi: 1000};

d3.select("body")
    .selectAll("div")
    .data([def])
    .enter()
    .append("div")
    .text(total_scattering);

make_label("#wavelength",
            function(new_value) {
                return function(d) { d.wavelength = new_value; return d;}});
make_label("#thickness",
            function(new_value) {
                return function(d) { d.thickness = new_value; return d;}});
make_label("#sample",
            function(new_value) {
                return function(d) { d.sample = new_value; return d;}});
make_label("#solvent",
            function(new_value) {
                return function(d) { d.solvent = new_value; return d;}});
make_label("#xsi",
            function(new_value) {
                return function(d) { d.xsi = new_value; return d;}});
