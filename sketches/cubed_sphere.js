window.initializeCubedSphere = () => {
    new p5(cubedSphere, window.document.getElementById("cubedSphere"));
};

window.removeP5 = () => {
    window.document.getElementsByClassName("p5Canvas").item(0)?.remove();
}

let cubedSphere = function(p5) {
    const scale = 200;
    let gameArray = [];
    let calculateArray = [];
    
    p5.setup = function() {
        p5.createCanvas(800, 800, p5.WEBGL);
        p5.strokeWeight(3);

        for (let f = 0; f < 6; f++) {
            gameArray[f] = [];
            calculateArray[f] = [];
            for (let x = -2; x <= 2; x++) {
                gameArray[f][x] = [];
                calculateArray[f][x] = [];
                for (let y = -2; y <= 2; y++) {
                    gameArray[f][x][y] = p5.random(0, 10) > 8;
                    calculateArray[f][x][y] = false;
                }
            }
        }
    }
    
    p5.draw = function() {
        p5.background(p5.color('#8BD3E6'));

        p5.lights();
        p5.specularMaterial(p5.color('#FFE6B5'));
        p5.shininess(95);
        p5.orbitControl();
        p5.rotateY(p5.QUARTER_PI);
        p5.fill(p5.color('#FEFBEA'));
        p5.stroke(p5.color('#3C3F42'));
        drawSphere();
        drawGame();
        if (p5.frameCount % 18 === 0) {
            advanceGame();
        }
    }
    
    
    // Helper functions
    // Advance the game by calculating new result for each cell.
    function advanceGame() {
        for (let f = 0; f < 6; f++) {
            for (let x = -2; x <= 2; x++) {
                for (let y = -2; y <= 2; y++) {
                    calculateArray[f][x][y] = checkNeighbors(f, x, y);
                }
            }
        }

        gameArray = calculateArray;
    }
    
    function checkNeighbors(face, x, y) {
        let absX = p5.abs(x);
        let absY = p5.abs(y);
        let liveNeighbors = 0;
        let isSelfLive = gameArray[face][x][y];

        if (absX <= 1 && absY <= 1) {
            // Basic logic for all non-edge cases
            for (i = x - 1; i <= x + 1; i++) {
                for (j = y - 1; j <= y + 1; j++) {
                    if (!(i === x && j === y)) {
                        // Checks all squares in a 3x3 grid minus the center which is the main cell
                        if (gameArray[face][i][j]) {
                            liveNeighbors++;
                        }
                    }
                }
            }
        } else {
            let horizontalWrapFace;
            let verticalWrapFace;
            let cardinality;
            let verticalCardinality = 1;
            let horizontalCardinality = 1;
            if (face === 4) {
                if (x === -2) { // Top face wrapping to left
                    horizontalWrapFace = 3;
                    horizontalCardinality = -1;
                } else { // Top face wrapping to right
                    horizontalWrapFace = 1;
                }
                if (y === -2) { // Top face wrapping down
                    verticalWrapFace = 0;
                } else { // Top face wrapping up
                    verticalWrapFace = 2;
                    verticalCardinality = -1;
                }
            } else if (face === 5) {
                if (x === -2) { // Bottom face wrapping left
                    horizontalWrapFace = 3;
                } else { // Bottom face wrapping right
                    horizontalWrapFace = 1;
                    horizontalCardinality = -1;
                }
                if (y === -2) { // Bottom face wrapping down
                    verticalWrapFace = 2;
                    verticalCardinality = -1;
                } else { // Bottom face wrapping up
                    verticalWrapFace = 0;
                }
            } else { // All side faces
                // Horizontal wrap face determined by cardinality of x value and current face (%4 so it stays within the schema of 0-3 faces)
                // Vertical wrap face will always be the top face if y is + and bottom face if -
                horizontalWrapFace = (face + 4 + x / 2) % 4;
                verticalWrapFace = (y === -2 ? 5 : 4);
                cardinality = 1; // Cardinality dictates whether we wrap to the + or - side of the vertical wrap face
                if (verticalWrapFace === 4) {
                    if (face === 0 || face === 3) {
                        cardinality = -1; // Negative cardinality if wrapping from front or left side face to top
                    }
                }
                if (verticalWrapFace === 5) {
                    if (face === 3 || face === 2) {
                        cardinality = -1; // Negative cardinality if wrapping from back or left side face to bottom
                    }
                }
            }
            
            // Check 3x3 grid centered on current cell = (f, x, y)
            for (let j = y - 1; j <= y + 1; j++) {
                for (let i = x - 1; i <= x + 1; i++) {
                    if (p5.abs(i) === 3 && p5.abs(j) === 3) { // Special logic for cubes
                        if (gameArray[face][x * -1][y * -1]) {
                            liveNeighbors++; // Corner neighbor of corner cells determined to wrap to opposite corner of current face
                        }
                    } else if (p5.abs(i) === 3 && p5.abs(j) !== 3) {
                        if (face >= 0 && face < 4) {
                            if (gameArray[horizontalWrapFace][-x][j]) {
                                // Wraps to the opposite x value and same y value if wrapping on side faces
                                liveNeighbors++;
                            }
                        } else {
                            if (gameArray[horizontalWrapFace][j * horizontalCardinality][face === 4 ? 2 : -2]) {
                                // Wrapping from the top will touch the top row of a side face and wrapping from the bottom will touch the bottom row of a side face
                                liveNeighbors++;
                            }
                        }
                    } else if (p5.abs(j) === 3 && p5.abs(i) !== 3) {
                        if (face >= 0 && face < 4) {
                            if (face % 2 === 0) {
                                if (
                                    gameArray[verticalWrapFace][face === 2 ? i * -1 : i][2 * cardinality]
                                ) {
                                    liveNeighbors++;
                                } // Logic to wrap to other face, if wrapping to the far side of the top face the x values have to be rotated so x = -1 on face 2 is x = +1 on top face
                            } else {
                                if (
                                    gameArray[verticalWrapFace][2 * cardinality][face === 1 ? i * -1 : i]
                                ) {
                                    liveNeighbors++;
                                } // Additional logic to wrap with a rotated y to bottom face
                            }
                        } else {
                            if (gameArray[verticalWrapFace][i * verticalCardinality][face === 4 ? 2 : -2]) {
                                // Wrapping from top or bottom face vertically will always touch the top or bottom row respectively
                                liveNeighbors++;
                            }
                        }
                    } else if (!(i === x && j === y)) {
                        if (gameArray[face][i][j]) {
                            liveNeighbors++;
                        } // Default logic for Game of Life, excludes current cell
                    }
                }
            }
        }

        // Logic for Conway's Game of Life based on whether current cell is live
        if (isSelfLive) {
            return liveNeighbors === 2 || liveNeighbors === 3
        } else {
            return liveNeighbors === 3
        }
    }
    
    // Draws 'life' on the cubed sphere based on live/dead cells in game array
    function drawGame() {
        for (let f = 0; f < 6; f++) {
            for (let x = -2; x <= 2; x++) {
                for (let y = -2; y <= 2; y++) {
                    if (gameArray[f][x][y]) {
                        drawLife(f, x, y);
                    }
                }
            }
        }
    }
    
    // Draws 'life' represented by a circle on a given cell
    function drawLife(face, x, y) {
        const rotationFactor = p5.HALF_PI / 5;
        const outerGridArcLength = p5.QUARTER_PI / 3.1;
        const innerGridArcLength = p5.HALF_PI / 5.3;

        let yRotationFactor;
        let xFactor = p5.abs(x) % 5;
        if (xFactor === 1 || xFactor === 4) {
            yRotationFactor = innerGridArcLength;
        } else if (xFactor === 2 || xFactor === 3) {
            yRotationFactor = outerGridArcLength;
        } else {
            yRotationFactor = rotationFactor;
        }

        p5.push();
        p5.rotateY(-p5.QUARTER_PI);
        p5.noStroke();

        if (face === 4) {
            p5.rotateX(p5.HALF_PI);
        } else if (face === 5) {
            p5.rotateX(-p5.HALF_PI);
        } else {
            p5.rotateY(p5.HALF_PI * face);
        }
        p5.rotateY(rotationFactor * x);

        p5.rotateX(yRotationFactor * (p5.abs(y) === 2 && x !== 0 ? y * 1.04 : y));
        p5.translate(0, 0, scale);
        p5.fill(p5.color('#9AC791'));
        if (xFactor === 0 && y === 0) {
            p5.circle(0, 0, scale * 0.3);
        } else if (xFactor === 2 || p5.abs(y) === 2) {
            p5.circle(0, 0, scale * 0.225);
        } else {
            p5.circle(0, 0, scale * 0.28);
        }
        p5.pop();
    }
    
    // Draws the in between grid lines representing the game array in 3D
    function drawGrids() {
        const outerGridArcLength = 1.45 / 2;
        const innerGridArcLength = 1.55 / 2;
        p5.push();
        p5.noFill();
        p5.strokeWeight(1);
        p5.rotateY(p5.HALF_PI / 5);
        p5.arc(0, 0, scale * 2, scale * 2, -outerGridArcLength, outerGridArcLength);
        p5.rotateY(p5.HALF_PI / 5);
        p5.arc(0, 0, scale * 2, scale * 2, -innerGridArcLength, innerGridArcLength);
        p5.rotateY(p5.HALF_PI / 5);
        p5.arc(0, 0, scale * 2, scale * 2, -innerGridArcLength, innerGridArcLength);
        p5.rotateY(p5.HALF_PI / 5);
        p5.arc(0, 0, scale * 2, scale * 2, -outerGridArcLength, outerGridArcLength);
        p5.pop();
    }
    
    // Draws the cubed sphere on which the Game of Life will take place
    function drawSphere() {
        const arcLength = 1.231 / 2;

        p5.push();
        p5.noFill();
        drawGrids();
        p5.arc(0, 0, scale * 2, scale * 2, -arcLength, arcLength);
        p5.rotateY(p5.HALF_PI);
        drawGrids();
        p5.arc(0, 0, scale * 2, scale * 2, -arcLength, arcLength);
        p5.rotateY(p5.HALF_PI);
        drawGrids();
        p5.arc(0, 0, scale * 2, scale * 2, -arcLength, arcLength);
        p5.rotateY(p5.HALF_PI);
        drawGrids();
        p5.arc(0, 0, scale * 2, scale * 2, -arcLength, arcLength);
        p5.pop();

        p5.push();
        p5.noFill();
        p5.rotateX(p5.HALF_PI);
        p5.rotateZ(p5.QUARTER_PI);
        p5.rotateY(p5.QUARTER_PI);
        drawGrids();
        p5.arc(0, 0, scale * 2, scale * 2, -arcLength, arcLength);
        p5.rotateY(-p5.QUARTER_PI);
        p5.rotateZ(p5.HALF_PI);
        p5.rotateY(p5.QUARTER_PI);
        drawGrids();
        p5.arc(0, 0, scale * 2, scale * 2, -arcLength, arcLength);
        p5.rotateY(-p5.QUARTER_PI);
        p5.rotateZ(p5.HALF_PI);
        p5.rotateY(p5.QUARTER_PI);
        p5.arc(0, 0, scale * 2, scale * 2, -arcLength, arcLength);
        p5.rotateY(-p5.QUARTER_PI);
        p5.rotateZ(p5.HALF_PI);
        p5.rotateY(p5.QUARTER_PI);
        p5.arc(0, 0, scale * 2, scale * 2, -arcLength, arcLength);
        p5.pop();

        p5.push();
        p5.noFill();
        p5.rotateX(-p5.HALF_PI);
        p5.rotateZ(p5.QUARTER_PI);
        p5.rotateY(p5.QUARTER_PI);
        drawGrids();
        p5.rotateY(-p5.QUARTER_PI);
        p5.rotateZ(p5.HALF_PI);
        p5.rotateY(p5.QUARTER_PI);
        drawGrids();
        p5.pop();

        p5.push();
        p5.noFill();
        p5.rotateX(p5.HALF_PI);
        p5.rotateZ(p5.QUARTER_PI);
        p5.rotateY(-p5.QUARTER_PI);
        drawGrids();
        p5.arc(0, 0, scale * 2, scale * 2, -arcLength, arcLength);
        p5.rotateY(p5.QUARTER_PI);
        p5.rotateZ(p5.HALF_PI);
        p5.rotateY(-p5.QUARTER_PI);
        drawGrids();
        p5.arc(0, 0, scale * 2, scale * 2, -arcLength, arcLength);
        p5.rotateY(p5.QUARTER_PI);
        p5.rotateZ(p5.HALF_PI);
        p5.rotateY(-p5.QUARTER_PI);
        drawGrids();
        p5.arc(0, 0, scale * 2, scale * 2, -arcLength, arcLength);
        p5.rotateY(p5.QUARTER_PI);
        p5.rotateZ(p5.HALF_PI);
        p5.rotateY(-p5.QUARTER_PI);
        drawGrids();
        p5.arc(0, 0, scale * 2, scale * 2, -arcLength, arcLength);
        p5.pop();

        p5.push();
        p5.noStroke();
        p5.sphere(scale);
        p5.pop();
    }
}