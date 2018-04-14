import { TRANSFORM_FEEDBACK, TRANSFORM_FEEDBACK_BUFFER } from './constants';
export class TransformFeedback {
    constructor() {
        this._glContext = null;
        this._glTransformFeedback = null;
    }
    feedback(args) {
        if (this._glContext === null) {
            throw new Error('This transform feedback is not added to any WebGL2 yet.');
        }
        for (let i = 0; i < args.targetBuffers.length; i += 1) {
            this._glContext.bindBufferBase(TRANSFORM_FEEDBACK_BUFFER, i, args.targetBuffers[i].glBuffer);
        }
        this._glContext.beginTransformFeedback(args.mode);
        this._glContext.drawArrays(args.mode, 0, args.count);
        this._glContext.endTransformFeedback();
        for (let i = 0; i < args.targetBuffers.length; i += 1) {
            this._glContext.bindBufferBase(TRANSFORM_FEEDBACK_BUFFER, i, null);
        }
    }
    _init(context) {
        this._glContext = context;
        this._glTransformFeedback = context.createTransformFeedback();
        context.bindTransformFeedback(TRANSFORM_FEEDBACK, this._glTransformFeedback);
    }
}
