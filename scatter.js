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

            update_values();
        }
        d3.select(this).style("background-color",style)};};

function make_label(selector, f) {
    d3.select(selector)
        .on("input change",
            update_label(f));};

var def = {wavelength: +document.getElementById("wavelength").value,
           thickness: 1e7*(+document.getElementById("thickness").value),
           sample: 1e-6*(+document.getElementById("sample").value),
           solvent: 1e-6*(+document.getElementById("solvent").value),
           concentration: 1e-2*(+document.getElementById("concentration").value),
           xsi: 10*(+document.getElementById("xsi").value)};

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

//Line Chart

var margin = {top: 20, right: 20, bottom: 30, left: 50}
var width = 640 - margin.left - margin.right;
var height = 480 - margin.top - margin.bottom;

var x = d3.scaleLinear().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

var xAxis = d3.axisBottom()
    .scale(x);

var yAxis = d3.axisLeft()
    .scale(y);

var line = d3.line()
    .x(function(d) {return x(d[0]);})
    .y(function(d) {return x(d[1]);});

var svg = d3.select("#plot")
    .append("g")
    .attr("transform",
          "translate("+margin.left+","+margin.top+")")

x.domain([0, 10])
y.domain([0, 1])

svg.append("g")
    .attr("transform","translate(0," + height + ")")
    .call(d3.axisBottom(x));

svg.append("text")
    .attr("class","x label")
    .attr("text-anchor", "middle")
    .attr("x",width/2)
    .attr("y", height-6)
    .text("Spin echo length (nm)")

svg.append("text")
    .attr("class","y label")
    .attr("text-anchor", "middle")
    .attr("x",-height/2)
    .attr("y", 15)
    .attr("transform","rotate(-90)")
    .text("Polarisation")

svg.append("g")
    .call(d3.axisLeft(y))

var valueline = d3.line()
    .x(function(d){return x(d[0]);})
    .y(function(d){return y(d[1]);});

var graphx = []
for(i=0;i<10;i += 0.1) {
    graphx.push(i)
}

svg.append("path")
    .data([graphx.map(function(i){return [i,1]})])
    .attr("class", "line")
    .attr("d", valueline);

/// Uopdate Functions

function update_values(){
    d3.select("#results")
        .select("#total_scattering")
        .text(total_scattering);
    d3.select("#results")
        .select("#polarisation")
        .text(function(x) {return Math.exp(-total_scattering(x));});



    var value = d3.select("#results").data()[0]
    var wave = value.wavelength

    d3.select(".line")
        .data([graphx.map(function(d){
            value.wavelength = d;
            return [d, Math.exp(-total_scattering(value))];
        })])

    value.wavelength = wave

    d3.select(".line")
        .transition()
        .duration(1500)
        .attr("d",valueline);
}

update_values()
