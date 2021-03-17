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
                try {
                    msg.payload = applySimplexToArray(msg.payload)
                } catch (e){
                    done(e);
                }
            }
            else if (Number.isFinite(msg.payload)){
                msg.payload = simplex.noise2D(msg.payload, 1);
            } else if(isArrayOfNumberArrays(msg.payload)){
                msg.payload = msg.payload.map(applySimplexToArray);
            }
            else {
                done("Input must either be an array of numbers or a single number.");
            }
            node.send(msg);
        });
    }

    function applySimplexToArray(arr){
        switch (arr.length) {
            case 0:
                throw new Error("Input array was empty!");
            case 1:
                return  simplex.noise2D(arr[0], 1);
            case 2:
                return simplex.noise2D(arr[0], arr[1]);
            case 3:
                return  simplex.noise3D(arr[0], arr[1], arr[2]);
            default:
                return  simplex.noise4D(arr[0], arr[1], arr[2], arr[3]);
        }

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

    function isArrayOfNumberArrays(arr) {
        function isNumArr(acc, curr){
            return acc && isNumberArray(curr);
        }
        if (Array.isArray(arr)) {
            return arr.reduce(isNumArr, true)
        }
        return false;
    }

    RED.nodes.registerType("simplex", SimplexNode);
}
