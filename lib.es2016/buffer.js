import { STATIC_DRAW, FLOAT, UNSIGNED_SHORT, ARRAY_BUFFER, ELEMENT_ARRAY_BUFFER, UNIFORM_BUFFER } from './constants';
import { getBytesPerElementByGlType } from './utils';
export class BufferBase {
    constructor(args = { dataOrLength: null, attributes: [], dataType: FLOAT, usage: STATIC_DRAW }, bufferType) {
        this._glContext = null;
        this._glProgram = null;
        this._glBuffer = null;
        this._dataOrLength = ('dataOrLength' in args) ? args.dataOrLength : null;
        this._attributes = ('attributes' in args) ? args.attributes : [];
        this._enabledAttributes = this._attributes;
        this._attributeToLocation = new Map();
        this._dataType = ('dataType' in args) ? args.dataType : FLOAT;
        this._usage = ('usage' in args) ? args.usage : STATIC_DRAW;
        this._bufferType = bufferType;
        this._isInitialized = false;
        this._flushData = (context, buffer) => { };
        this._totalAttributesSize = this._attributes.reduce((prev, attr) => prev + attr.size, 0);
        this._data = null;
        if (this._dataOrLength !== null) {
            this.bufferData(this._dataOrLength);
        }
    }
    /**
     * Send data to the buffer.
     * @param {TypedArrayLike | number} dataOrLength
     */
    bufferData(dataOrLength) {
        this._flushData = (context, buffer) => {
            this._dataOrLength = dataOrLength;
            context.bindBuffer(this._bufferType, buffer);
            if (typeof dataOrLength === 'number') {
                const bytes = dataOrLength * getBytesPerElementByGlType(this._dataType);
                context.bufferData(this._bufferType, bytes, this._usage);
            }
            else {
                context.bufferData(this._bufferType, dataOrLength, this._usage);
                this._data = dataOrLength;
            }
            context.bindBuffer(this._bufferType, null);
        };
        this._flush();
    }
    activate() {
        this._enableAttributes();
    }
    deactivate() {
        this._disableAttributes();
    }
    _flush() {
        if (this._glContext !== null && this._glBuffer !== null) {
            this._flushData(this._glContext, this._glBuffer);
        }
    }
    /**
     * Initializes attributes.
     * Do not call this method manually.
     * @param {WebGL2RenderingContext} context
     * @param {WebGLProgram | null} program
     * @param {Attribute[] | null} attributes
     * @private
     */
    _initAttributes(context, program, attributes = null) {
        this._enabledAttributes = this._attributes;
        if (attributes !== null) {
            this._enabledAttributes = attributes;
        }
        this._attributes.forEach((attr) => {
            const location = context.getAttribLocation(program, attr.name);
            this._attributeToLocation.set(attr, location);
        });
        const bytesPerElement = getBytesPerElementByGlType(this._dataType);
        const strideBytes = bytesPerElement * this._totalAttributesSize;
        let offsetBytes = 0;
        for (let i = 0; i < this._attributes.length; i += 1) {
            const attr = this._attributes[i];
            const location = this._attributeToLocation.get(attr);
            if (this._enabledAttributes.find((e) => e.equals(attr))) {
                context.enableVertexAttribArray(location);
                context.vertexAttribPointer(location, attr.size, this._dataType, false, strideBytes, offsetBytes);
            }
            offsetBytes += attr.size * bytesPerElement;
        }
    }
    _enableAttributes() {
        if (this._glContext !== null) {
            const context = this._glContext;
            const program = this._glProgram;
            context.bindBuffer(this.bufferType, this._glBuffer);
            this._initAttributes(context, program, this._enabledAttributes);
            context.bindBuffer(this.bufferType, null);
        }
    }
    _disableAttributes() {
        if (this._glContext !== null) {
            const context = this._glContext;
            this._enabledAttributes.forEach((attr) => {
                const location = this._attributeToLocation.get(attr);
                context.disableVertexAttribArray(location);
            });
        }
    }
    /**
     * Initializes the buffer.
     * Do not call this method manually.
     * @param {WebGL2RenderingContext} context
     * @param {WebGLProgram | null} program
     * @param {Attribute[] | null} attributes
     * @private
     */
    _init(context, program = null, attributes = null) {
        const buffer = context.createBuffer();
        context.bindBuffer(this._bufferType, buffer);
        if (program !== null) {
            this._initAttributes(context, program, attributes);
        }
        this._glContext = context;
        this._glProgram = program;
        this._glBuffer = buffer;
        this._flush();
        // unbind
        context.bindBuffer(this._bufferType, null);
        this._isInitialized = true;
    }
    /**
     * Initializes the buffer.
     * Do not call this method manually.
     * @param {WebGL2RenderingContext} context
     * @param {WebGLProgram | null} program
     * @param {Attribute[] | null} attributes
     * @private
     */
    _initOnce(context, program = null, attributes = null) {
        if (!this.isInitialized) {
            this._init(context, program, attributes);
        }
    }
    /**
     * Creates and return `WebGLVertexArrayObject`.
     * You don't have to call this method manually.
     * @param {WebGL2RenderingContext} context
     * @param {WebGLProgram | null} program
     * @param {Attribute[] | null} attributes
     * @returns {WebGLVertexArrayObject}
     * @private
     */
    _createWebGLVertexArrayObject(context, program = null, attributes = null) {
        const buffer = this._glBuffer;
        const vao = context.createVertexArray();
        context.bindVertexArray(vao);
        context.bindBuffer(this._bufferType, buffer);
        if (program !== null) {
            this._initAttributes(context, program, attributes);
        }
        if (this._dataOrLength !== null && typeof this._dataOrLength === 'number') {
            context.bufferData(this._bufferType, this._dataOrLength, this._usage);
        }
        else if (this._dataOrLength !== null) {
            context.bufferData(this._bufferType, this._dataOrLength, this._usage);
        }
        context.bindBuffer(this._bufferType, null);
        context.bindVertexArray(null);
        return vao;
    }
    /**
     * Returns data of the buffer.
     * @returns {TypedArrayLike | null}
     */
    get data() {
        return this._data;
    }
    /**
     * Returns data type of the buffer.
     * @returns {number}
     */
    get dataType() {
        return this._dataType;
    }
    /**
     * Returns how many data set stored in the buffer.
     * @returns {number}
     */
    get dataCount() {
        if (this.data !== null) {
            return this.data.length / this._totalAttributesSize;
        }
        return 0;
    }
    /**
     * Returns usage of the buffer.
     * @returns {number}
     */
    get usage() {
        return this._usage;
    }
    /**
     * Returns if the buffer is initialized.
     * @returns {boolean}
     */
    get isInitialized() {
        return this._isInitialized;
    }
    /**
     * Returns total size of attributes.
     * @returns {number}
     */
    get totalAttributesSize() {
        return this._totalAttributesSize;
    }
    /**
     * Returns type of the buffer.
     * It can be `XenoGL..ARRAY_BUFFER` or `XenoGL..ELEMENT_ARRAY_BUFFER`.
     * @returns {number}
     */
    get bufferType() {
        return this._bufferType;
    }
    /**
     * Returns `WebGLBuffer` if the buffer is initialized.
     * Otherwise, throws an error.
     * @returns {WebGLBuffer}
     */
    get glBuffer() {
        if (this.isInitialized) {
            return this._glBuffer;
        }
        throw new Error('This buffer is not initialized yet.');
    }
}
/**
 * ArrayBuffer.
 */
export class ArrayBuffer extends BufferBase {
    constructor(args = { dataOrLength: null, attributes: [], dataType: FLOAT, usage: STATIC_DRAW }) {
        super(args, ARRAY_BUFFER);
    }
}
/**
 * ElementArrayBuffer.
 */
export class ElementArrayBuffer extends BufferBase {
    constructor(args = { dataOrLength: null, attributes: [], dataType: UNSIGNED_SHORT, usage: STATIC_DRAW }) {
        super(args, ELEMENT_ARRAY_BUFFER);
    }
}
/**
 * UniformBuffer.
 */
export class UniformBuffer extends BufferBase {
    constructor(args = { dataOrLength: null, dataType: UNSIGNED_SHORT, usage: STATIC_DRAW }) {
        super(args, UNIFORM_BUFFER);
    }
}
