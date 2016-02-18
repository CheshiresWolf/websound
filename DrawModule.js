define(function(require, exports, module) {
	
	require("./lib/glMatrix");
	require("./lib/webgl-utils");

    function Core(canvas, mainShaders, textureShaders) {//vertexShaderScript, fragmentShaderScript) {
        console.log("DrawModule | Core | start");

        var self = this;

        var gl;
        var vertexPositionBuffer, vertexColorBuffer;
        var cubeVertexPositionBuffer, cubeVertexTextureCoordBuffer;

        var drawType;

        var mvMatrix = mat4.create();
        var pMatrix = mat4.create();
        var mvMatrixStack = [];

        var mainProgram, textureProgram;

        var bar = {
            count : 32,
            vertices : [],
            position : [-32.0, -32.0, -32.0]
            //[-32.0, 0.0, -90.0]
        };

        bar.vertices = bar.vertices.concat(createBarCoords(
			bar.count,
			{
				x : 2.0,
				y : 0.0
			}
		));

        var rttFramebuffer;
        var rttTexture;

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
                x, x + 1, x + 1,
                x, x,     x + 1
            ];
		}

        function getPositionNowY(y) {
            return [
                0, 0,     y + 1,
                0, y + 1, y + 1
            ];
        }

        self.init = function() {
        	console.log("DrawModule | Core | self.init");

            gl = canvas.getContext("experimental-webgl");
            gl.viewportWidth  = canvas.width;
            gl.viewportHeight = canvas.height;

            initShaders();
            initBuffers();

            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.GL_DST_ALPHA);
            gl.disable(gl.DEPTH_TEST);

            drawType = gl.TRIANGLES;

            console.log("DrawModule | Core | viewport.size (" + gl.viewportWidth + ", " + gl.viewportHeight + ")");

            drawScene();
            // drawLikeInOldTimes();
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
            mainProgram = gl.createProgram();
            gl.attachShader(mainProgram, compileShader(gl, mainShaders.vs));
            gl.attachShader(mainProgram, compileShader(gl, mainShaders.fs));
            gl.linkProgram(mainProgram);

            textureProgram = gl.createProgram();
            gl.attachShader(textureProgram, compileShader(gl, textureShaders.vs));
            gl.attachShader(textureProgram, compileShader(gl, textureShaders.fs));
            gl.linkProgram(textureProgram);
        }

        function useMainShader() {
            if (!gl.getProgramParameter(mainProgram, gl.LINK_STATUS)) {
                alert("Could not initialise shaders");
            }

            gl.useProgram(mainProgram);

            mainProgram.vertexPositionAttributeX = gl.getAttribLocation(mainProgram, "aVertexPositionX");
            gl.enableVertexAttribArray(mainProgram.vertexPositionAttributeX);

            mainProgram.vertexPositionAttributeY = gl.getAttribLocation(mainProgram, "aVertexPositionY");
            gl.enableVertexAttribArray(mainProgram.vertexPositionAttributeY);

            mainProgram.pMatrixUniform  = gl.getUniformLocation(mainProgram, "uPMatrix");
            mainProgram.mvMatrixUniform = gl.getUniformLocation(mainProgram, "uMVMatrix");
        }

        function useTextureShader() {
            if (!gl.getProgramParameter(textureProgram, gl.LINK_STATUS)) {
                alert("Could not initialise shaders");
            }

            gl.useProgram(textureProgram);

            textureProgram.vertexPositionAttributeX = gl.getAttribLocation(textureProgram, "aVertexPositionX");
            gl.enableVertexAttribArray(textureProgram.vertexPositionAttributeX);

            textureProgram.vertexPositionAttributeY = gl.getAttribLocation(textureProgram, "aVertexPositionY");
            gl.enableVertexAttribArray(textureProgram.vertexPositionAttributeY);

            textureProgram.pMatrixUniform  = gl.getUniformLocation(textureProgram, "uPMatrix");
            textureProgram.mvMatrixUniform = gl.getUniformLocation(textureProgram, "uMVMatrix");

            textureProgram.textureCoordAttribute = gl.getAttribLocation(textureProgram, "aTextureCoord");
            gl.enableVertexAttribArray(textureProgram.textureCoordAttribute);

            textureProgram.samplerUniform = gl.getUniformLocation(textureProgram, "uSampler");
        }

        function initBuffers() {
            initTextureFramebuffer();

            vertexPositionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);

            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bar.vertices), gl.DYNAMIC_DRAW);

            cubeVertexPositionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
            var cubeVertices = [
                -1.0,
                 1.0,
                 1.0,
                 1.0,
                -1.0,
                -1.0,

                 1.0,
                 1.0,
                -1.0,
                -1.0,
                -1.0,
                 1.0
            ];
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertices), gl.STATIC_DRAW);

            cubeVertexTextureCoordBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
            var cubeTexturePosition = [
                0.0, 1.0,
                1.0, 1.0,
                1.0, 0.0,
                1.0, 0.0,
                0.0, 0.0,
                0.0, 1.0
            ];
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeTexturePosition), gl.STATIC_DRAW);

            cubeVertexTextureCoordBufferFlip = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBufferFlip);
            var cubeTexturePosition = [
                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,
                1.0, 1.0,
                0.0, 1.0,
                0.0, 0.0
            ];
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeTexturePosition), gl.STATIC_DRAW);
        }

        function initTextureFramebuffer() {
            rttFramebuffer = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer);

            rttFramebuffer.width  = canvas.width;
            rttFramebuffer.height = canvas.height;

            rttTexture = gl.createTexture();

            gl.bindTexture(gl.TEXTURE_2D, rttTexture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            // gl.generateMipmap(gl.TEXTURE_2D);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, rttFramebuffer.width, rttFramebuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        
            var renderbuffer = gl.createRenderbuffer();
            gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, rttFramebuffer.width, rttFramebuffer.height);

            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rttTexture, 0);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.bindRenderbuffer(gl.RENDERBUFFER, null);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }

        function setMatrixUniforms() {
            gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
            gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
        }

        function drawToTexture() {
            gl.viewport(0, 0, rttFramebuffer.width, rttFramebuffer.height);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            mat4.perspective(90, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
            
            mat4.identity(mvMatrix);

            mvPushMatrix();
            mat4.translate(mvMatrix, bar.position);

            gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
            gl.vertexAttribPointer(
                mainProgram.vertexPositionAttributeX,
                1,
                gl.FLOAT,
                false,
                0,
                bar.count * 6 * 4
            );

            gl.vertexAttribPointer(
                mainProgram.vertexPositionAttributeY,
                1,
                gl.FLOAT,
                false,
                0,
                0
            );

            gl.uniformMatrix4fv(mainProgram.pMatrixUniform, false, pMatrix);
            gl.uniformMatrix4fv(mainProgram.mvMatrixUniform, false, mvMatrix);

            gl.drawArrays(drawType, 0, bar.count * 3 * 2);

            mvPopMatrix();

            gl.bindTexture(gl.TEXTURE_2D, rttTexture);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }

        function drawLikeInOldTimes() {
            useMainShader();

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            mat4.perspective(90, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
            
            mat4.identity(mvMatrix);

            mvPushMatrix();
            mat4.translate(mvMatrix, bar.position);

            gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
            gl.vertexAttribPointer(
                mainProgram.vertexPositionAttributeX,
                1,
                gl.FLOAT,
                false,
                0,
                bar.count * 6 * 4
            );

            gl.vertexAttribPointer(
                mainProgram.vertexPositionAttributeY,
                1,
                gl.FLOAT,
                false,
                0,
                0
            );

            gl.uniformMatrix4fv(mainProgram.pMatrixUniform,  false, pMatrix);
            gl.uniformMatrix4fv(mainProgram.mvMatrixUniform, false, mvMatrix);

            gl.drawArrays(drawType, 0, bar.count * 3 * 2);

            mvPopMatrix();
        }

        function drawScene() {
            gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer);

            useMainShader();
            drawToTexture();

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            useTextureShader();

            mat4.perspective(90, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
            
            mat4.identity(mvMatrix);

            // Draw main texture

            mvPushMatrix();

            mat4.translate(mvMatrix, [0.0, 1.01, -1.0]);

            gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
            gl.vertexAttribPointer(textureProgram.vertexPositionAttributeX, 1, gl.FLOAT, false, 0, 0);
            gl.vertexAttribPointer(textureProgram.vertexPositionAttributeY, 1, gl.FLOAT, false, 0, 6 * 4);
            
            gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
            gl.vertexAttribPointer(textureProgram.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
            
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, rttTexture);
            gl.uniform1i(textureProgram.samplerUniform, 0);

            gl.uniformMatrix4fv(textureProgram.pMatrixUniform,  false, pMatrix);
            gl.uniformMatrix4fv(textureProgram.mvMatrixUniform, false, mvMatrix);
            gl.drawArrays(drawType, 0, 6);

            mvPopMatrix();

            // Draw rotated texture

            mvPushMatrix();

            mat4.translate(mvMatrix, [0.0, -1.01, -1.0]);

            gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
            gl.vertexAttribPointer(textureProgram.vertexPositionAttributeX, 1, gl.FLOAT, false, 0, 0);
            gl.vertexAttribPointer(textureProgram.vertexPositionAttributeY, 1, gl.FLOAT, false, 0, 6 * 4);
            
            gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBufferFlip);
            gl.vertexAttribPointer(textureProgram.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
            
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, rttTexture);
            gl.uniform1i(textureProgram.samplerUniform, 0);

            gl.uniformMatrix4fv(textureProgram.pMatrixUniform,  false, pMatrix);
            gl.uniformMatrix4fv(textureProgram.mvMatrixUniform, false, mvMatrix);
            gl.drawArrays(drawType, 0, 6);

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
            // drawLikeInOldTimes();
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