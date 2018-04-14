export class VertexArrayObject {
    constructor(buffer, options = {}) {
        this._buffer = buffer;
        this._glContext = null;
        this._glVertexArrayObject = null;
        this._enabledAttributes = ('attributes' in options) ? options.attributes : null;
        this._mustWriteData = 'dataOrLength' in options;
        if (this._mustWriteData) {
            this._dataOrLength = options.dataOrLength;
        }
        this._isInitialized = false;
    }
    /**
     * Initializes the vertex array object.
     * Do not call this method manually.
     * @param {WebGL2RenderingContext} context
     * @param {WebGLProgram} program
     * @private
     */
    _init(context, program) {
        if (this._mustWriteData) {
            this._buffer.bufferData(this._dataOrLength);
        }
        this._buffer._initOnce(context, program, this._enabledAttributes);
        const vao = this._buffer._createWebGLVertexArrayObject(context, program, this._enabledAttributes);
        this._glContext = context;
        this._glVertexArrayObject = vao;
        this._isInitialized = true;
    }
    /**
     * Returns buffer bound to the vertex array object.
     * @returns {Buffer}
     */
    get buffer() {
        return this._buffer;
    }
    /**
     * Returns `WebGLVertexArrayObject` if the vertex array object is initialized.
     * Otherwise, throws an error.
     * @returns {WebGLVertexArrayObject}
     */
    get glVertexArrayObject() {
        if (this._isInitialized) {
            return this._glVertexArrayObject;
        }
        throw new Error('This vertex array object is not added to any program yet.');
    }
}
