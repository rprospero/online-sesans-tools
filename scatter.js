d3.select("body").append("p").text("New Paragraph!");

function total_scattering(value) {
    return value.wavelength * value.wavelength;
};

d3.select("body")
    .selectAll("div")
    .data([{wavelength: 3}])
    .enter()
    .append("div")
    .text(total_scattering);

d3.select("body")
    .append("input")
    .on("input change", function(d, i) {
        var style = "white";
        if(isNaN(this.value)) {style="red"}
        else{
            var new_value = +this.value;
            d3.select("body")
                .selectAll("div")
                .datum(function(d) { d.wavelength = new_value; return d;})
                .text(total_scattering);}
        d3.select(this).style("background-color", style)});
