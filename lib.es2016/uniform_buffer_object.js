import { UniformBuffer } from './buffer';
import { FLOAT, STATIC_DRAW, UNIFORM_BUFFER } from './constants';
/**
 * An uniform buffer object.
 */
export class UniformBufferObject {
    constructor(blockName, bufferOrBufferArgs = { dataOrLength: null, dataType: FLOAT, usage: STATIC_DRAW }) {
        this._blockName = blockName;
        this._blockIndex = null;
        this._javascriptIndex = null;
        this._isInitialized = false;
        if (bufferOrBufferArgs instanceof UniformBuffer) {
            this._buffer = bufferOrBufferArgs;
        }
        else {
            this._buffer = new UniformBuffer(bufferOrBufferArgs);
        }
    }
    /**
     * Initializes the uniform buffer object.
     * Do not call this method manually.
     * @param {WebGL2RenderingContext} context
     * @param {WebGLProgram} program
     * @param {number} jsIndex
     * @private
     */
    _init(context, program, jsIndex) {
        this._blockIndex = context.getUniformBlockIndex(program, this._blockName);
        this._javascriptIndex = jsIndex;
        context.uniformBlockBinding(program, this._blockIndex, jsIndex);
        this._buffer._initOnce(context, program);
        context.bindBufferBase(UNIFORM_BUFFER, jsIndex, this._buffer.glBuffer);
    }
}
