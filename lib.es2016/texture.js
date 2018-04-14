import { TEXTURE_2D, RGBA, UNSIGNED_BYTE, TEXTURE0 } from './constants';
export class TextureBase {
    _getTextureIdFromNumber(n) {
        return TEXTURE0 + n;
    }
}
export class Texture2D extends TextureBase {
    constructor(dataSource, options = {}) {
        super();
        this._source = dataSource;
        this._glContext = null;
        this._glTexture = null;
        this._textureID = null;
        this._target = ('target' in options) ? options.target : TEXTURE_2D;
        this._mipmapLevel = ('mipmapLevel' in options) ? options.mipmapLevel : 0;
        this._internalFormat = ('internalFormat' in options) ? options.internalFormat : RGBA;
        this._format = ('format' in options) ? options.mipmapLevel : RGBA;
        this._dataType = ('dataType' in options) ? options.mipmapLevel : UNSIGNED_BYTE;
        this._width = ('width' in options) ? options.width : undefined;
        this._height = ('height' in options) ? options.height : undefined;
        this._flushData = () => { };
    }
    activate() {
        this._flushData = (context) => {
            context.activeTexture(this._textureID);
        };
    }
    _init(context, textureNumber) {
        this._glContext = context;
        this._textureID = this._getTextureIdFromNumber(textureNumber);
        context.activeTexture(this._textureID);
        this._glTexture = context.createTexture();
        context.bindTexture(this._target, this._glTexture);
        if (typeof this._width === 'undefined' || typeof this._height === 'undefined') {
            context.texImage2D(this._target, this._mipmapLevel, this._internalFormat, this._format, this._dataType, this._source);
        }
        else {
            context.texImage2D(this._target, this._mipmapLevel, this._internalFormat, this._width, this._height, 0, this._format, this._dataType, this._source);
        }
        context.generateMipmap(this._target);
        this._flush();
    }
    _flush() {
        if (this._glContext !== null) {
            this._flushData(this._glContext);
            this._flushData = () => { };
        }
    }
}
