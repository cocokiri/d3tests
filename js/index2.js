let shmu;

d3.json("./climate.json", function (thedata) {
    console.log("TPOAL", thedata)
    shmu = thedata
});

var tree = d3.tree()
    .size([500, 800]);

