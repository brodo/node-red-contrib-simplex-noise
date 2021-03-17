const helper = require("node-red-node-test-helper");
const simplexNode = require("../simplex");

helper.init(require.resolve('node-red'));

describe('simplex Node', function () {

    beforeEach(function (done) {
        helper.startServer(done);
    });

    afterEach(function (done) {
        helper.unload();
        helper.stopServer(done);
    });

    it('should be loaded', function (done) {
        const flow = [{id: "n1", type: "simplex", name: "test name"}];
        helper.load(simplexNode, flow, function () {
            const n1 = helper.getNode("n1");
            n1.should.have.property('name', 'test name');
            done();
        });
    });

    const tests = [1, [1, 2], [1, 2, 3], [1, 2, 3, 4],
        [1, 2, 3, 4, 5]]
    for (let test of tests) {
        it('should generate noise for single inputs: ' + test, function (done) {
            const flow = [
                {id: "n1", type: "simplex", name: "test name", wires: [["n2"]]},
                {id: "n2", type: "helper"}
            ];
            helper.load(simplexNode, flow, function () {
                const n2 = helper.getNode("n2");
                const n1 = helper.getNode("n1");
                n2.on("input", function (msg) {
                    try {
                        msg.should.have.property('payload').and.be.a.Number();
                        done();
                    } catch (err) {
                        done(err);
                    }
                });
                n1.receive({payload: test});
            });
        });
    }


    it('should generate the same values for the same inputs', function (done) {
        const flow = [
            {id: "n1", type: "simplex", name: "test name", wires: [["n2"]]},
            {id: "n2", type: "helper"}
        ];
        helper.load(simplexNode, flow, function () {
            const n2 = helper.getNode("n2");
            const n1 = helper.getNode("n1");
            let timesCalled = 0;
            let output = 0;
            n2.on("input", function (msg) {
                try {
                    if (timesCalled === 0) {
                        output = msg.payload;
                        timesCalled++;
                    } else {
                        msg.should.have.property('payload', output);
                        done();
                    }


                } catch (err) {
                    done(err);
                }
            });
            n1.receive({payload: 5});
            n1.receive({payload: 5});

        });
    });


    const fails = ["hello", []]
    for (let fail of fails) {
        it('should fail for input: ' + fail, function (done) {
            const flow = [
                {id: "n1", type: "simplex", name: "test name", wires: [["n2"]]}
            ];
            helper.load(simplexNode, flow, function () {
                const n1 = helper.getNode("n1");
                n1.on("call:error", function () {
                    // Expect error to be called
                    done();
                });
                n1.receive({payload: fail});
            });
        });
    }

    const multiInputTests = [
        [[1], [2], [3]],
        [[1, 2], [2, 3], [3, 4]],
        [[1, 2, 3], [2, 3, 4], [3, 4, 5]],
        [[1, 2, 3], [2, 3, 4], [3, 4, 5]],
    ]
    for (let mTest of multiInputTests) {
        it('should generate multiple values for multiple inputs: ' + mTest, function (done) {
            const flow = [
                {id: "n1", type: "simplex", name: "test name", wires: [["n2"]]},
                {id: "n2", type: "helper"}
            ];
            helper.load(simplexNode, flow, function () {
                const n2 = helper.getNode("n2");
                const n1 = helper.getNode("n1");
                n2.on("input", function (msg) {
                    try {
                        msg.should.have.property('payload').and.be.an.Array().of.length(mTest.length);
                        const arr = msg.payload;
                        // all the examples should return a single number for each input array
                        for (let elem of arr) {
                            elem.should.be.a.Number();
                        }
                        done();
                    } catch (err) {
                        done(err);
                    }
                });
                n1.receive({payload: mTest});
            });
        });
    }
});
