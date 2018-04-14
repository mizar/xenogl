import { INTERLEAVED_ATTRIBS, VERTEX_SHADER, FRAGMENT_SHADER, ELEMENT_ARRAY_BUFFER } from './constants';
export class ShaderBase {
    constructor(source, shaderType) {
        this._source = source;
        this._glShader = null;
        this._isCompiled = false;
        this._shaderType = shaderType;
    }
    _compile(context) {
        const shader = context.createShader(this._shaderType);
        context.shaderSource(shader, this._source);
        context.compileShader(shader);
        const compileStatus = context.getShaderParameter(shader, context.COMPILE_STATUS);
        if (!compileStatus) {
            const info = context.getShaderInfoLog(shader);
            throw new Error(info);
        }
        this._glShader = shader;
        this._isCompiled = true;
        return shader;
    }
    /**
     * Returns if the shader is compiled.
     * @returns {boolean}
     */
    get isCompiled() {
        return this._isCompiled;
    }
    /**
     * Returns `WebGLShader` when the shader is already compiled.
     * Otherwise throws an error.
     * @returns {WebGLShader}
     */
    get glShader() {
        if (!this._glShader === null) {
            throw new Error('This shader is not compiled yet.');
        }
        return this._glShader;
    }
}
/**
 * A vertex shader.
 */
export class VertexShader extends ShaderBase {
    constructor(source) {
        super(source, VERTEX_SHADER);
    }
}
/**
 * A fragment shader.
 */
export class FragmentShader extends ShaderBase {
    constructor(source) {
        super(source, FRAGMENT_SHADER);
    }
}
/**
 * A shader program.
 */
export class Program {
    constructor(args) {
        this._vertexShader = args.vertexShader;
        this._fragmentShader = args.fragmentShader;
        this._feedbackVaryings = ('feedbackVaryings' in args) ? args.feedbackVaryings : [];
        this._feedbackBufferMode = ('feedbackBufferMode' in args) ? args.feedbackBufferMode : INTERLEAVED_ATTRIBS;
        this._isLinked = false;
        this._glContext = null;
        this._glProgram = null;
        this._initializedBuffers = [];
        this._uninitializedBuffers = [];
        this._initializedUniforms = [];
        this._uninitializedUniforms = [];
        this._initializedVertexArrayObjects = [];
        this._uninitializedVertexArrayObject = [];
        this._initializedUniformBufferObjects = [];
        this._uninitializedUniformBufferObjects = [];
        this._currentIndexBuffer = null;
        this._currentVertexArrayObject = null;
        this.id = null;
    }
    /**
     * Adds a buffer to the program.
     * @param {Buffer} buffer
     */
    addBuffer(buffer) {
        if (buffer.bufferType === ELEMENT_ARRAY_BUFFER) {
            this._currentIndexBuffer = buffer;
        }
        if (this.isLinked) {
            buffer._initOnce(this._glContext, this._glProgram);
            if (buffer.bufferType === ELEMENT_ARRAY_BUFFER && this._glContext !== null) {
                this._glContext.bindBuffer(ELEMENT_ARRAY_BUFFER, buffer.glBuffer);
            }
            this._initializedBuffers.push(buffer);
        }
        else {
            if (buffer.isInitialized) {
                this._initializedBuffers.push(buffer);
            }
            else {
                this._uninitializedBuffers.push(buffer);
            }
        }
    }
    /**
     * Activates the `ElementArrayBuffer` as a index buffer.
     * @param {ElementArrayBuffer} buffer
     */
    activateElementArrayBuffer(buffer) {
        this._currentIndexBuffer = buffer;
        if (this.isLinked && this._glContext !== null) {
            this._glContext.bindBuffer(ELEMENT_ARRAY_BUFFER, buffer.glBuffer);
        }
    }
    /**
     * Adds an uniform variable to the program.
     * @param {Uniform} uniform
     */
    addUniform(uniform) {
        if (this.isLinked) {
            uniform._init(this._glContext, this._glProgram);
            this._initializedUniforms.push(uniform);
        }
        else {
            this._uninitializedUniforms.push(uniform);
        }
    }
    /**
     * Adds a `VertexArrayObject` to the program.
     * @param {VertexArrayObject} vao
     */
    addVertexArrayObject(vao) {
        if (this.isLinked) {
            vao._init(this._glContext, this._glProgram);
            this._initializedVertexArrayObjects.push(vao);
            this._initializedBuffers.push(vao.buffer);
        }
        else {
            this._uninitializedVertexArrayObject.push(vao);
        }
    }
    /**
     * Activates the `VertexArrayObject`.
     * @param {VertexArrayObject} vao
     */
    activateVertexArrayObject(vao) {
        this._currentVertexArrayObject = vao;
        if (this.isLinked) {
            const context = this._glContext;
            context.bindVertexArray(vao.glVertexArrayObject);
        }
    }
    /**
     * Adds an `UniformBufferObject` to the program.
     * @param {UniformBufferObject} ubo
     */
    addUniformBufferObject(ubo) {
        if (this.isLinked) {
            const index = this._initializedUniformBufferObjects.length;
            ubo._init(this._glContext, this._glProgram, index);
            this._initializedUniformBufferObjects.push(ubo);
        }
        else {
            this._uninitializedUniformBufferObjects.push(ubo);
        }
    }
    /**
     * Issues a draw call, which draws graphics.
     * @param {number} mode
     * @param {number | null} count
     */
    draw(mode, count = null) {
        if (this._glContext !== null) {
            if (this._currentIndexBuffer !== null && this._currentIndexBuffer.data !== null) {
                this._glContext.drawElements(mode, this._currentIndexBuffer.data.length, this._currentIndexBuffer.dataType, 0);
            }
            else if (this._initializedBuffers.length > 0) {
                const c = (count !== null) ? count : this._initializedBuffers[0].dataCount;
                this._glContext.drawArrays(mode, 0, c);
            }
        }
    }
    activate() {
        this._initializedBuffers.forEach((b) => b.activate());
    }
    deactivate() {
        this._initializedBuffers.forEach((b) => b.deactivate());
    }
    /**
     * Links the shader program.
     * This method is called internally. So you don't have to call this method manually.
     * @param {WebGL2RenderingContext} context
     */
    _link(context) {
        // compile shaders.
        this._vertexShader._compile(context);
        this._fragmentShader._compile(context);
        // create a program.
        const program = context.createProgram();
        context.attachShader(program, this._vertexShader.glShader);
        context.attachShader(program, this._fragmentShader.glShader);
        if (this._feedbackVaryings.length > 0) {
            context.transformFeedbackVaryings(program, this._feedbackVaryings, this._feedbackBufferMode);
        }
        context.linkProgram(program);
        const linkStatus = context.getProgramParameter(program, context.LINK_STATUS);
        if (!linkStatus) {
            const info = context.getProgramInfoLog(program);
            throw new Error(info);
        }
        this._glContext = context;
        this._glProgram = program;
        this._isLinked = true;
        // initialize buffers.
        let buffer = null;
        while (buffer = this._uninitializedBuffers.shift()) {
            buffer._init(context, program);
            if (buffer.bufferType === ELEMENT_ARRAY_BUFFER && this._currentIndexBuffer === null) {
                this._currentIndexBuffer = buffer;
            }
            this._initializedBuffers.push(buffer);
        }
        if (this._currentIndexBuffer !== null) {
            context.bindBuffer(ELEMENT_ARRAY_BUFFER, this._currentIndexBuffer);
        }
        // initialize uniforms.
        let uniform = null;
        while (uniform = this._uninitializedUniforms.shift()) {
            uniform._init(context, program);
            this._initializedUniforms.push(uniform);
        }
        // initialize VertexArrayObjects.
        let vao = null;
        while (vao = this._uninitializedVertexArrayObject.shift()) {
            vao._init(context, program);
            this._initializedVertexArrayObjects.push(vao);
            this._initializedBuffers.push(vao.buffer);
        }
        if (this._currentVertexArrayObject !== null) {
            context.bindVertexArray(this._currentVertexArrayObject.glVertexArrayObject);
        }
        // initialize UniformBufferObjects
        let ubo = null;
        while (ubo = this._uninitializedUniformBufferObjects.shift()) {
            const index = this._initializedUniformBufferObjects.length;
            ubo._init(context, program, index);
            this._initializedUniformBufferObjects.push(ubo);
        }
    }
    /**
     * Returns if the program is linked.
     * @returns {boolean}
     */
    get isLinked() {
        return this._isLinked;
    }
    /**
     * Returns `WebGLProgram` when the program is already linked.
     * Otherwise throws an error.
     * @returns {WebGLProgram}
     */
    get glProgram() {
        if (this._glProgram === null) {
            throw new Error(`This program is not linked yet.`);
        }
        return this._glProgram;
    }
}
