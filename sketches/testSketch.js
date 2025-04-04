window.initializeTest = () => {
    new p5(testSketch, window.document.getElementById("testSketch"));
};

window.removeP5 = () => {
    window.document.getElementsByClassName("p5Canvas").item(0).remove();
}

let testSketch = function(p5){

    p5.setup = function(){
        // Create the canvas
        p5.createCanvas(710, 400);

        // Set background to black
        p5.background(0);

        // Set width of the lines
        p5.strokeWeight(10);

        // Set color mode to hue-saturation-brightness (HSB)
        p5.colorMode(p5.HSB);
        
        // Set screen reader accessible description
        p5.describe('A blank canvas where the user draws by dragging the mouse');
    }
    
    p5.mouseDragged = function(){
        // Set the color based on the mouse position, and draw a line
        // from the previous position to the current position
        let lineHue = p5.map(p5.mouseX, 0, p5.width, 0, 359);
        let lineSaturation = p5.map(p5.mouseY, 0, p5.height, 30, 130);
        p5.stroke(lineHue, lineSaturation, 90);
        p5.line(p5.pmouseX, p5.pmouseY, p5.mouseX, p5.mouseY);
    }
    
    p5.draw = function(){
    }
};