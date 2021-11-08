import {createReducer, on} from '@ngrx/store';
import {ICoreAiUserImageModel} from '../../model/orc-card.model';
import {removeUserImage, updateUserImage} from '../action/core-ai-user.action';

export const initialState: ICoreAiUserImageModel = null;

const _coreAiUserReducer = createReducer(
	initialState,
	on(updateUserImage, (state, coreAiUserImageModel: ICoreAiUserImageModel) => ({
		...state,
		face: coreAiUserImageModel.face,
		frontCard: coreAiUserImageModel.frontCard,
		backCard: coreAiUserImageModel.backCard,
		fingerPrint: coreAiUserImageModel.fingerPrint,
		signature: coreAiUserImageModel.signature
	})),
	on(removeUserImage, (state) => null)
);

export function coreAiUserReducer(state, action) {
	return _coreAiUserReducer(state, action);
}
