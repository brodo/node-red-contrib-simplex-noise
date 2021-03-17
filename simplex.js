const SimplexNoise = require('simplex-noise')
module.exports = function (RED) {
    const simplex = new SimplexNoise(Math.random)

    function SimplexNode(config) {
        RED.nodes.createNode(this, config);
        let node = this;
        node.on('input', function (msg, send, done) {
            if(msg.payload === undefined){
                done("Input must either be an array of numbers or a single number.");
            }
            if (isNumberArray(msg.payload)) {
                const arr = msg.payload;
                switch (arr.length) {
                    case 0:
                        done("Input array was empty!");
                        break;
                    case 1:
                        msg.payload = simplex.noise2D(arr[0], 1);
                        break;
                    case 2:
                        msg.payload = simplex.noise2D(arr[0], arr[1]);
                        break;
                    case 3:
                        msg.payload = simplex.noise3D(arr[0], arr[1], arr[2]);
                        break;
                    default:
                        msg.payload = simplex.noise4D(arr[0], arr[1], arr[2], arr[3]);
                }
            }
            else if (Number.isFinite(msg.payload)){
                msg.payload = simplex.noise2D(msg.payload, 1);
            } else {
                done("Input must either be an array of numbers or a single number.");
            }
            node.send(msg);
        });
    }

    function isNumberArray(arr) {
        function isNum(acc, curr) {
            return acc && Number.isFinite(curr)
        }

        if (Array.isArray(arr)) {
            return arr.reduce(isNum, true)
        }
        return false;

    }

    RED.nodes.registerType("simplex", SimplexNode);
}
