/* globals document,d3 */

//Find G(z) for a dilute sphere
function sphere_form_factor(z,R) {
    var norms = Math.pow(z/2/R,2);
    if(norms >= 1) {return 0;}
    if(norms <= 0) {return 1;}
    var result = Math.sqrt(1-norms)*(1+0.5*norms)+2*norms*(1-Math.pow(z/4/R,2))*Math.log(z/R/(2+Math.sqrt(4-Math.pow(z/R,2))));
    return result;
}

//Calculate the total scattering for a solution of spheres
function total_scattering(value) {
    var delta = value.sample-value.solvent;
    return value.wavelength * value.wavelength * value.thickness * delta * delta * value.concentration * (1-value.concentration) * (1.5 - 1.6*value.concentration) * value.radius;
}

//Update the model and the input based on the current value
function update_label(f) {
    return function(d, i) {
        var style = "white";
        if(isNaN(this.value) || this.value==="") {style="red";}
        else {
            var new_value = +this.value;
            d3.select("#results")
                .datum(f(new_value));

            update_values();
        }
        d3.select(this).style("background-color",style);
    };
}

//Make the label given by the selector perform the action given in the function
function make_label(selector, f) {
    d3.select(selector)
        .on("input change",
            update_label(f));
}

//The default value for the model
var def = {wavelength: +document.getElementById("wavelength").value,
           thickness: 1e7*(+document.getElementById("thickness").value),
           sample: 1e-6*(+document.getElementById("sample").value),
           solvent: 1e-6*(+document.getElementById("solvent").value),
           concentration: 1e-2*(+document.getElementById("concentration").value),
           radius: 10*(+document.getElementById("radius").value),
           tune: +document.getElementById("tune").value};

d3.select("#results")
    .data([def]);

make_label("#wavelength",
            function(new_value) {
                return function(d) { d.wavelength = new_value; return d;};});
make_label("#thickness",
            function(new_value) {
                return function(d) { d.thickness = new_value * 1e7; return d;};});
make_label("#sample",
            function(new_value) {
                return function(d) { d.sample = new_value * 1e-6; return d;};});
make_label("#solvent",
            function(new_value) {
                return function(d) { d.solvent = new_value * 1e-6; return d;};});
make_label("#concentration",
            function(new_value) {
                return function(d) { d.concentration = new_value * 1e-2; return d;};});
make_label("#radius",
            function(new_value) {
                return function(d) { d.radius = new_value * 10; return d;};});
make_label("#tune",
            function(new_value) {
                return function(d) { d.tune = new_value; return d;};});
//Line Chart

var rect = document.getElementById("wplot").getBoundingClientRect();
var margin = {top: 20, right: 20, bottom: 30, left: 50};
var width = rect.width - margin.left - margin.right;
var height = rect.height - margin.top - margin.bottom;

var wx = d3.scaleLinear().range([0, width]);
wx.domain([0,10]);
var sx = d3.scaleLinear().range([0, width]);
sx.domain([0,1000]);

var y = d3.scaleLinear().range([height, 0]);
y.domain([0,1]);

function resize(e) {
    console.log("Resize");
    console.log(e);
    rect = document.getElementById("wplot").getBoundingClientRect();
    console.log(rect);
    width = rect.width - margin.left - margin.right;
    height = rect.height - margin.top - margin.bottom;

    wx.range([0, width]);
    sx.range([0, width]);
    y.range([height, 0]);
    update_values();
}
window.addEventListener("resize", resize);

d3.axisBottom().scale(wx);
d3.axisLeft().scale(y);

var graphx = [];
for(var i=0;i<10;i += 0.1) {
    graphx.push(i);
}

//Given the location of an SVG element, assign it the given scale for
// the x axis, label that axis, and assign a name to the line drawn on
// the plot
function makePlot(selector,xaxis,xlabel,lineClass) {
    var svg = d3.select(selector)
        .append("g")
        .attr("transform",
              "translate("+margin.left+","+margin.top+")");
    svg.append("g")
        .attr("transform","translate(0,"+height+")")
        .attr("id","xaxis-"+lineClass)
        .call(d3.axisBottom(xaxis));
    svg.append("text")
        .attr("class","xlabel")
        .attr("text-anchor", "middle")
        .attr("x", width/2)
        .attr("y",height-6)
        .text(xlabel);
    svg.append("text")
        .attr("class","ylabel")
        .attr("text-anchor", "middle")
        .attr("x",-height/2)
        .attr("y", 15)
        .attr("transform","rotate(-90)")
        .text("Polarisation");
    svg.append("g")
	.attr("class", "yaxis")
        .call(d3.axisLeft(y));
    svg.append("path")
        .data([graphx.map(function(i){return [i,1];})])
        .attr("class", "line " + lineClass)
        .attr("d", valueline(xaxis));
    return svg;
}

makePlot("#wplot",wx,"Wavelength (Å)","wline");
makePlot("#splot",sx,"Spin Echo Length (nm)","sline");

//Create a line with a given x-axis
function valueline(xaxis) {
    return d3.line()
            .x(function(d){return xaxis(d[0]);})
            .y(function(d){return y(d[1]);});
}

// Update all the results to the latest values in the data model
function update_values(){
    d3.select("#results")
        .select("#total_scattering")
        .text(total_scattering);
    d3.select("#results")
        .select("#polarisation")
        .text(function(x) {return Math.exp(-total_scattering(x));});

    var value = d3.select("#results").data()[0];
    var wave = value.wavelength;

    d3.select("#results")
        .select("#spin_echo")
        .text(function(x) {return x.wavelength*x.wavelength*x.tune;});

    d3.select(".wline")
        .data([graphx.map(function(d){
            value.wavelength = d;
            var z = d*d*value.tune;
            var G = sphere_form_factor(10*z, value.radius);
            return [d, Math.exp((G-1)*total_scattering(value))];
        })]);

    d3.select(".sline")
        .data([graphx.map(function(d){
            value.wavelength = d;
            var z = d*d*value.tune;
            var G = sphere_form_factor(10*z, value.radius);
            return [z, Math.exp((G-1)*total_scattering(value))];
        })]);

    value.wavelength = wave;

    d3.select(".wline")
        .transition()
        .duration(1500)
        .ease(d3.easeCubic)
        .attr("d",valueline(wx));

    sx.domain([0,100*value.tune]);
    d3.select(".sline")
        .transition()
        .duration(1500)
        .ease(d3.easeCubic)
        .attr("d",valueline(sx));
    d3.select("#xaxis-sline")
        .transition()
        .duration(1500)
        .ease(d3.easeCubic)
        .attr("transform","translate(0,"+height+")")
        .call(d3.axisBottom(sx));
    d3.select("#xaxis-wline")
        .transition()
        .duration(1500)
        .ease(d3.easeCubic)
        .attr("transform","translate(0,"+height+")")
        .call(d3.axisBottom(wx));
    d3.selectAll(".yaxis")
        .transition()
        .duration(1500)
        .ease(d3.easeCubic)
        .call(d3.axisLeft(y));
    d3.selectAll(".xlabel")
        .transition()
        .duration(1500)
        .attr("x", width/2)
        .attr("y",height-6);
    d3.selectAll(".ylabel")
        .transition()
        .duration(1500)
        .attr("x",-height/2)
        .attr("y", 15)
}

update_values();
