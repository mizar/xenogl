import { FLOAT, INT, UNSIGNED_INT } from './constants';
/**
 * An attribute variable.
 */
export class Attribute {
    constructor(name, size) {
        this._name = name;
        this._size = size;
    }
    equals(other) {
        return this.name === other.name && this.size === other.size;
    }
    get name() {
        return this._name;
    }
    get size() {
        return this._size;
    }
}
/**
 * An uniform variable.
 */
export class Uniform {
    constructor(name) {
        this._name = name;
        this._location = null;
        this._glContext = null;
        this._glProgram = null;
        this._flushData = (context, location) => { };
    }
    /**
     * Sets the uniform variable to the value.
     * @param {number} value
     * @param {number} type
     */
    setValue(value, type) {
        if (type === FLOAT) {
            this._flushData = (context, location) => {
                context.uniform1f(location, value);
            };
        }
        else if (type === INT) {
            this._flushData = (context, location) => {
                context.uniform1i(location, value);
            };
        }
        else if (type === UNSIGNED_INT) {
            this._flushData = (context, location) => {
                context.uniform1ui(location, value);
            };
        }
        this._flush();
    }
    /**
     * Sets the uniform variable to the vector.
     * @param {TypedArrayLike} value
     * @param {number} type
     */
    setVector(value, type) {
        const length = value.length;
        if (length === 1) {
            this.setVector1(value, type);
        }
        else if (length === 2) {
            this.setVector2(value, type);
        }
        else if (length === 3) {
            this.setVector3(value, type);
        }
        else if (length === 4) {
            this.setVector4(value, type);
        }
        else {
            throw new Error(`Length of value must be 1, 2, 3 or 4. Your value length is ${length}`);
        }
    }
    setVector1(value, type) {
        if (type === FLOAT) {
            this._flushData = (context, location) => {
                context.uniform1fv(location, value);
            };
        }
        else if (type === INT) {
            this._flushData = (context, location) => {
                context.uniform1iv(location, value);
            };
        }
        else if (type === UNSIGNED_INT) {
            this._flushData = (context, location) => {
                context.uniform1uiv(location, value);
            };
        }
        this._flush();
    }
    setVector2(value, type) {
        if (type === FLOAT) {
            this._flushData = (context, location) => {
                context.uniform2fv(location, value);
            };
        }
        else if (type === INT) {
            this._flushData = (context, location) => {
                context.uniform2iv(location, value);
            };
        }
        else if (type === UNSIGNED_INT) {
            this._flushData = (context, location) => {
                context.uniform2uiv(location, value);
            };
        }
        this._flush();
    }
    setVector3(value, type) {
        if (type === FLOAT) {
            this._flushData = (context, location) => {
                context.uniform3fv(location, value);
            };
        }
        else if (type === INT) {
            this._flushData = (context, location) => {
                context.uniform3iv(location, value);
            };
        }
        else if (type === UNSIGNED_INT) {
            this._flushData = (context, location) => {
                context.uniform3uiv(location, value);
            };
        }
        this._flush();
    }
    setVector4(value, type) {
        if (type === FLOAT) {
            this._flushData = (context, location) => {
                context.uniform4fv(location, value);
            };
        }
        else if (type === INT) {
            this._flushData = (context, location) => {
                context.uniform4iv(location, value);
            };
        }
        else if (type === UNSIGNED_INT) {
            this._flushData = (context, location) => {
                context.uniform4uiv(location, value);
            };
        }
        this._flush();
    }
    /**
     * Sets the uniform variable to the matrix.
     * @param {Float32Array} value
     */
    setMatrix(value) {
        const size = value.length;
        if (size === 4) {
            this.setMatrix2(value);
        }
        else if (size === 9) {
            this.setMatrix3(value);
        }
        else if (size === 16) {
            this.setMatrix4(value);
        }
        else {
            throw new Error(`Failed to detect size of the matrix. If you use a non-square matrix, use setMatrixNxN instead.`);
        }
    }
    setMatrix2(value) {
        this._flushData = (context, location) => {
            context.uniformMatrix2fv(location, false, value);
        };
        this._flush();
    }
    setMatrix3(value) {
        this._flushData = (context, location) => {
            context.uniformMatrix3fv(location, false, value);
        };
        this._flush();
    }
    setMatrix4(value) {
        this._flushData = (context, location) => {
            context.uniformMatrix4fv(location, false, value);
        };
        this._flush();
    }
    _flush() {
        if (this.isLocated && this._glContext !== null) {
            this._flushData(this._glContext, this._location);
        }
    }
    _init(context, program) {
        this._location = context.getUniformLocation(program, this._name);
        this._glContext = context;
        this._glProgram = program;
        this._flush();
    }
    get isLocated() {
        return this._location !== null;
    }
}
