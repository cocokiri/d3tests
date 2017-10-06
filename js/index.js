var shmu;

function ColorCode(type) {
    switch (type) {
        case "CAUSE":
            return "red";
            break
        case "ENABLE":
            return "blue";
            break
        case "INCREASE":
            return "green";
            break
        case "REDUCE":
            return "yellow";
            break
        default:
            return "black"
    }
}

function typeToNumber(type) {
    switch (type) {
        case "CAUSE":
            return "9";
            break
        case "ENABLE":
            return "3";
            break
        case "INCREASE":
            return "5";
            break
        case "REDUCE":
            return "7";
            break
        default:
            return "2"
    }

}

const legend = {

    "CAUSE": {
        // path: `M 5 5
        // L 10 20
        // L 15 5`,
        path: [{
            x: 5,
            y: 5
        }, {
            x: 10,
            y: 15
        }, {
            x: 15, y: 5
        }
        ],
        color: "orange",
        idNum: 3
    },
    "INCREASE": {
        path: [{
            x: 5,
            y: 5
        }, {
            x: 15,
            y: 5
        }, {
            x: 10, y: 5
        }, {

            x: 10, y: 10
        }, {
            x: 10, y: 0
        }
        ],
        color: "green",
        idNum: 2
    },
    "REDUCE": {
        path: [{
            x: 5, y: 5
        },
            {x: 5, y: 15}
        ],
        color: "darkred",
        idNum: 1
    },
    "ENABLE": {
        path: [{
            x: 5, y: 15
        }, {
            x: 5, y: 5
        }, {
            x: 15, y: 5
        }, {
            x: 15, y: 15
        }],
        color: "yellow",
        idNum: 0
    }
};


d3.json("./climate.json", function (thedata) {
    console.log("TPOAL", thedata)
    shmu = thedata
});

const D2R = Math.PI / 180;
//function Factory
const cleanData = d3.stratify()
    .id(function (d) {
        return d.name;
    })
    .parentId(function (d) {
        return d.parent;
    });


const lineFn = d3.line()
    .x(function (d) {
        return d.x;
    })
    .y(function (d) {
        return d.y;
    })
    .curve(d3.curveLinear);


setTimeout(function () {

    data = cleanData(shmu.body);
    console.log(data, 'clean')
    console.log(shmu.body, 'body')

    // Set the dimensions and margins of the diagram
    var margin = {top: 40, right: 90, bottom: 50, left: 90},
        w = 800 - margin.left - margin.right,
        h = 1000 - margin.top - margin.bottom;

// append the svg object to the body of the page
    var svg = d3.select('body').append('svg')
        .attr('width', w + margin.left + margin.right) //shifted for rotate
        .attr('height', h + margin.top + margin.bottom) //rotate
        .attr('transform', "translate(100, 50)")
    // .attr('transform', 'rotate(-45)');


// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
    var g = svg.append('g')
    // .attr('width', w + margin.left + margin.right) //shifted for rotate
    // .attr('height', h + margin.top + margin.bottom) //rotate
        .attr('transform', 'translate(' + 100 + ',' + (margin.top + 110) + ')') //left = top because of 90deg rotation
    // .attr('transform', 'rotate(44)')

// declares a tree layout and assigns the size
    var tree = d3.tree()
        .size([w, h]); //rotate

    const xToRad = 1 / w * 360 * D2R;

// Assigns parent
    var nodes = d3.hierarchy(data);

// Assigns the x and y position for the nodes
    nodes = tree(nodes);
    console.log(nodes)


    //just to make transformations without mutating the tree
    function objPlusParentClone(obj) {
        const {x, y} = obj;
        const parentX = obj.parent.x;
        const parentY = obj.parent.y;
        return {
            parent: {
                x: parentX,
                y: parentY
            },
            x: x,
            y: y
        }
    }

    function transformToRadial(presets) {
        const {obj, xOff, yOff} = presets;

        const lineObj = {
            x: xOff + obj.y / 2 * Math.cos(obj.x * xToRad),
            y: yOff + obj.y / 2 * Math.sin(obj.x * xToRad),
            parent: {
                x: xOff + obj.parent.y / 2 * Math.cos(obj.parent.x * xToRad),
                y: yOff + obj.parent.y / 2 * Math.sin(obj.parent.x * xToRad),
            }
        }
        return lineObj;

    }

// adds the links between the nodes
//     var link = g.selectAll(".link")  //nothing
//         .data(nodes.descendants().slice(1)) //nodes without Eve
//         .enter()
//         .append("path")
//         // .style('stroke', "link_grad")
//         .attr("d", (d) => {
//             d = objPlusParentClone(d);
//             d = transformToRadial({obj: d, xOff: w / 2, yOff: h / 2})
//             return "M" + d.x + "," + d.y
//                 + "C" + d.x + "," + (d.y + d.parent.y) / 2
//                 + " " + d.parent.x + "," + (d.y + d.parent.y) / 2
//                 + " " + d.parent.x + "," + d.parent.y;
//         })
//         .attr('fill', 'none')
//         .attr('stroke', d => {
//             const type = legend[d.data.data.segment[0].connective_type];
//             return type ? type.color : "grey"
//         })
//         .attr('stroke-opacity', d => 1 - d.data.depth / 6)
//         .attr('stroke-width', d => 4 - d.data.depth / 2)

// adds each node as a group
    var node = g.selectAll('.node')
        .data(nodes.descendants())
        .enter() //enter = where there is data but no dom element
        .append('g')
        .attr('class', (d) => {
            return "node" +
                (d.children ? " node--internal" : " node--leaf");
        })
        .attr("transform", (d) => `translate(${w / 2 + d.y / 2 * Math.cos(d.x * xToRad)}, ${h / 2 + d.y / 2 * Math.sin(d.x * xToRad)})`)
        // .style("visibility", 'hidden')


    node.append('path')
        .data(nodes.descendants().slice(1))
        .attr("d", (d) => {
            let c = objPlusParentClone(d);
            c = transformToRadial({obj: c, xOff: w / 2, yOff: h / 2})
        return "M" + c.x + "," + c.y
            + "C" + c.x + "," + (c.y + c.parent.y) / 2
            + " " + c.parent.x + "," + (c.y + c.parent.y) / 2
            + " " + c.parent.x + "," + c.parent.y;
    })
        .attr('fill', 'none')
        .attr('stroke', d => {
            const type = legend[d.data.data.segment[0].connective_type];
            return type ? type.color : "grey"
        })
        .attr('stroke-opacity', d => 1 - d.data.depth / 6)
        .attr('stroke-width', d => 4 - d.data.depth / 2)

// adds the circle to the node
    node.append('circle')
        .attr('r', 10)
        .attr('cy', +10) //cy because it's 90deg rotated

        .attr('fill', 'white')
        .attr('stroke', "black")
        .attr('stroke-width', "4")

// adds the text to the node


    node.append("text")
        .attr("dy", 3)
        .attr("y", (d) => d.children ? -100 : 20)
        .style("text-anchor", (d) => d.children ? "end" : "start")
        .text((d) => d.data.name);

    // Add labels for the nodes
    //
    node.append('text')
        .attr('transform', 'rotate(90)')

        .attr("dy", ".35em")
        .attr("x", function (d) {
            return d.children || d._children ? -13 : 13;
        })
        .attr("text-anchor", function (d) {
            return d.children || d._children ? "end" : "start";
        })
        .text(function (d) {
            return d.data.id;
        });

    // node.append('svg') //svg as parent for path to move it
    //     .data(nodes.descendants().slice(1))
    //     .attr('y', -15)
    //     .attr('x', -10)
    //     .append('path')
    //     .attr('d', d => {
    //         console.log("data", d);
    //         const type = legend[d.data.data.segment[0].connective_type]
    //         if (type) {
    //             return lineFn(type.path)
    //         }
    //         else {
    //             return undefined
    //         }
    //     })
    //     .attr('fill', "none")
    //     .attr('stroke', "black")
    //     .attr('stroke-width', 3);

}, 1000);

function colorData(type) {
    return "grey"
}

function addGradientToSVG(elem) {
    let gradient = elem.append("svg:defs")
        .append("svg:linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%")
        .attr("spreadMethod", "pad");

    gradient.append("svg:stop")
        .attr("offset", "0%")
        .attr("stop-color", "red")
        .attr("stop-opacity", 1);

    gradient.append("svg:stop")
        .attr("offset", "100%")
        .attr("stop-color", "yellow")
        .attr("stop-opacity", 0.8);
}

function NumberToHSLa(number, s = "100%", l = "60%", a = 1) { //HSL is more intuitive then RGB s=100, l =60;
    let num = number;
    if (number > 12) {
        num = number % 12;
    }

    let h = 360 - num * 360 / 12 + 60; //Hue goes gradually around (COUNTERCLOCK) the wheel at pitch '6' => 180deg
    if (h == 360) {
        h = 0;
    }

    return "hsla" + "(" + h + "," + s + "," + l + "," + a + ")";
}
