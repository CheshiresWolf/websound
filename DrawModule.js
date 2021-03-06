define(function(require, exports, module) {
	
	require("./lib/glMatrix");
	require("./lib/webgl-utils");

    function Core(canvas, vertexShaderScript, fragmentShaderScript) {
        console.log("DrawModule | Core | start");

        var self = this;

        var gl;
        var vertexPositionBuffer, vertexColorBuffer;

        var drawType;

        var mvMatrix = mat4.create();
        var pMatrix = mat4.create();
        var mvMatrixStack = [];

        var shaderProgram;

        var bar = {
            count: 32,
            vertices : [],
            position : [-32.0, 0.0, -90.0]
        };

        bar.vertices = bar.vertices.concat(createBarCoords(
			bar.count,
			{
				x: 2.0,
				y: 0.0
			}
		));

        function createBarCoords(number, shift) {
			var i = 0, res = [];
			for (i; i < number; i++) {
				res = res.concat(getPositionNowY(shift.y));
			}

            i = 0;
            for (i; i < number; i++) {
                res = res.concat(getPositionNowX(i * shift.x));
            }
			
            return res;
        }
		
		function getPositionNowX(x) {
			return [
                x - 0.5,    x + 0.5,    x + 0.5,
                x - 0.5,    x - 0.5,    x + 0.5,
            ];
		}

        function getPositionNowY(y) {
            return [
                - 0.5,    - 0.5,    y + 0.5,
                - 0.5,  y + 0.5,    y + 0.5
            ];
        }

        self.init = function() {
        	console.log("DrawModule | Core | self.init");

            gl = canvas.getContext("experimental-webgl");
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;

            initShaders();
            initBuffers();

            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.enable(gl.DEPTH_TEST);

            drawType = gl.TRIANGLES;

            console.log("DrawModule | Core | viewport.size (" + gl.viewportWidth + ", " + gl.viewportHeight + ")");

            drawScene();
        };

        function compileShader(gl, shaderScript) {
            if (!shaderScript) {
                return null;
            }

            var str = "";
            var k = shaderScript.firstChild;
            while (k) {
                if (k.nodeType == 3) {
                    str += k.textContent;
                }
                k = k.nextSibling;
            }

            var shader;
            if (shaderScript.type == "x-shader/x-fragment") {
                shader = gl.createShader(gl.FRAGMENT_SHADER);
            } else if (shaderScript.type == "x-shader/x-vertex") {
                shader = gl.createShader(gl.VERTEX_SHADER);
            } else {
                return null;
            }

            gl.shaderSource(shader, str);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                alert(gl.getShaderInfoLog(shader));
                return null;
            }

            return shader;
        }

        function initShaders() {
            var fragmentShader = compileShader(gl, fragmentShaderScript);
            var vertexShader = compileShader(gl, vertexShaderScript);

            shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);
            gl.linkProgram(shaderProgram);

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                alert("Could not initialise shaders");
            }

            gl.useProgram(shaderProgram);

            shaderProgram.vertexPositionAttributeX = gl.getAttribLocation(shaderProgram, "aVertexPositionX");
            gl.enableVertexAttribArray(shaderProgram.vertexPositionAttributeX);

            shaderProgram.vertexPositionAttributeY = gl.getAttribLocation(shaderProgram, "aVertexPositionY");
            gl.enableVertexAttribArray(shaderProgram.vertexPositionAttributeY);

            shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
            shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        }

        function initBuffers() {
            vertexPositionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);

            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bar.vertices), gl.DYNAMIC_DRAW);
        }

        function setMatrixUniforms() {
            gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
            gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
        }

        function drawScene() {
            gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
            
            mat4.identity(mvMatrix);

            mvPushMatrix();
            mat4.translate(mvMatrix, bar.position);

            gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
            gl.vertexAttribPointer(
                shaderProgram.vertexPositionAttributeX,
                1,
                gl.FLOAT,
                false,
                0,
                bar.count * 6 * 4
            );

            gl.vertexAttribPointer(
                shaderProgram.vertexPositionAttributeY,
                1,
                gl.FLOAT,
                false,
                0,
                0
            );

            setMatrixUniforms();
            gl.drawArrays(drawType, 0, bar.count * 3 * 2);

            mvPopMatrix();
        }

        self.animate = function(audioArray) {
            var i = 0, res = [];
            for (i; i < bar.count; i++) {
                res = res.concat(getPositionNowY(
                    (audioArray[i] / 255) * 20
                ));
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
            gl.bufferSubData(
                gl.ARRAY_BUFFER,
                0,
                new Float32Array(res)
            );

            drawScene();
        };

        //gl.POINTS, gl.LINES, gl.LINE_LOOP, gl.LINE_STRIP, gl.TRIANGLES, gl.TRIANGLE_STRIP, gl.TRIANGLE_FAN
        self.setDrawType = function(index) {
            switch(index) {
                case "0":
                    drawType = gl.TRIANGLES;
                    break;
                case "1":
                    drawType = gl.TRIANGLE_STRIP;
                    break;
                case "2":
                    drawType = gl.TRIANGLE_FAN;
                    break;
                case "3":
                    drawType = gl.LINES;
                    break;
                case "4":
                    drawType = gl.LINE_LOOP;
                    break;
                case "5":
                    drawType = gl.LINE_STRIP;
                    break;
                case "6":
                    drawType = gl.POINTS;
                    break;
            }
        }

        function mvPushMatrix() {
            var copy = mat4.create();
            mat4.set(mvMatrix, copy);
            mvMatrixStack.push(copy);
        }

        function mvPopMatrix() {
            if (mvMatrixStack.length == 0) {
                throw "Invalid popMatrix!";
            }
            mvMatrix = mvMatrixStack.pop();
        }

        function degToRad(degrees) {
            return degrees * Math.PI / 180;
        }

        return self;
    }

    return Core;
});